<?php
// Gestion de pacientes
// Responsable: David Jiménez Martín
// el DNI se guarda siempre en mayusculas

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
        return "Ya existe un paciente con ese DNI";
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
    $dni = trim($_POST["dni"] ?? "");
    $telefono = trim($_POST["telefono"] ?? "");
    $idAseguradora = trim($_POST["id_aseguradora"] ?? "");
    $pesoKg = str_replace(",", ".", $_POST["peso_kg"] ?? "");
    $fechaNacimiento = trim($_POST["fecha_nacimiento"] ?? "");
    $recordatorioSms = ($_POST["recordatorio_sms"] ?? "0") == "1" ? 1 : 0;
    $dni = strtoupper($dni);

    if ($nombre == "" || $dni == "" || $telefono == "" || $idAseguradora == "" || $pesoKg == "" || $fechaNacimiento == "") {
        responder(false, "Rellena todos los campos");
    }
    if (!is_numeric($pesoKg)) {
        responder(false, "El campo Peso (kg) tiene que ser un número");
    }

    try {
        $sql = "INSERT INTO pacientes (nombre, dni, telefono, id_aseguradora, peso_kg, fecha_nacimiento, recordatorio_sms) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $consulta = $conexion->prepare($sql);
        $consulta->execute([$nombre, $dni, $telefono, $idAseguradora, $pesoKg, $fechaNacimiento, $recordatorioSms]);
        responder(true, "Paciente dado de alta con el código " . $conexion->lastInsertId());
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

    $sql = "SELECT p.*, a.nombre AS aseguradora FROM pacientes p INNER JOIN aseguradoras a ON p.id_aseguradora = a.id_aseguradora WHERE p.nombre LIKE ? OR p.dni LIKE ? ORDER BY p.nombre";
    $consulta = $conexion->prepare($sql);
    $consulta->execute(["%$texto%", "%$texto%"]);
    $lista = $consulta->fetchAll(PDO::FETCH_ASSOC);

    responder(true, count($lista) . " resultado(s)", $lista);
}

function modificar($conexion)
{
    $id = $_POST["id_paciente"] ?? "";
    $nombre = trim($_POST["nombre"] ?? "");
    $dni = trim($_POST["dni"] ?? "");
    $telefono = trim($_POST["telefono"] ?? "");
    $idAseguradora = trim($_POST["id_aseguradora"] ?? "");
    $pesoKg = str_replace(",", ".", $_POST["peso_kg"] ?? "");
    $fechaNacimiento = trim($_POST["fecha_nacimiento"] ?? "");
    $recordatorioSms = ($_POST["recordatorio_sms"] ?? "0") == "1" ? 1 : 0;
    $dni = strtoupper($dni);

    if ($id == "" || $nombre == "" || $dni == "" || $telefono == "" || $idAseguradora == "" || $pesoKg == "" || $fechaNacimiento == "") {
        responder(false, "Rellena todos los campos");
    }
    if (!is_numeric($pesoKg)) {
        responder(false, "El campo Peso (kg) tiene que ser un número");
    }

    try {
        $sql = "UPDATE pacientes SET nombre = ?, dni = ?, telefono = ?, id_aseguradora = ?, peso_kg = ?, fecha_nacimiento = ?, recordatorio_sms = ? WHERE id_paciente = ?";
        $consulta = $conexion->prepare($sql);
        $consulta->execute([$nombre, $dni, $telefono, $idAseguradora, $pesoKg, $fechaNacimiento, $recordatorioSms, $id]);
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
            responder(false, "Elige un paciente para borrar");
        }
        $sql = "DELETE FROM pacientes WHERE id_paciente = ?";
        $parametro = $id;
    } else {
        // borrar por dni
        $valor = trim($_POST["valor"] ?? "");
        if ($valor == "") {
            responder(false, "Escribe el dni");
        }
        $sql = "DELETE FROM pacientes WHERE dni = ?";
        $parametro = $valor;
    }

    try {
        $consulta = $conexion->prepare($sql);
        $consulta->execute([$parametro]);
        if ($consulta->rowCount() == 0) {
            responder(false, "No se ha encontrado ningún registro con ese valor");
        }
        responder(true, "Paciente borrado correctamente");
    } catch (PDOException $e) {
        responder(false, errorBD($e));
    }
}

function listar($conexion)
{
    $sql = "SELECT p.*, a.nombre AS aseguradora FROM pacientes p INNER JOIN aseguradoras a ON p.id_aseguradora = a.id_aseguradora ORDER BY p.nombre";
    $consulta = $conexion->query($sql);
    responder(true, "", $consulta->fetchAll(PDO::FETCH_ASSOC));
}

function filtrar($conexion)
{
    $condiciones = [];
    $parametros = [];

    if (isset($_POST["id_aseguradora"]) && $_POST["id_aseguradora"] != "") {
        $condiciones[] = "p.id_aseguradora = ?";
        $parametros[] = $_POST["id_aseguradora"];
    }
    if (isset($_POST["recordatorio_sms"]) && $_POST["recordatorio_sms"] != "") {
        $condiciones[] = "p.recordatorio_sms = ?";
        $parametros[] = $_POST["recordatorio_sms"];
    }
    if (isset($_POST["nacido_desde"]) && $_POST["nacido_desde"] != "") {
        $condiciones[] = "p.fecha_nacimiento >= ?";
        $parametros[] = $_POST["nacido_desde"];
    }
    if (isset($_POST["nacido_hasta"]) && $_POST["nacido_hasta"] != "") {
        $condiciones[] = "p.fecha_nacimiento <= ?";
        $parametros[] = $_POST["nacido_hasta"];
    }

    $sql = "SELECT p.*, a.nombre AS aseguradora FROM pacientes p INNER JOIN aseguradoras a ON p.id_aseguradora = a.id_aseguradora";
    if (count($condiciones) > 0) {
        $sql .= " WHERE " . implode(" AND ", $condiciones);
    }
    $sql .= " ORDER BY p.nombre";

    $consulta = $conexion->prepare($sql);
    $consulta->execute($parametros);
    $lista = $consulta->fetchAll(PDO::FETCH_ASSOC);
    responder(true, count($lista) . " resultado(s)", $lista);
}
