# 📍 Rutas Gastronómicas - API REST

API RESTful construida con **Node.js**, **Express** y **MySQL** para gestionar una red social de experiencias gastronómicas. Permite a los usuarios registrar lugares visitados, dejar reseñas, guardar favoritos y a los administradores gestionar usuarios y ver el historial de acciones.  
**Incluye integración con Google Places API para búsquedas de lugares por texto, coordenadas y detalles.**

---

## 📁 Estructura del Proyecto

```
.
├── controllers/          # Lógica de negocio (usuarios, reseñas, lugares, places, etc.)
├── middleware/           # Middlewares personalizados (auth, isAdmin)
├── routes/               # Rutas organizadas por entidad
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
- Docker y Docker Compose (opcional, recomendado para despliegue)

---

## 🗄️ Base de Datos

- **Incluido:** El archivo `database.sql` contiene el script para crear la estructura de la base de datos y las tablas necesarias.
- **Importante:** Debes crear la base de datos y ejecutar el script SQL **antes de iniciar la API**.
- **Requisito:** La base de datos MySQL debe estar creada y en funcionamiento, y los datos de conexión deben coincidir con los de tu archivo `.env`.
- **Ejecución:** La base de datos puede ejecutarse tanto en la máquina anfitriona como en un contenedor Docker, a elección del usuario.

---

## 🚀 Instalación Manual

1. Clona el repositorio y entra en la carpeta:

    ```sh
    git clone https://github.com/jmarara529/API_RutasGastronomicas
    cd API_RutasGastronomicas
    ```

2. Instala las dependencias:

    ```sh
    npm install
    ```

3. Copia el archivo de ejemplo `.env` y edítalo con tus datos:

    ```sh
    cp .env.example .env
    # Edita .env con tus credenciales y claves
    ```

4. Inicia la API:

    ```sh
    npm start
    ```

---

## 🐳 Despliegue con Docker Compose

1. Copia el archivo de ejemplo `.env` y edítalo con tus datos:

    ```sh
    cp .env.example .env
    # Edita .env con tus credenciales y claves
    ```

2. Crea el archivo `docker-compose.yml` en la raíz del proyecto:

    ```yaml
    version: '3.8'

    services:
      api-rutasgastronomicas:
        container_name: api-gastronomia-container
        image: node:20
        working_dir: /usr/src/app
        volumes:
          - ./:/usr/src/app
          - /etc/letsencrypt:/etc/letsencrypt:ro
        ports:
          - "3000:3000"
          - "3443:3443"
        command: [ "sh", "-c", "npm install && node server.js" ]
        environment:
          - NODE_ENV=production
        env_file:
          - .env
        restart: always
    ```

    **Notas:**
    - El volumen `/etc/letsencrypt:/etc/letsencrypt:ro` permite que el contenedor acceda a los certificados SSL del host.
    - Asegúrate de que tu base de datos MySQL sea accesible desde el contenedor (puede estar en otro contenedor o en el host).
    - Si usas MySQL en otro contenedor, puedes añadirlo al mismo `docker-compose.yml`.

3. Inicia la API con Docker Compose:

    ```sh
    docker-compose up -d
    ```

    La API estará disponible en los puertos `3000` (HTTP) y si los certificados ssl están disponibles también en `3443` (HTTPS).

---

## 🧩 Variables de Entorno `.env` (Ejemplo)

```env
DB_HOST=localhost
DB_USER=usuario_db
DB_PASSWORD=contraseña_db
DB_NAME=RutasGastronomicas

SSL_KEY_PATH=/etc/letsencrypt/live/tu-dominio.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/tu-dominio.com/fullchain.pem
PORT_HTTP=3000
PORT_HTTPS=3443

