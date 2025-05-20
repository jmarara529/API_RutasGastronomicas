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

## 🚦 Endpoints y Ejemplos

### 🔑 Auth

#### POST `/api/auth/register`
**Request:**
```json
{
  "nombre": "Juan",
  "correo": "juan@email.com",
  "contraseña": "123456"
}
```
**Response:**
```json
{ "msg": "Usuario creado" }
```
**Error:**
```json
{ "msg": "Error al registrar", "error": "El correo ya está registrado" }
```

#### POST `/api/auth/login`
**Request:**
```json
{
  "correo": "juan@email.com",
  "contraseña": "123456"
}
```
**Response:**
```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..." }
```
**Error:**
```json
{ "msg": "Credenciales inválidas" }
```

---

### 👤 Usuarios

#### GET `/api/usuarios` (Solo admin)
**Headers:**  
`Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": 2,
    "nombre": "Juan",
    "correo": "juan@email.com",
    "fecha_creacion": "2024-05-21T10:00:00.000Z",
    "es_admin": false
  }
]
```

#### PUT `/api/usuarios/nombre/:id`
**Request:**
```json
{ "nombre": "Nuevo Nombre" }
```
**Response:**
```json
{ "msg": "Nombre actualizado" }
```

#### PUT `/api/usuarios/correo/:id`
**Request:**
```json
{ "correo": "nuevo@email.com" }
```
**Response:**
```json
{ "msg": "Correo actualizado" }
```
**Error:**
```json
{ "msg": "Correo ya registrado" }
```

#### PUT `/api/usuarios/contraseña/:id`
**Request:**
```json
{ "contraseña": "nuevaPassword" }
```
**Response:**
```json
{ "msg": "Contraseña actualizada" }
```

#### DELETE `/api/usuarios/:id`
**Response:**
```json
{ "msg": "Usuario eliminado" }
```

---

### 📝 Reseñas

#### POST `/api/resenas`
**Request:**
```json
{
  "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "calificacion": 5,
  "comentario": "¡Excelente lugar!"
}
```
**Response:**
```json
{ "msg": "Reseña creada correctamente" }
```

#### GET `/api/resenas`
**Response:**
```json
[
  {
    "id": 1,
    "id_usuario": 2,
    "id_lugar": 1,
    "calificacion": 5,
    "comentario": "¡Excelente lugar!",
    "fecha": "2024-05-21T12:00:00.000Z",
    "nombre_usuario": "Juan",
    "nombre_lugar": "Restaurante Ejemplo"
  }
]
```

#### PUT `/api/resenas/:id`
**Request:**
```json
{ "calificacion": 4, "comentario": "Muy bueno" }
```
**Response:**
```json
{ "msg": "Reseña actualizada correctamente" }
```

#### DELETE `/api/resenas/:id`
**Response:**
```json
{ "msg": "Reseña eliminada correctamente" }
```

---

### 📍 Lugares

#### GET `/api/lugares`
**Response:**
```json
[
  {
    "id": 1,
    "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "nombre": "Restaurante Ejemplo",
    "direccion": "Calle Falsa 123",
    "categoria": "Mexicana",
    "ciudad": "Ciudad de México"
  }
]
```

#### GET `/api/lugares/:place_id`
**Response:**
```json
{
  "id": 1,
  "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "nombre": "Restaurante Ejemplo",
  "direccion": "Calle Falsa 123",
  "categoria": "Mexicana",
  "ciudad": "Ciudad de México"
}
```
**Error:**
```json
{ "msg": "El lugar no está registrado en la base de datos" }
```

#### POST `/api/lugares`
**Request:**
```json
{
  "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "nombre": "Restaurante Ejemplo",
  "direccion": "Calle Falsa 123",
  "categoria": "Mexicana",
  "ciudad": "Ciudad de México"
}
```
**Response:**
```json
{ "msg": "Lugar registrado correctamente" }
```
**Error:**
```json
{ "msg": "El lugar ya está registrado" }
```

#### PUT `/api/lugares/:place_id`
**Request:**
```json
{ "nombre": "Nuevo Nombre" }
```
**Response:**
```json
{ "msg": "Lugar actualizado correctamente" }
```

#### DELETE `/api/lugares/:place_id`
**Response:**
```json
{ "msg": "Lugar eliminado correctamente" }
```

---

### ❤️ Favoritos

#### POST `/api/favoritos`
**Request:**
```json
{
  "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "nombre": "Restaurante Ejemplo",
  "direccion": "Calle Falsa 123",
  "categoria": "Mexicana",
  "ciudad": "Ciudad de México"
}
```
**Response:**
```json
{ "msg": "Favorito agregado" }
```

#### GET `/api/favoritos`
**Response:**
```json
[
  {
    "id": 1,
    "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "nombre": "Restaurante Ejemplo",
    "direccion": "Calle Falsa 123",
    "categoria": "Mexicana",
    "ciudad": "Ciudad de México"
  }
]
```

#### DELETE `/api/favoritos/:id_lugar`
**Response:**
```json
{ "msg": "Favorito eliminado" }
```

---

### 📍 Visitados

#### POST `/api/visitados`
**Request:**
```json
{
  "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "nombre": "Restaurante Ejemplo",
  "direccion": "Calle Falsa 123",
  "categoria": "Mexicana",
  "ciudad": "Ciudad de México"
}
```
**Response:**
```json
{ "msg": "Visita registrada correctamente" }
```

#### GET `/api/visitados`
**Response:**
```json
[
  {
    "id_usuario": 2,
    "id_lugar": 1,
    "fecha_visita": "2024-05-21T12:00:00.000Z",
    "nombre_lugar": "Restaurante Ejemplo"
  }
]
```

#### GET `/api/visitados/admin`
**Response:**
```json
[
  {
    "id_usuario": 2,
    "id_lugar": 1,
    "fecha_visita": "2024-05-21T12:00:00.000Z",
    "nombre_usuario": "Juan",
    "nombre_lugar": "Restaurante Ejemplo"
  }
]
```

#### DELETE `/api/visitados/:id_lugar`
**Response:**
```json
{ "msg": "Visita eliminada correctamente" }
```

---

### 🕵️ Historial de Eliminaciones (Solo Admin)

#### GET `/api/historial`
**Response:**
```json
[
  {
    "id": 1,
    "tipo_entidad": "usuario",
    "id_entidad": 2,
    "id_usuario": 1,
    "fecha_eliminacion": "2024-05-21T13:00:00.000Z",
    "usuario_eliminador": "admin"
  }
]
```

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