<?php
// Gestion de citas
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
        return "Ya existe esa cita";
    } else if ($codigo == 1451) {
        return "No se puede borrar porque tiene pruebas asociadas";
    } else if ($codigo == 1452) {
        return "El valor elegido en el desplegable no existe";
    }
    return "Error en la base de datos";
}

function alta($conexion)
{
    $idPaciente = trim($_POST["id_paciente"] ?? "");
    $idMedico = trim($_POST["id_medico"] ?? "");
    $fechaHora = str_replace("T", " ", $_POST["fecha_hora"] ?? "");
    $duracionMin = trim($_POST["duracion_min"] ?? "");
    $motivo = trim($_POST["motivo"] ?? "");
    $atendida = ($_POST["atendida"] ?? "0") == "1" ? 1 : 0;

    if ($idPaciente == "" || $idMedico == "" || $fechaHora == "" || $duracionMin == "" || $motivo == "") {
        responder(false, "Rellena todos los campos");
    }
    if (!is_numeric($duracionMin)) {
        responder(false, "El campo Duración (min) tiene que ser un número");
    }

    try {
        $sql = "INSERT INTO citas (id_paciente, id_medico, fecha_hora, duracion_min, motivo, atendida) VALUES (?, ?, ?, ?, ?, ?)";
        $consulta = $conexion->prepare($sql);
        $consulta->execute([$idPaciente, $idMedico, $fechaHora, $duracionMin, $motivo, $atendida]);
        responder(true, "Cita dada de alta con el código " . $conexion->lastInsertId());
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

    $sql = "SELECT c.*, p.nombre AS paciente, m.nombre AS medico FROM citas c INNER JOIN pacientes p ON c.id_paciente = p.id_paciente INNER JOIN medicos m ON c.id_medico = m.id_medico WHERE p.nombre LIKE ? OR p.dni LIKE ? OR c.motivo LIKE ? ORDER BY c.fecha_hora DESC";
    $consulta = $conexion->prepare($sql);
    $consulta->execute(["%$texto%", "%$texto%", "%$texto%"]);
    $lista = $consulta->fetchAll(PDO::FETCH_ASSOC);

    responder(true, count($lista) . " resultado(s)", $lista);
}

function modificar($conexion)
{
    $id = $_POST["id_cita"] ?? "";
    $idPaciente = trim($_POST["id_paciente"] ?? "");
    $idMedico = trim($_POST["id_medico"] ?? "");
    $fechaHora = str_replace("T", " ", $_POST["fecha_hora"] ?? "");
    $duracionMin = trim($_POST["duracion_min"] ?? "");
    $motivo = trim($_POST["motivo"] ?? "");
    $atendida = ($_POST["atendida"] ?? "0") == "1" ? 1 : 0;

    if ($id == "" || $idPaciente == "" || $idMedico == "" || $fechaHora == "" || $duracionMin == "" || $motivo == "") {
        responder(false, "Rellena todos los campos");
    }
    if (!is_numeric($duracionMin)) {
        responder(false, "El campo Duración (min) tiene que ser un número");
    }

    try {
        $sql = "UPDATE citas SET id_paciente = ?, id_medico = ?, fecha_hora = ?, duracion_min = ?, motivo = ?, atendida = ? WHERE id_cita = ?";
        $consulta = $conexion->prepare($sql);
        $consulta->execute([$idPaciente, $idMedico, $fechaHora, $duracionMin, $motivo, $atendida, $id]);
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
            responder(false, "Elige una cita para borrar");
        }
        $sql = "DELETE FROM citas WHERE id_cita = ?";
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
        responder(true, "Cita borrada correctamente");
    } catch (PDOException $e) {
        responder(false, errorBD($e));
    }
}

function listar($conexion)
{
    $sql = "SELECT c.*, p.nombre AS paciente, m.nombre AS medico FROM citas c INNER JOIN pacientes p ON c.id_paciente = p.id_paciente INNER JOIN medicos m ON c.id_medico = m.id_medico ORDER BY c.fecha_hora DESC";
    $consulta = $conexion->query($sql);
    responder(true, "", $consulta->fetchAll(PDO::FETCH_ASSOC));
}

function filtrar($conexion)
{
    $condiciones = [];
    $parametros = [];

    if (isset($_POST["id_medico"]) && $_POST["id_medico"] != "") {
        $condiciones[] = "c.id_medico = ?";
        $parametros[] = $_POST["id_medico"];
    }
    if (isset($_POST["id_paciente"]) && $_POST["id_paciente"] != "") {
        $condiciones[] = "c.id_paciente = ?";
        $parametros[] = $_POST["id_paciente"];
    }
    if (isset($_POST["atendida"]) && $_POST["atendida"] != "") {
        $condiciones[] = "c.atendida = ?";
        $parametros[] = $_POST["atendida"];
    }
    if (isset($_POST["desde"]) && $_POST["desde"] != "") {
        $condiciones[] = "DATE(c.fecha_hora) >= ?";
        $parametros[] = $_POST["desde"];
    }
    if (isset($_POST["hasta"]) && $_POST["hasta"] != "") {
        $condiciones[] = "DATE(c.fecha_hora) <= ?";
        $parametros[] = $_POST["hasta"];
    }

    $sql = "SELECT c.*, p.nombre AS paciente, m.nombre AS medico FROM citas c INNER JOIN pacientes p ON c.id_paciente = p.id_paciente INNER JOIN medicos m ON c.id_medico = m.id_medico";
    if (count($condiciones) > 0) {
        $sql .= " WHERE " . implode(" AND ", $condiciones);
    }
    $sql .= " ORDER BY c.fecha_hora DESC";

    $consulta = $conexion->prepare($sql);
    $consulta->execute($parametros);
    $lista = $consulta->fetchAll(PDO::FETCH_ASSOC);
    responder(true, count($lista) . " resultado(s)", $lista);
}
