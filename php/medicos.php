<?php
// Gestion de medicos
// Responsable: Alejandro Gómez Izquierdo

header("Content-Type: application/json; charset=utf-8");
require_once "config.php";

$accion = $_POST["accion"] ?? "";

switch ($accion) {
    case "alta":
        alta($conexion);
        break;
    case "buscar":
        buscar($conexion);
        break;
    case "modificar":
        modificar($conexion);
        break;
    case "borrar":
        borrar($conexion);
        break;
    case "listar":
        listar($conexion);
        break;
    case "filtrar":
        filtrar($conexion);
        break;
    default:
        responder(false, "Acción no válida");
}

function responder($exito, $mensaje, $datos = null)
{
    echo json_encode(["exito" => $exito, "mensaje" => $mensaje, "datos" => $datos]);
    exit();
}

// mensaje de error segun el codigo de mysql
function errorBD($e)
{
    $codigo = $e->errorInfo[1];
    if ($codigo == 1062) {
        return "Ya existe un médico con ese número de colegiado";
    } else if ($codigo == 1451) {
        return "No se puede borrar porque tiene citas asociadas";
    } else if ($codigo == 1452) {
        return "El valor elegido en el desplegable no existe";
    }
    return "Error en la base de datos";
}

function alta($conexion)
{
    $nombre = trim($_POST["nombre"] ?? "");
    $numColegiado = trim($_POST["num_colegiado"] ?? "");
    $idEspecialidad = trim($_POST["id_especialidad"] ?? "");
    $turno = trim($_POST["turno"] ?? "");
    $aniosExperiencia = trim($_POST["anios_experiencia"] ?? "");
    $fechaAlta = trim($_POST["fecha_alta"] ?? "");
    $enActivo = ($_POST["en_activo"] ?? "0") == "1" ? 1 : 0;

    if ($nombre == "" || $numColegiado == "" || $idEspecialidad == "" || $turno == "" || $aniosExperiencia == "" || $fechaAlta == "") {
        responder(false, "Rellena todos los campos");
    }
    if (!is_numeric($aniosExperiencia)) {
        responder(false, "El campo Años de experiencia tiene que ser un número");
    }

    try {
        $sql = "INSERT INTO medicos (nombre, num_colegiado, id_especialidad, turno, anios_experiencia, fecha_alta, en_activo) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $consulta = $conexion->prepare($sql);
        $consulta->execute([$nombre, $numColegiado, $idEspecialidad, $turno, $aniosExperiencia, $fechaAlta, $enActivo]);
        responder(true, "Médico dado de alta con el código " . $conexion->lastInsertId());
    } catch (PDOException $e) {
        responder(false, errorBD($e));
    }
}

function buscar($conexion)
{
    $texto = trim($_POST["texto"] ?? "");
    if ($texto == "") {
        responder(false, "Escribe algo para buscar");
    }

    $sql = "SELECT m.*, e.nombre AS especialidad FROM medicos m INNER JOIN especialidades e ON m.id_especialidad = e.id_especialidad WHERE m.nombre LIKE ? OR m.num_colegiado LIKE ? ORDER BY m.nombre";
    $consulta = $conexion->prepare($sql);
    $consulta->execute(["%$texto%", "%$texto%"]);
    $lista = $consulta->fetchAll(PDO::FETCH_ASSOC);

    responder(true, count($lista) . " resultado(s)", $lista);
}

