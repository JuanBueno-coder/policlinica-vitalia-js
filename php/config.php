<?php
// Datos de conexion a la base de datos
// el servidor es "db" porque asi se llama el servicio de mysql en el docker-compose.yml
$servidor = "db";
$usuario = "vitalia";
$password = "Vitalia2026";
$baseDatos = "policlinica_vitalia";

try {
    $conexion = new PDO("mysql:host=$servidor;dbname=$baseDatos;charset=utf8mb4", $usuario, $password);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["exito" => false, "mensaje" => "No se puede conectar con la base de datos", "datos" => []]);
    exit();
}
