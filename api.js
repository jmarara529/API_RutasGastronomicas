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

// ======= Rutas: Gestión de Usuarios =======
// Registrar usuario
app.post("/usuarios/register", async (req, res) => {
    const { nombre, email, contraseña } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contraseña, salt);

        db.query(
            "INSERT INTO Usuarios (nombre, email, contraseña) VALUES (?, ?, ?)",
            [nombre, email, hashedPassword],
            (err) => {
                if (err) return res.status(500).json({ message: err.message });
                res.status(201).json({ message: "Usuario registrado correctamente" });
            }
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ======= Endpoint de Login de Usuario =======
app.post("/usuarios/login", (req, res) => {
    const { email, contraseña } = req.body;

    // Validar entrada
    if (!email || !contraseña) {
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    db.query(
        "SELECT * FROM Usuarios WHERE email = ?",
        [email],
        async (err, results) => {
            if (err) return res.status(500).json({ message: "Error en el servidor" });

            if (results.length === 0) {
                return res.status(401).json({ message: "Usuario no encontrado" });
            }

            const usuario = results[0];

            try {
                const validPassword = await bcrypt.compare(contraseña, usuario.contraseña);
                if (!validPassword) {
                    return res.status(401).json({ message: "Contraseña incorrecta" });
                }

                const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
                    expiresIn: "2h",
                });

                res.status(200).json({
                    token,
                    usuario: {
                        id: usuario.id,
                        nombre: usuario.nombre,
                        email: usuario.email,
                    },
                });
            } catch (error) {
                res.status(500).json({ message: "Error al verificar la contraseña" });
            }
        }
    );
});

// Modificar datos de usuario (sin contraseña)
app.put("/usuarios/update", verifyToken, (req, res) => {
    const { nombre, email } = req.body;
    db.query(
        "UPDATE Usuarios SET nombre = ?, email = ? WHERE id = ?",
        [nombre, email, req.userId],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(200).json({ message: "Usuario actualizado correctamente" });
        }
    );
});

// Modificar contraseña
app.put("/usuarios/password", verifyToken, async (req, res) => {
    const { contraseña } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contraseña, salt);

        db.query(
            "UPDATE Usuarios SET contraseña = ? WHERE id = ?",
            [hashedPassword, req.userId],
            (err) => {
                if (err) return res.status(500).json({ message: err.message });
                res.status(200).json({ message: "Contraseña actualizada correctamente" });
            }
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Eliminar usuario
app.delete("/usuarios/delete", verifyToken, (req, res) => {
    db.query(
        "DELETE FROM Usuarios WHERE id = ?",
        [req.userId],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(200).json({ message: "Usuario eliminado correctamente" });
        }
    );
});

// Obtener datos del usuario
app.get("/usuarios/profile", verifyToken, (req, res) => {
    db.query(
        "SELECT id, nombre, email FROM Usuarios WHERE id = ?",
        [req.userId],
        (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(200).json(result[0]);
        }
    );
});

// ======= Rutas: Gestión de Lugares =======
// Añadir lugar
app.post("/lugares", verifyToken, (req, res) => {
    const { id_google_places } = req.body;
    db.query(
        "INSERT INTO Lugares (id_google_places) VALUES (?)",
        [id_google_places],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(201).json({ message: "Lugar agregado correctamente" });
        }
    );
});

// Eliminar lugar
app.delete("/lugares/:id", verifyToken, (req, res) => {
    db.query(
        "DELETE FROM Lugares WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(200).json({ message: "Lugar eliminado correctamente" });
        }
    );
});

// ======= Rutas: Gestión de Reseñas =======
// Crear reseña
app.post("/reseñas", verifyToken, (req, res) => {
    const { id_lugar, reseña, puntuación } = req.body;
    db.query(
        "INSERT INTO ReseñasUsuarios (id_usuario, id_lugar, reseña, puntuación) VALUES (?, ?, ?, ?)",
        [req.userId, id_lugar, reseña, puntuación],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(201).json({ message: "Reseña creada correctamente" });
        }
    );
});

// Modificar reseña (solo propietario)
app.put("/reseñas/:id", verifyToken, (req, res) => {
    const { reseña, puntuación } = req.body;
    db.query(
        "UPDATE ReseñasUsuarios SET reseña = ?, puntuación = ? WHERE id = ? AND id_usuario = ?",
        [reseña, puntuación, req.params.id, req.userId],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(200).json({ message: "Reseña actualizada correctamente" });
        }
    );
});

// Eliminar reseña (solo propietario)
app.delete("/reseñas/:id", verifyToken, (req, res) => {
    db.query(
        "DELETE FROM ReseñasUsuarios WHERE id = ? AND id_usuario = ?",
        [req.params.id, req.userId],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(200).json({ message: "Reseña eliminada correctamente" });
        }
    );
});

// Obtener todas las reseñas de un lugar
app.get("/reseñas/:id_lugar", (req, res) => {
    db.query(
        "SELECT * FROM ReseñasUsuarios WHERE id_lugar = ?",
        [req.params.id_lugar],
        (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(200).json(result);
        }
    );
});

// Obtener reseñas del usuario logeado
app.get("/reseñas", verifyToken, (req, res) => {
    db.query(
        "SELECT * FROM ReseñasUsuarios WHERE id_usuario = ?",
        [req.userId],
        (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(200).json(result);
        }
    );
});

// ======= Rutas: Gestión de Favoritos =======
// Añadir favorito
app.post("/favoritos", verifyToken, (req, res) => {
    const { id_lugar } = req.body;
    db.query(
        "INSERT INTO Favoritos (id_usuario, id_lugar) VALUES (?, ?)",
        [req.userId, id_lugar],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(201).json({ message: "Favorito añadido correctamente" });
        }
    );
});

// Eliminar favorito
app.delete("/favoritos/:id_lugar", verifyToken, (req, res) => {
    db.query(
        "DELETE FROM Favoritos WHERE id_usuario = ? AND id_lugar = ?",
        [req.userId, req.params.id_lugar],
        (err) => {
            if (err) return res.status(500).json({ message: err.message });
            res.status(200).json({ message: "Favorito eliminado correctamente" });
        }
    );
});

// ======= Configuración para HTTP/HTTPS =======
const useHttps = fs.existsSync(process.env.SSL_KEY_PATH) && fs.existsSync(process.env.SSL_CERT_PATH);

if (useHttps) {
    const httpsOptions = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    };

    https.createServer(httpsOptions, app).listen(process.env.PORT || 3000, () => {
        const ip = require("os").networkInterfaces();
        const localIp = Object.values(ip)
            .flat()
            .find((iface) => iface.family === "IPv4" && !iface.internal)?.address || "localhost";
        console.log(`Servidor HTTPS activo en ${localIp}:${process.env.PORT || 3000}`);
    });
} else {
    http.createServer(app).listen(process.env.PORT || 3000, () => {
        const ip = require("os").networkInterfaces();
        const localIp = Object.values(ip)
            .flat()
            .find((iface) => iface.family === "IPv4" && !iface.internal)?.address || "localhost";
        console.log(`Servidor HTTP activo en ${localIp}:${process.env.PORT || 3000}`);
    });
}