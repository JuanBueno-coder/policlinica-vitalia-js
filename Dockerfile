# Imagen de PHP con Apache
FROM php:8.2-apache

# extension para conectar PHP con MySQL usando PDO
RUN docker-php-ext-install pdo pdo_mysql

# copiamos el proyecto a la carpeta de Apache
COPY . /var/www/html/

EXPOSE 80
