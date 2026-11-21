<?php
// Gestion de pruebas
// Responsable: Juan Antonio Bueno Rodríguez

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
        return "Ya existe esa prueba";
    } else if ($codigo == 1451) {
        return "No se puede borrar porque tiene datos asociados";
    } else if ($codigo == 1452) {
        return "El valor elegido en el desplegable no existe";
    }
    return "Error en la base de datos";
}

function alta($conexion)
{
    $idCita = trim($_POST["id_cita"] ?? "");
    $tipo = trim($_POST["tipo"] ?? "");
    $fechaRealizacion = trim($_POST["fecha_realizacion"] ?? "");
    $coste = str_replace(",", ".", $_POST["coste"] ?? "");
    $resultado = trim($_POST["resultado"] ?? "");
    $urgente = ($_POST["urgente"] ?? "0") == "1" ? 1 : 0;

    if ($idCita == "" || $tipo == "" || $fechaRealizacion == "" || $coste == "" || $resultado == "") {
        responder(false, "Rellena todos los campos");
    }
    if (!is_numeric($coste)) {
        responder(false, "El campo Coste (€) tiene que ser un número");
    }

    try {
        $sql = "INSERT INTO pruebas (id_cita, tipo, fecha_realizacion, coste, resultado, urgente) VALUES (?, ?, ?, ?, ?, ?)";
        $consulta = $conexion->prepare($sql);
        $consulta->execute([$idCita, $tipo, $fechaRealizacion, $coste, $resultado, $urgente]);
        responder(true, "Prueba dada de alta con el código " . $conexion->lastInsertId());
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

    $sql = "SELECT pr.*, p.nombre AS paciente FROM pruebas pr INNER JOIN citas c ON pr.id_cita = c.id_cita INNER JOIN pacientes p ON c.id_paciente = p.id_paciente WHERE pr.tipo LIKE ? OR p.nombre LIKE ? ORDER BY pr.fecha_realizacion DESC";
    $consulta = $conexion->prepare($sql);
    $consulta->execute(["%$texto%", "%$texto%"]);
    $lista = $consulta->fetchAll(PDO::FETCH_ASSOC);

    responder(true, count($lista) . " resultado(s)", $lista);
}

function modificar($conexion)
{
    $id = $_POST["id_prueba"] ?? "";
    $idCita = trim($_POST["id_cita"] ?? "");
    $tipo = trim($_POST["tipo"] ?? "");
    $fechaRealizacion = trim($_POST["fecha_realizacion"] ?? "");
    $coste = str_replace(",", ".", $_POST["coste"] ?? "");
    $resultado = trim($_POST["resultado"] ?? "");
    $urgente = ($_POST["urgente"] ?? "0") == "1" ? 1 : 0;

    if ($id == "" || $idCita == "" || $tipo == "" || $fechaRealizacion == "" || $coste == "" || $resultado == "") {
        responder(false, "Rellena todos los campos");
    }
    if (!is_numeric($coste)) {
        responder(false, "El campo Coste (€) tiene que ser un número");
    }

    try {
        $sql = "UPDATE pruebas SET id_cita = ?, tipo = ?, fecha_realizacion = ?, coste = ?, resultado = ?, urgente = ? WHERE id_prueba = ?";
        $consulta = $conexion->prepare($sql);
        $consulta->execute([$idCita, $tipo, $fechaRealizacion, $coste, $resultado, $urgente, $id]);
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
            responder(false, "Elige una prueba para borrar");
        }
        $sql = "DELETE FROM pruebas WHERE id_prueba = ?";
        $parametro = $id;
    } else {
        responder(false, "Criterio de borrado no valido");
    }

    try {
        $consulta = $conexion->prepare($sql);
        $consulta->execute([$parametro]);
        if ($consulta->rowCount() == 0) {
            responder(false, "No se ha encontrado ningún registro con ese valor");
        }
        responder(true, "Prueba borrada correctamente");
    } catch (PDOException $e) {
        responder(false, errorBD($e));
    }
}

function listar($conexion)
{
    $sql = "SELECT pr.*, p.nombre AS paciente FROM pruebas pr INNER JOIN citas c ON pr.id_cita = c.id_cita INNER JOIN pacientes p ON c.id_paciente = p.id_paciente ORDER BY pr.fecha_realizacion DESC";
    $consulta = $conexion->query($sql);
    responder(true, "", $consulta->fetchAll(PDO::FETCH_ASSOC));
}

function filtrar($conexion)
{
    $condiciones = [];
    $parametros = [];

    if (isset($_POST["tipo"]) && $_POST["tipo"] != "") {
        $condiciones[] = "pr.tipo LIKE ?";
        $parametros[] = "%" . $_POST["tipo"] . "%";
    }
    if (isset($_POST["urgente"]) && $_POST["urgente"] != "") {
        $condiciones[] = "pr.urgente = ?";
        $parametros[] = $_POST["urgente"];
    }
    if (isset($_POST["coste_max"]) && $_POST["coste_max"] != "") {
        $condiciones[] = "pr.coste <= ?";
        $parametros[] = $_POST["coste_max"];
    }
    if (isset($_POST["desde"]) && $_POST["desde"] != "") {
        $condiciones[] = "pr.fecha_realizacion >= ?";
        $parametros[] = $_POST["desde"];
    }
    if (isset($_POST["hasta"]) && $_POST["hasta"] != "") {
        $condiciones[] = "pr.fecha_realizacion <= ?";
        $parametros[] = $_POST["hasta"];
    }

    $sql = "SELECT pr.*, p.nombre AS paciente FROM pruebas pr INNER JOIN citas c ON pr.id_cita = c.id_cita INNER JOIN pacientes p ON c.id_paciente = p.id_paciente";
    if (count($condiciones) > 0) {
        $sql .= " WHERE " . implode(" AND ", $condiciones);
    }
    $sql .= " ORDER BY pr.fecha_realizacion DESC";

    $consulta = $conexion->prepare($sql);
    $consulta->execute($parametros);
    $lista = $consulta->fetchAll(PDO::FETCH_ASSOC);
    responder(true, count($lista) . " resultado(s)", $lista);
}