JWT_SECRET="Tu_Clave_Secreta_Segura"
GOOGLE_PLACES_API_KEY=tu_clave_google_places
```

---

## 🗄️ Estructura de la Base de Datos

- **usuarios**: id, nombre, correo, contraseña, es_admin, fecha_creacion
- **lugares**: id, place_id, nombre, direccion, categoria, ciudad
- **resenas**: id, id_usuario, id_lugar, calificacion, comentario, fecha
- **favoritos**: id_usuario, id_lugar, fecha_agregado
- **visitados**: id_usuario, id_lugar, fecha_visita
- **historial_acciones**: id, tipo_entidad, id_entidad, id_usuario, accion, fecha_accion

---

## 🔐 Autenticación & Autorización

- Autenticación por **JWT** (Bearer Token) usando el middleware `auth`.
- Rol administrador: `es_admin = true` (middleware `isAdmin`).
- El usuario con `id = 1` no puede ser modificado ni eliminado.
- **El primer usuario registrado (id=1) será automáticamente administrador**.

---

## 🚦 Endpoints y Ejemplos

### 🔑 Auth

#### POST `/api/auth/register`
Registra un nuevo usuario. El primer usuario será admin.

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

#### POST `/api/auth/login`
Inicia sesión y devuelve un token JWT.

**Request:**
```json
{
  "correo": "juan@email.com",
  "contraseña": "123456"
}
```
**Response:**
```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...", "es_admin": true, "id": 1 }
```

---

### 👤 Usuarios

#### GET `/api/usuarios/me`
Obtiene los datos del usuario autenticado.

**Headers:**
`Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "nombre": "Juan",
  "correo": "juan@email.com",
  "fecha_creacion": "2024-05-21T10:00:00.000Z",
  "es_admin": true
}
```

#### GET `/api/usuarios` (Solo admin)
Lista todos los usuarios.

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

#### GET `/api/usuarios/:id` (Solo admin)
Obtiene los datos de un usuario específico.

**Headers:**
`Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 2,
  "nombre": "Juan",
  "correo": "juan@email.com",
  "fecha_creacion": "2024-05-21T10:00:00.000Z",
  "es_admin": false
}
```

#### PUT `/api/usuarios/nombre/:id`
Actualiza el nombre del usuario autenticado o por admin.

**Request:**
```json
{ "nombre": "Nuevo Nombre" }
```
**Response:**
```json
{ "msg": "Nombre actualizado" }
```

#### PUT `/api/usuarios/correo/:id`
Actualiza el correo del usuario autenticado o por admin.

**Request:**
```json
{ "correo": "nuevo@email.com" }
```
**Response:**
```json
{ "msg": "Correo actualizado" }
```

#### PUT `/api/usuarios/contrasena/:id`
Actualiza la contraseña del usuario autenticado o por admin.

**Request:**
```json
{ "contrasena": "nuevaPassword" }
```
**Response:**
```json
{ "msg": "Contraseña actualizada" }
```

#### PUT `/api/usuarios/:id` (Solo admin)
Actualiza todos los datos de un usuario (nombre, correo, contraseña, es_admin).

**Request:**
```json
{ "nombre": "Nuevo", "correo": "nuevo@email.com", "es_admin": true }
```
**Response:**
```json
{ "msg": "Usuario actualizado" }
```

#### DELETE `/api/usuarios/:id`
Elimina un usuario (no se puede eliminar el usuario id=1).

**Response:**
```json
{ "msg": "Usuario eliminado" }
```

---

### 📝 Reseñas

#### POST `/api/resenas`
Crea una reseña de un lugar registrado.

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

#### PUT `/api/resenas/:id`
Edita una reseña (solo autor o admin).

**Request:**
```json
{ "calificacion": 4, "comentario": "Muy bueno" }
```
**Response:**
```json
{ "msg": "Reseña actualizada correctamente" }
```

#### DELETE `/api/resenas/:id`
Elimina una reseña (solo autor o admin).

**Response:**
```json
{ "msg": "Reseña eliminada correctamente" }
```

#### GET `/api/resenas`
Lista todas las reseñas (autenticado, con filtros por lugar, usuario, etc.).

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

#### GET `/api/resenas/usuario`
Lista las reseñas del usuario autenticado.

**Response:**
```json
[
  {
    "id": 1,
    "id_usuario": 2,
    "id_lugar": 1,
    "calificacion": 5,
    "comentario": "¡Excelente lugar!",
    "fecha": "2024-05-21T12:00:00.000Z"
  }
]
```

#### GET `/api/resenas/usuario/:id` (Solo admin)
Lista las reseñas de cualquier usuario.

**Response:**
```json
[
  {
    "id": 1,
    "id_usuario": 2,
    "id_lugar": 1,
    "calificacion": 5,
    "comentario": "¡Excelente lugar!",
    "fecha": "2024-05-21T12:00:00.000Z"
  }
]
```

---

### 📍 Lugares

#### GET `/api/lugares`
Lista todos los lugares registrados.

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
Obtiene información de un lugar por su place_id.

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

#### GET `/api/lugares/byid/:id`
Obtiene información de un lugar por su id interno.

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

#### POST `/api/lugares`
Crea un nuevo lugar (si no existe). Solo autenticado.

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

#### PUT `/api/lugares/:place_id`
Actualiza un lugar (solo admin).

**Request:**
```json
{ "nombre": "Nuevo Nombre" }
```
**Response:**
```json
{ "msg": "Lugar actualizado correctamente" }
```

#### DELETE `/api/lugares/:place_id`
Elimina un lugar (solo admin).

**Response:**
```json
{ "msg": "Lugar eliminado correctamente" }
```

---

### ❤️ Favoritos

#### POST `/api/favoritos`
Agrega un lugar a favoritos. Si el lugar no existe, se crea automáticamente.

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
Lista los favoritos del usuario autenticado. Si eres admin, puedes consultar los favoritos de otro usuario con `?admin_id=2`.

**Response:**
```json
[
  {
    "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "nombre": "Restaurante Ejemplo",
    "direccion": "Calle Falsa 123",
    "categoria": "Mexicana",
    "ciudad": "Ciudad de México",
    "fecha_agregado": "2024-05-21T12:00:00.000Z"
  }
]
```

#### DELETE `/api/favoritos/:id_lugar`
Elimina un favorito.

**Response:**
```json
{ "msg": "Favorito eliminado" }
```

---

### 📍 Visitados

#### POST `/api/visitados`
Marca un lugar como visitado. Si el lugar no existe, se crea automáticamente.

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
Lista los lugares visitados por el usuario autenticado.

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
(Solo admin) Lista todas las visitas, con filtros opcionales `?id_usuario=2&id_lugar=1`.

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
Elimina un lugar de la lista de visitados.

**Response:**
```json
{ "msg": "Visita eliminada correctamente" }
```

---

### 🕵️ Historial de Acciones (Solo Admin)

#### GET `/api/historial`
Devuelve el historial de acciones relevantes (creación, edición, eliminación de usuarios, lugares, reseñas, favoritos, visitados).

**Response:**
```json
[
  {
    "id": 1,
    "tipo_entidad": "usuario",
    "id_entidad": 2,
    "id_usuario": 1,
    "accion": "eliminado",
    "fecha_accion": "2024-05-21T13:00:00.000Z",
    "ejecutado_por": "admin"
  }
]
```

---

### 🌍 Google Places

#### GET `/api/places/buscar?query=Gran+Vía+Madrid`
Busca lugares por texto (nombre de calle, ciudad, etc.). Si no hay resultados útiles, intenta geocodificar y buscar lugares cercanos.

**Response:**
```json
{
  "results": [
    {
      "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "displayName": { "text": "Restaurante Ejemplo" },
      "formattedAddress": "Calle Falsa 123, Ciudad de México"
    }
  ],
  "status": "OK"
}
```

#### GET `/api/places/cercanos?lat=40.4168&lng=-3.7038&radius=1000&type=restaurant`
Busca lugares cercanos a unas coordenadas.

**Response:**
```json
{
  "results": [
    {
      "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "displayName": { "text": "Restaurante Cercano" },
      "vicinity": "Calle Ejemplo, Madrid"
    }
  ],
  "status": "OK"
}
```

#### GET `/api/places/detalles?place_id=ChIJN1t_tDeuEmsRUsoyG83frY4`
Obtiene los detalles de un lugar por su `place_id`.

**Response:**
```json
{
  "result": {
    "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "displayName": { "text": "Restaurante Ejemplo" },
    "formattedAddress": "Calle Falsa 123, Ciudad de México",
    "geometry": { }
  },
  "status": "OK"
}
```

#### GET `/api/places/photo?name=places/ChIJN1t_tDeuEmsRUsoyG83frY4/photos/ATtYBw...`
Devuelve la imagen de un lugar de Google Places (proxy). Devuelve la imagen directamente.

#### GET `/api/maps/embed?lat=40.4168&lng=-3.7038&q=Restaurante+Ejemplo`
Devuelve la URL de un iframe de Google Maps Embed API para mostrar un lugar en un mapa.

**Response:**
```json
{
  "url": "https://www.google.com/maps/embed/v1/place?key=...&q=Restaurante+Ejemplo&center=40.4168,-3.7038&zoom=16"
}
```

---

## ⚙️ Funcionamiento

- Los usuarios pueden registrarse, iniciar sesión y gestionar sus datos.
- El primer usuario registrado será automáticamente administrador.
- Los lugares se identifican por `place_id` (Google Places).
- Puedes buscar lugares por nombre de calle, ciudad o coordenadas (lat/lng) gracias a la integración con Google Places.
- Antes de guardar una reseña, favorito o visita, se verifica si el lugar existe en la base de datos; si no, se crea automáticamente en favoritos/visitados.
- Los administradores pueden ver el historial de acciones y gestionar usuarios/lugares.
- Cada acción relevante se registra en la tabla `historial_acciones`.
- Los endpoints protegidos usan el middleware de autenticación y/o admin.
- Los endpoints de favoritos y visitados son robustos ante duplicados.

---

## 📝 Notas

- Todos los endpoints (excepto registro/login y algunos de Google Places) requieren autenticación JWT.
- Los endpoints de administración requieren el campo `es_admin` en el token.
- El usuario con ID 1 es protegido y no puede ser modificado/eliminado.
- Para usar la integración de Google Places, necesitas una clave válida en tu `.env` (`GOOGLE_PLACES_API_KEY`).
- El endpoint `/api/places/photo` sirve imágenes de Google Places como proxy.
- El endpoint `/api/maps/embed` genera URLs para iframes de Google Maps.