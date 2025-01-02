# Usar la imagen base de ubuntu
FROM ubuntu:latest

# Actualizar e instalar Apache, Node.js y npm
RUN apt update -y && \
    apt install -y apache2 && \
    # Instalar Node.js
    apt install -y nodejs && \
    # Instalar npm
    apt install -y npm && \
    # Instalar nano
    apt install nano -y && \
    # Limpiar los archivos de cache de apt para reducir el tamaño de la imagen
    apt clean

# Copia los archivos de tu página web al contenedor
COPY ./index.html /var/www/html
COPY ./Pagina/* /var/www/html/Pagina

# Expone el puerto 80 para Apache
EXPOSE 80