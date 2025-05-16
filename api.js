require("dotenv").config(); // Cargar variables de entorno desde el archivo .env
const express = require("express");
const fs = require("fs");
const https = require("https");
const http = require("http");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json()); // Middleware para parsear JSON
app.use(cors()); // Middleware para habilitar CORS

// Conexión a la base de datos MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Middleware para verificar el token de autenticación
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Acceso denegado" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token inválido" });
        req.userId = decoded.id;
        next();
    });
};

// Middleware para verificar si el usuario es administrador
const verifyAdmin = (req, res, next) => {
    db.query(
        "SELECT rol FROM Usuarios WHERE id = ?",
        [req.userId],
        (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            if (result.length === 0 || result[0].rol !== "admin") {
                return res.status(403).json({ message: "Acceso denegado, solo administradores pueden realizar esta acción" });
            }
            next();
        }
    );
};

// ======= Gestión de Usuarios =======

// Registro de usuario con asignación automática de rol "admin" al primer usuario
app.post("/usuarios/register", async (req, res) => {
    const { nombre, email, contraseña } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contraseña, salt);

        db.query("SELECT COUNT(*) AS total FROM Usuarios", (err, result) => {
            if (err) return res.status(500).json({ message: err.message });

            const rol = result[0].total === 0 ? "admin" : "usuario"; // El primer usuario será admin

            db.query(
                "INSERT INTO Usuarios (nombre, email, contraseña, rol) VALUES (?, ?, ?, ?)",
                [nombre, email, hashedPassword, rol],
                (err) => {
                    if (err) return res.status(500).json({ message: err.message });
                    res.status(201).json({ message: `Usuario registrado correctamente como ${rol}` });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar datos de usuario (solo propio, excepto admin que puede modificar todos)
app.put("/usuarios/update/:id", verifyToken, (req, res) => {
    const { nombre, email } = req.body;
    const { id } = req.params;

    if (req.userId != id) {
        db.query("SELECT rol FROM Usuarios WHERE id = ?", [req.userId], (err, result) => {
            if (err) return res.status(500).json({ message: err.message });

            if (result.length === 0 || result[0].rol !== "admin") {
                return res.status(403).json({ message: "No tienes permiso para modificar esta cuenta" });
            }
        });
    }

    db.query(
        "UPDATE Usuarios SET nombre = ?, email = ? WHERE id = ?",
        [nombre, email, id],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(200).json({ message: "Usuario actualizado correctamente" });
        }
    );
});

// Eliminar usuario (solo admin, pero no puede eliminar al usuario con ID 1)
app.delete("/usuarios/delete/:id", verifyToken, verifyAdmin, (req, res) => {
    const { id } = req.params;

    if (id == 1) {
        return res.status(403).json({ message: "No puedes eliminar el administrador principal" });
    }

    db.query("DELETE FROM Usuarios WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(200).json({ message: "Usuario eliminado correctamente" });
    });
});

// Obtener perfil de usuario autenticado
app.get("/usuarios/profile", verifyToken, (req, res) => {
    db.query("SELECT id, nombre, email, rol FROM Usuarios WHERE id = ?", [req.userId], (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(200).json(result[0]);
    });
});

// ======= Configuración para HTTP/HTTPS =======
const useHttps = fs.existsSync(process.env.SSL_KEY_PATH) && fs.existsSync(process.env.SSL_CERT_PATH);

if (useHttps) {
    const httpsOptions = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    };

    https.createServer(httpsOptions, app).listen(process.env.PORT || 3000, () => {
        console.log(`Servidor HTTPS activo en el puerto ${process.env.PORT || 3000}`);
    });
} else {
    http.createServer(app).listen(process.env.PORT || 3000, () => {
        console.log(`Servidor HTTP activo en el puerto ${process.env.PORT || 3000}`);
    });
}