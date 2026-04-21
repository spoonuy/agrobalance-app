import './loadEnv.js';
import express from 'express';
import { appendItemToCollection, getWorkspaceState } from './workspaceRepository.js';
import { helpMessage, parseWhatsappMessage } from './whatsappParser.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const workspaceId = process.env.FIREBASE_WORKSPACE_ID || 'default';
const allowedOrigins = String(process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin) {
    next();
    return;
  }

  if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});

const sendWhatsappReply = (res, message) => {
  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`);
};

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    workspaceId,
    timestamp: new Date().toISOString()
  });
});

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    app: 'AgroBalance backend',
    workspaceId,
    endpoints: ['/health', '/whatsapp/webhook']
  });
});

app.post('/whatsapp/webhook', async (req, res) => {
  const messageBody = String(req.body.Body || req.body.body || '').trim();
  const from = req.body.From || req.body.from || 'unknown';

  if (!messageBody) {
    return sendWhatsappReply(res, helpMessage);
  }

  try {
    const state = await getWorkspaceState(workspaceId);
    const parsed = parseWhatsappMessage(state, messageBody);

    if (parsed.type === 'help') {
      return sendWhatsappReply(res, parsed.message);
    }

    const createdItem = await appendItemToCollection(workspaceId, parsed.collection, parsed.payload, {
      from,
      body: messageBody,
      receivedAt: new Date().toISOString()
    });

    return sendWhatsappReply(
      res,
      `${parsed.confirmation}\nID: ${createdItem.id}\nWorkspace: ${workspaceId}`
    );
  } catch (error) {
    console.error('Error procesando WhatsApp', error);
    return sendWhatsappReply(res, `${error.message}\n\n${helpMessage}`);
  }
});

app.listen(port, () => {
  console.log(`AgroBalance WhatsApp webhook escuchando en http://localhost:${port}`);
});
