<?php
// Gestion de especialidades
// Responsable: Gabriel Vigo Rodríguez

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
        return "Ya existe una especialidad con ese nombre";
    } else if ($codigo == 1451) {
        return "No se puede borrar porque tiene médicos asociados";
    } else if ($codigo == 1452) {
        return "El valor elegido en el desplegable no existe";
    }
    return "Error en la base de datos";
}

function alta($conexion)
{
    $nombre = trim($_POST["nombre"] ?? "");
    $idPlanta = trim($_POST["id_planta"] ?? "");
    $numConsultas = trim($_POST["num_consultas"] ?? "");
    $fechaApertura = trim($_POST["fecha_apertura"] ?? "");
    $activa = ($_POST["activa"] ?? "0") == "1" ? 1 : 0;

    if ($nombre == "" || $idPlanta == "" || $numConsultas == "" || $fechaApertura == "") {
        responder(false, "Rellena todos los campos");
    }
    if (!is_numeric($numConsultas)) {
        responder(false, "El campo Nº de consultas tiene que ser un número");
    }

    try {
        $sql = "INSERT INTO especialidades (nombre, id_planta, num_consultas, fecha_apertura, activa) VALUES (?, ?, ?, ?, ?)";
        $consulta = $conexion->prepare($sql);
        $consulta->execute([$nombre, $idPlanta, $numConsultas, $fechaApertura, $activa]);
        responder(true, "Especialidad dada de alta con el código " . $conexion->lastInsertId());
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

    $sql = "SELECT e.*, p.nombre AS planta FROM especialidades e INNER JOIN plantas p ON e.id_planta = p.id_planta WHERE e.nombre LIKE ? ORDER BY e.nombre";
    $consulta = $conexion->prepare($sql);
    $consulta->execute(["%$texto%"]);
    $lista = $consulta->fetchAll(PDO::FETCH_ASSOC);

    responder(true, count($lista) . " resultado(s)", $lista);
}

function modificar($conexion)
{
    $id = $_POST["id_especialidad"] ?? "";
    $nombre = trim($_POST["nombre"] ?? "");
    $idPlanta = trim($_POST["id_planta"] ?? "");
    $numConsultas = trim($_POST["num_consultas"] ?? "");
    $fechaApertura = trim($_POST["fecha_apertura"] ?? "");
    $activa = ($_POST["activa"] ?? "0") == "1" ? 1 : 0;

    if ($id == "" || $nombre == "" || $idPlanta == "" || $numConsultas == "" || $fechaApertura == "") {
        responder(false, "Rellena todos los campos");
    }
    if (!is_numeric($numConsultas)) {
        responder(false, "El campo Nº de consultas tiene que ser un número");
    }

    try {
        $sql = "UPDATE especialidades SET nombre = ?, id_planta = ?, num_consultas = ?, fecha_apertura = ?, activa = ? WHERE id_especialidad = ?";
        $consulta = $conexion->prepare($sql);
        $consulta->execute([$nombre, $idPlanta, $numConsultas, $fechaApertura, $activa, $id]);
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
            responder(false, "Elige una especialidad para borrar");
        }
        $sql = "DELETE FROM especialidades WHERE id_especialidad = ?";
        $parametro = $id;
    } else {
        // borrar por nombre exacto
        $valor = trim($_POST["valor"] ?? "");
        if ($valor == "") {
            responder(false, "Escribe el nombre exacto");
        }
        $sql = "DELETE FROM especialidades WHERE nombre = ?";
        $parametro = $valor;
    }

    try {
        $consulta = $conexion->prepare($sql);
        $consulta->execute([$parametro]);
        if ($consulta->rowCount() == 0) {
            responder(false, "No se ha encontrado ningún registro con ese valor");
        }
        responder(true, "Especialidad borrada correctamente");
    } catch (PDOException $e) {
        responder(false, errorBD($e));
    }
}

function listar($conexion)
{
    $sql = "SELECT e.*, p.nombre AS planta FROM especialidades e INNER JOIN plantas p ON e.id_planta = p.id_planta ORDER BY e.nombre";
    $consulta = $conexion->query($sql);
    responder(true, "", $consulta->fetchAll(PDO::FETCH_ASSOC));
}

function filtrar($conexion)
{
    $condiciones = [];
    $parametros = [];

    if (isset($_POST["id_planta"]) && $_POST["id_planta"] != "") {
        $condiciones[] = "e.id_planta = ?";
        $parametros[] = $_POST["id_planta"];
    }
    if (isset($_POST["activa"]) && $_POST["activa"] != "") {
        $condiciones[] = "e.activa = ?";
        $parametros[] = $_POST["activa"];
    }
    if (isset($_POST["consultas_min"]) && $_POST["consultas_min"] != "") {
        $condiciones[] = "e.num_consultas >= ?";
        $parametros[] = $_POST["consultas_min"];
    }

    $sql = "SELECT e.*, p.nombre AS planta FROM especialidades e INNER JOIN plantas p ON e.id_planta = p.id_planta";
    if (count($condiciones) > 0) {
        $sql .= " WHERE " . implode(" AND ", $condiciones);
    }
    $sql .= " ORDER BY e.nombre";

    $consulta = $conexion->prepare($sql);
    $consulta->execute($parametros);
    $lista = $consulta->fetchAll(PDO::FETCH_ASSOC);
    responder(true, count($lista) . " resultado(s)", $lista);
}
