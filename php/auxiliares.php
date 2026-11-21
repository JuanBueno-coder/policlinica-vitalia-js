<?php
// Devuelve las plantas o las aseguradoras para rellenar los desplegables
header("Content-Type: application/json; charset=utf-8");
require_once "config.php";

$tabla = $_POST['tabla'] ?? '';

if ($tabla == "plantas") {
    $sql = "SELECT id_planta AS id, nombre FROM plantas ORDER BY numero, nombre";
} else if ($tabla == "aseguradoras") {
    $sql = "SELECT id_aseguradora AS id, nombre FROM aseguradoras ORDER BY nombre";
} else {
    echo json_encode(["exito" => false, "mensaje" => "Tabla no valida", "datos" => []]);
    exit();
}

$consulta = $conexion->query($sql);
echo json_encode(["exito" => true, "mensaje" => "", "datos" => $consulta->fetchAll(PDO::FETCH_ASSOC)]);