function modificar($conexion)
{
    $id = $_POST["id_medico"] ?? "";
    $nombre = trim($_POST["nombre"] ?? "");
    $numColegiado = trim($_POST["num_colegiado"] ?? "");
    $idEspecialidad = trim($_POST["id_especialidad"] ?? "");
    $turno = trim($_POST["turno"] ?? "");
    $aniosExperiencia = trim($_POST["anios_experiencia"] ?? "");
    $fechaAlta = trim($_POST["fecha_alta"] ?? "");
    $enActivo = ($_POST["en_activo"] ?? "0") == "1" ? 1 : 0;

    if ($id == "" || $nombre == "" || $numColegiado == "" || $idEspecialidad == "" || $turno == "" || $aniosExperiencia == "" || $fechaAlta == "") {
        responder(false, "Rellena todos los campos");
    }
    if (!is_numeric($aniosExperiencia)) {
        responder(false, "El campo Años de experiencia tiene que ser un número");
    }

    try {
        $sql = "UPDATE medicos SET nombre = ?, num_colegiado = ?, id_especialidad = ?, turno = ?, anios_experiencia = ?, fecha_alta = ?, en_activo = ? WHERE id_medico = ?";
        $consulta = $conexion->prepare($sql);
        $consulta->execute([$nombre, $numColegiado, $idEspecialidad, $turno, $aniosExperiencia, $fechaAlta, $enActivo, $id]);
        responder(true, "Cambios guardados correctamente");
    } catch (PDOException $e) {
        responder(false, errorBD($e));
    }
}

function borrar($conexion)
{
    $criterio = $_POST["criterio"] ?? "id";

    if ($criterio == "id") {
        $id = $_POST["id"] ?? "";
        if ($id == "") {
            responder(false, "Elige un médico para borrar");
        }
        $sql = "DELETE FROM medicos WHERE id_medico = ?";
        $parametro = $id;
    } else {
        // borrar por nº de colegiado
        $valor = trim($_POST["valor"] ?? "");
        if ($valor == "") {
            responder(false, "Escribe el nº de colegiado");
        }
        $sql = "DELETE FROM medicos WHERE num_colegiado = ?";
        $parametro = $valor;
    }

    try {
        $consulta = $conexion->prepare($sql);
        $consulta->execute([$parametro]);
        if ($consulta->rowCount() == 0) {
            responder(false, "No se ha encontrado ningún registro con ese valor");
        }
        responder(true, "Médico borrado correctamente");
    } catch (PDOException $e) {
        responder(false, errorBD($e));
    }
}

function listar($conexion)
{
    // $sql = "SELECT * FROM medicos"; // asi no salia el nombre de la especialidad
    $sql = "SELECT m.*, e.nombre AS especialidad FROM medicos m INNER JOIN especialidades e ON m.id_especialidad = e.id_especialidad ORDER BY m.nombre";
    $consulta = $conexion->query($sql);
    responder(true, "", $consulta->fetchAll(PDO::FETCH_ASSOC));
}

function filtrar($conexion)
{
    $condiciones = [];
    $parametros = [];

    if (isset($_POST["id_especialidad"]) && $_POST["id_especialidad"] != "") {
        $condiciones[] = "m.id_especialidad = ?";
        $parametros[] = $_POST["id_especialidad"];
    }
    if (isset($_POST["turno"]) && $_POST["turno"] != "") {
        $condiciones[] = "m.turno = ?";
        $parametros[] = $_POST["turno"];
    }
    if (isset($_POST["en_activo"]) && $_POST["en_activo"] != "") {
        $condiciones[] = "m.en_activo = ?";
        $parametros[] = $_POST["en_activo"];
    }
    if (isset($_POST["experiencia_min"]) && $_POST["experiencia_min"] != "") {
        $condiciones[] = "m.anios_experiencia >= ?";
        $parametros[] = $_POST["experiencia_min"];
    }

    $sql = "SELECT m.*, e.nombre AS especialidad FROM medicos m INNER JOIN especialidades e ON m.id_especialidad = e.id_especialidad";
    if (count($condiciones) > 0) {
        $sql .= " WHERE " . implode(" AND ", $condiciones);
    }
    $sql .= " ORDER BY m.nombre";

    $consulta = $conexion->prepare($sql);
    $consulta->execute($parametros);
    $lista = $consulta->fetchAll(PDO::FETCH_ASSOC);
    responder(true, count($lista) . " resultado(s)", $lista);
}
