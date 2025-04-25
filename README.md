# Documentación de la API REST - Sistema de Usuarios, Lugares, Reseñas y Favoritos

Esta es una API REST construida con Node.js y Express, que se conecta a una base de datos MySQL. Permite gestionar usuarios, lugares, reseñas y favoritos. Incluye autenticación mediante JWT y puede funcionar tanto con HTTP como con HTTPS.

---

## 🚀 Levantar el Servidor

### 1. Requisitos

- Node.js >= 14
- MySQL
- Docker (opcional)
- Archivo `.env` con las siguientes variables:

```env
PORT=3000
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_base_datos
JWT_SECRET=clave_secreta
SSL_KEY_PATH=./ssl/key.pem
SSL_CERT_PATH=./ssl/cert.pem
```

> Si no se encuentran los archivos de SSL, el servidor se iniciará en modo HTTP.

### 2. Instalación

```bash
git clone <repo-url>
cd nombre-del-proyecto
npm install
```

### 3. Ejecución

```bash
node index.js
```

---

## 👤 Endpoints de Usuarios

### Registro

**POST** `/usuarios/register`

```json
{
  "nombre": "Juan",
  "email": "juan@example.com",
  "contraseña": "secreta"
}
```

### Login

**POST** `/usuarios/login`

```json
{
  "email": "juan@example.com",
  "contraseña": "secreta"
}
```

**Respuesta:**

```json
{
  "token": "<JWT>",
  "usuario": {
    "id": 1,
    "nombre": "Juan",
    "email": "juan@example.com"
  }
}
```

### Actualizar Perfil

**PUT** `/usuarios/update` (requiere JWT)

```json
{
  "nombre": "Juan Carlos",
  "email": "nuevo@example.com"
}
```

### Cambiar Contraseña

**PUT** `/usuarios/password` (requiere JWT)

```json
{
  "contraseña": "nueva"
}
```

### Eliminar Usuario

**DELETE** `/usuarios/delete` (requiere JWT)

### Obtener Perfil

**GET** `/usuarios/profile` (requiere JWT)

---

## 🌍 Endpoints de Lugares

### Agregar Lugar

**POST** `/lugares` (requiere JWT)

```json
{
  "id_google_places": "ChIJN1t_tDeuEmsRUsoyG83frY4"
}
```

### Eliminar Lugar

**DELETE** `/lugares/:id` (requiere JWT)

---

## 📖 Endpoints de Reseñas

### Crear Reseña

**POST** `/reseñas` (requiere JWT)

```json
{
  "id_lugar": 1,
  "reseña": "Muy buen lugar",
  "puntuación": 5
}
```

### Editar Reseña

**PUT** `/reseñas/:id` (requiere JWT)

### Eliminar Reseña

**DELETE** `/reseñas/:id` (requiere JWT)

### Reseñas por Lugar

**GET** `/reseñas/:id_lugar`

### Reseñas del Usuario Logeado

**GET** `/reseñas` (requiere JWT)

---

## ⭐ Endpoints de Favoritos

### Agregar Favorito

**POST** `/favoritos` (requiere JWT)

```json
{
  "id_lugar": 1
}
```

### Eliminar Favorito

**DELETE** `/favoritos/:id_lugar` (requiere JWT)

---

## 🔒 Autenticación

- Todas las rutas protegidas requieren un token JWT en la cabecera:

```
Authorization: Bearer <token>
```

---

## 📁 Estructura de Base de Datos

- Usuarios(id, nombre, email, contraseña, fecha\_registro)
- Lugares(id, id\_google\_places, fecha\_registro)
- ReseñasUsuarios(id, id\_usuario, id\_lugar, reseña, puntuación, fecha)
- Favoritos(id, id\_usuario, id\_lugar, fecha\_agregado)

---

## 🌐 Notas

- Asegúrate de que la base de datos esté corriendo antes de levantar el servidor.
- Puedes probar los endpoints usando Postman, Insomnia o curl.
- JWT se genera al momento del login.

---

## 📄 Licencia

Este proyecto está bajo licencia MIT.
