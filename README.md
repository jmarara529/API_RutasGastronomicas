# 📍 Rutas Gastronómicas - API REST

API RESTful construida con **Node.js**, **Express** y **MySQL** para gestionar una red social de experiencias gastronómicas. Permite a los usuarios registrar lugares visitados, dejar reseñas, guardar favoritos y a los administradores gestionar usuarios y ver el historial de eliminaciones.

---

## 📁 Estructura del Proyecto

```
.
├── controllers/          # Lógica de negocio (usuarios, reseñas, lugares, etc.)
│   ├── authController.js
│   ├── favoritosController.js
│   ├── historialController.js
│   ├── lugarController.js
│   ├── resenaController.js
│   ├── usuarioController.js
│   └── visitadosController.js
│
├── middleware/           # Middlewares personalizados
│   ├── auth.js           # Verifica JWT
│   └── isAdmin.js        # Verifica rol administrador
│
├── routes/               # Rutas organizadas por entidad
│   ├── auth.js
│   ├── favoritos.js
│   ├── historial.js
│   ├── lugares.js
│   ├── resenas.js
│   ├── usuarios.js
│   └── visitados.js
│
├── database.sql          # Script para crear la base de datos y tablas
├── db.js                 # Conexión a MySQL
├── .env                  # Variables de entorno
├── server.js             # Punto de entrada de la API
└── package.json
```

---

## 🛠️ Requisitos

- Node.js (v18+)
- MySQL

---

## 🔧 Instalación

```sh
git clone <repo-url>
cd API_RutasGastronomicas
npm install
cp .env.example .env
# Edita .env con tus credenciales y claves
npm start
```

---

## 📦 Variables .env

```env
DB_HOST=localhost
DB_USER=usuario
DB_PASSWORD=contraseña
DB_NAME=RutasGastronomicas
JWT_SECRET=clave_secreta
SSL_KEY_PATH=./certs/privkey.pem
SSL_CERT_PATH=./certs/cert.pem
PORT_HTTP=3000
PORT_HTTPS=3443
```

---

## 🧱 Estructura de la Base de Datos

```sql
usuarios
├─ id (PK)
├─ nombre
├─ correo (UNIQUE)
├─ contraseña (bcrypt)
├─ es_admin (BOOLEAN)
├─ fecha_creacion

lugares
├─ id (PK)
├─ place_id (UNIQUE)
├─ nombre, direccion, categoria, ciudad

resenas
├─ id (PK)
├─ id_usuario (FK)
├─ id_lugar (FK)
├─ calificacion, comentario, fecha

favoritos
├─ id_usuario (FK)
├─ id_lugar (FK)
├─ fecha_agregado

visitados
├─ id_usuario (FK)
├─ id_lugar (FK)
├─ fecha_visita

historial_eliminaciones
├─ id (PK)
├─ tipo_entidad
├─ id_entidad
├─ id_usuario
├─ fecha_eliminacion
```

---

## 🔐 Autenticación & Autorización

- Autenticación por **JWT** (Bearer Token)
- Rol administrador: `es_admin = true`
- El usuario con `id = 1` no puede ser modificado ni eliminado

---

## 🚦 Endpoints

### 🔑 Auth

| Método | Endpoint         | Descripción                |
|--------|------------------|----------------------------|
| POST   | /api/auth/register | Registrar nuevo usuario   |
| POST   | /api/auth/login    | Iniciar sesión y obtener token |

---

### 👤 Usuarios

| Método | Endpoint                    | Descripción                                 |
|--------|-----------------------------|---------------------------------------------|
| GET    | /api/usuarios               | Listar usuarios (solo admin)                |
| PUT    | /api/usuarios/nombre/:id    | Editar nombre del usuario                   |
| PUT    | /api/usuarios/correo/:id    | Editar correo del usuario                   |
| PUT    | /api/usuarios/contraseña/:id| Editar contraseña del usuario               |
| DELETE | /api/usuarios/:id           | Eliminar usuario (no se puede ID 1)         |

---

### 📝 Reseñas

| Método | Endpoint           | Descripción                                 |
|--------|--------------------|---------------------------------------------|
| POST   | /api/resenas       | Crear reseña                                |
| GET    | /api/resenas       | Listar reseñas propias o todas si es admin  |
| PUT    | /api/resenas/:id   | Editar reseña propia (o cualquier si admin) |
| DELETE | /api/resenas/:id   | Eliminar reseña propia (o cualquier si admin)|

- Filtros: `?orden_calificacion=asc|desc`, `?orden_fecha=reciente|antigua`

---

### 📍 Lugares

| Método | Endpoint                | Descripción                                 |
|--------|-------------------------|---------------------------------------------|
| GET    | /api/lugares            | Listar todos los lugares                    |
| GET    | /api/lugares/:place_id  | Obtener información de un lugar             |
| POST   | /api/lugares            | Registrar nuevo lugar                       |
| PUT    | /api/lugares/:place_id  | Actualizar información de un lugar (admin)  |
| DELETE | /api/lugares/:place_id  | Eliminar un lugar (admin)                   |

---

### ❤️ Favoritos

| Método | Endpoint                   | Descripción                    |
|--------|----------------------------|--------------------------------|
| POST   | /api/favoritos             | Marcar lugar como favorito     |
| GET    | /api/favoritos             | Listar favoritos del usuario   |
| DELETE | /api/favoritos/:id_lugar   | Eliminar favorito del usuario  |

---

### 📍 Visitados

| Método | Endpoint                        | Descripción                                 |
|--------|----------------------------------|---------------------------------------------|
| POST   | /api/visitados                   | Marcar lugar como visitado                  |
| GET    | /api/visitados                   | Listar lugares visitados del usuario        |
| GET    | /api/visitados/admin             | Listar todas las visitas (solo admin, filtros opcionales) |
| DELETE | /api/visitados/:id_lugar         | Eliminar lugar visitado por el usuario      |

---

### 🕵️ Historial de Eliminaciones (Solo Admin)

| Método | Endpoint         | Descripción                        |
|--------|------------------|------------------------------------|
| GET    | /api/historial   | Listar historial de eliminaciones  |

---

## ⚙️ Funcionamiento

- Los usuarios pueden registrarse, iniciar sesión y gestionar sus datos.
- Los lugares se identifican por `place_id` (Google Places).
- Antes de guardar una reseña, favorito o visita, se verifica si el lugar existe en la base de datos.
- Los administradores pueden ver el historial de eliminaciones y gestionar usuarios/lugares.
- Cada eliminación relevante se registra en la tabla `historial_eliminaciones`.

---

## 📝 Notas

- Todos los endpoints (excepto registro/login) requieren autenticación JWT.
- Los endpoints de administración requieren el campo `es_admin` en el token.
- El usuario con ID 1 es protegido y no puede ser modificado/eliminado.

---

¿Dudas o sugerencias? ¡Contribuye o abre un issue!