# AgroBalance en Producción

Esta app ya tiene una base válida para uso real si cerramos bien tres piezas:

1. frontend publicado
2. workspace compartido en Firestore
3. backend Express publicado para webhooks e integraciones

## Arquitectura recomendada

- Frontend web: Vercel
- Base de datos/documento compartido: Firebase Firestore
- Backend/API y webhook: Render
- APK futura: Capacitor apuntando al mismo frontend/backend

Con esta arquitectura:

- la web y la APK comparten el mismo workspace
- los datos dejan de depender del navegador local
- el backend queda listo para WhatsApp, automatizaciones y futuras APIs

## Estado actual del proyecto

Hoy la app ya soporta dos modos:

- modo local: guarda datos en `localStorage`
- modo compartido: sincroniza el estado en Firestore si completas las variables `VITE_FIREBASE_*`

Además, el backend en `backend/server.js` ya puede escribir en ese mismo workspace mediante Firebase Admin.

## Paso 1: Crear proyecto Firebase

1. Crear un proyecto nuevo en Firebase.
2. Habilitar Firestore Database en modo producción.
3. Crear una Web App dentro del proyecto.
4. Copiar las credenciales del cliente web al archivo `.env`.
5. Crear una Service Account y guardar estos datos para el backend:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

## Paso 2: Configurar frontend local

Crear un archivo `.env` en la raíz usando `.env.example`.

Variables clave:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_WORKSPACE_ID=default
```

Luego ejecutar:

```bash
npm install
npm run dev
```

Al abrir la app, el workspace compartido se crea o se actualiza automáticamente en Firestore.

## Paso 3: Configurar backend local

Crear `backend/.env` usando `backend/.env.example`.

Variables mínimas:

```bash
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_WORKSPACE_ID=default
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5180
```

Luego ejecutar:

```bash
npm run server
```

Endpoints actuales:

- `GET /health`
- `POST /whatsapp/webhook`

## Paso 4: Publicar frontend

Opción recomendada: Vercel.

1. Conectar el repositorio.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Cargar las variables `VITE_FIREBASE_*`

Resultado esperado:

- la web pública ya deja de depender del navegador local
- todos los usuarios conectados al mismo workspace ven los mismos datos

## Paso 5: Publicar backend

Opción recomendada: Render.

El archivo `render.yaml` ya deja preparada una base para desplegarlo.

Variables a configurar en Render:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_WORKSPACE_ID`
- `ALLOWED_ORIGINS`

## Paso 6: Checklist antes de uso real

- Corregir definitivamente los textos con encoding viejo que aún queden
- Definir reglas de seguridad de Firestore
- Crear autenticación real de usuarios
- Separar workspaces por cliente o empresa real
- Revisar backups y exportación de datos
- Definir dominio final
- Revisar responsive móvil

## Qué conviene hacer ahora

Orden sugerido:

1. dejar Firebase funcionando
2. publicar frontend en Vercel
3. publicar backend en Render
4. probar flujo real multi-dispositivo
5. recién después preparar APK

Ese orden evita duplicar trabajo y deja una base más sana para crecer.
