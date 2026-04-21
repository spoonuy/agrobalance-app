# AgroBalance

AgroBalance es una app web y PWA para gestión agrícola y financiera. Hoy ya cubre carga operativa, tablero de control, seguimiento comercial y una base de sincronización compartida para llevarla a uso real.

## Qué incluye

- Multiempresa por usuario
- Empresas, campos, campañas y cultivos
- Gastos e ingresos
- Proveedores y clientes con estado de cuenta
- Stock de granos y remitos de chacra
- Maquinaria y mantenimiento
- Personal y costos salariales
- Registro de lluvias
- Dashboard con métricas por campaña y cultivo
- Intro/login visual
- Soporte opcional de workspace compartido en Firestore
- Backend Express para webhook de WhatsApp

## Desarrollo local

```bash
npm install
npm run dev
```

## Build del frontend

```bash
npm run build
```

## Backend local

```bash
npm run server
```

## Variables de entorno

### Frontend

Usar `.env.example` como base:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_WORKSPACE_ID=default
VITE_API_BASE_URL=
```

### Backend

Usar `backend/.env.example` como base:

```bash
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_WORKSPACE_ID=default
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5180
```

## Arquitectura recomendada para uso real

- Frontend: Vercel
- Datos compartidos: Firebase Firestore
- Backend / webhook: Render
- APK futura: Capacitor conectada al mismo workspace

Con esta base, la web y la futura APK pueden trabajar sobre los mismos datos.

## Documentación de despliegue

La guía concreta para pasar de demo local a entorno real está en:

[deploy-production.md](/C:/Users/mauri/Downloads/agrobalance-app/docs/deploy-production.md)

## WhatsApp webhook

El backend actual expone:

- `GET /health`
- `POST /whatsapp/webhook`

Ese webhook escribe en el mismo workspace compartido que usa el frontend cuando Firestore está configurado.

## Próximo paso recomendado

1. configurar Firebase
2. publicar frontend
3. publicar backend
4. probar sincronización real entre dispositivos
5. recién después preparar APK
