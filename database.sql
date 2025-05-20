CREATE DATABASE IF NOT EXISTS RutasGastronomicas;
USE RutasGastronomicas;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(100) NOT NULL,
    es_admin BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de lugares (usando Google Place ID)
CREATE TABLE IF NOT EXISTS lugares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    place_id VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    categoria VARCHAR(50),
    ciudad VARCHAR(50)
);

-- Tabla de reseñas
CREATE TABLE IF NOT EXISTS resenas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_lugar INT NOT NULL,
    calificacion INT CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_lugar) REFERENCES lugares(id) ON DELETE CASCADE
);

-- Tabla de favoritos
CREATE TABLE IF NOT EXISTS favoritos (
    id_usuario INT NOT NULL,
    id_lugar INT NOT NULL,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_lugar),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_lugar) REFERENCES lugares(id) ON DELETE CASCADE
);

-- Tabla de lugares visitados
CREATE TABLE IF NOT EXISTS visitados (
    id_usuario INT NOT NULL,
    id_lugar INT NOT NULL,
    fecha_visita TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_lugar),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_lugar) REFERENCES lugares(id) ON DELETE CASCADE
);

-- Historial de eliminaciones
CREATE TABLE IF NOT EXISTS historial_eliminaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_entidad ENUM('usuario','resena','favorito','visitado') NOT NULL,
    id_entidad INT NOT NULL,
    id_usuario INT,
    fecha_eliminacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);
