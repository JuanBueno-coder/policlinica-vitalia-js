<?php
// Datos de conexion a la base de datos
// - En docker: el servidor es "db" (el servicio de mysql del docker-compose.yml)
// - En internet: la base de datos esta en alwaysdata
if (getenv("ENTORNO") == "docker") {
    $servidor = "db";
    $usuario = "vitalia";
    $password = "Vitalia2026";
    $baseDatos = "policlinica_vitalia";
} else {
    $servidor = "mysql-vitaliajs.alwaysdata.net";
    $usuario = "vitaliajs_app";
    $password = "d3UhB%^UlMw1GX";
    $baseDatos = "vitaliajs_policlinica";
}

try {
    $conexion = new PDO("mysql:host=$servidor;dbname=$baseDatos;charset=utf8mb4", $usuario, $password);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["exito" => false, "mensaje" => "No se puede conectar con la base de datos", "datos" => []]);
    exit();
}
