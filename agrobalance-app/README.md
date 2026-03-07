# AgroBalance

MVP web + PWA para gestión agrícola y financiera.

## Incluye
- Multiempresa por usuario
- Empresas, campos, campañas y cultivos
- Gastos e ingresos
- Proveedores y clientes con saldo pendiente
- Stock de granos y ubicaciones
- Maquinaria y mantenimiento
- Personal y costos salariales
- Dashboard con resultado anual y resultado del negocio hoy
- Modo demo persistido en localStorage
- Base preparada para conectar Firebase después

## Ejecutar

```bash
npm install
npm run dev
```

## PWA

```bash
npm run build
```

Luego puedes publicar el contenido generado en `dist/` en Vercel.

## Firebase

Crea un archivo `.env` con:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Mientras no lo completes, la app funciona igual usando datos demo guardados en el navegador.
