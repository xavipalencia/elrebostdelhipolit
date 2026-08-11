const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fetch = require('node-fetch');
const pino = require('pino');
const { categorizeItems, getCategoryInfo, CATEGORIES } = require('./categorizer');

// ─── Configuració ─────────────────────────────────────────────────────────────
const GROUP_NAME  = process.env.WA_GROUP_NAME    || 'Compra família';
const HA_URL      = process.env.HA_URL           || 'http://supervisor/core';
const HA_TOKEN    = process.env.HA_TOKEN         || '';
const TODO_ENTITY = process.env.TODO_LIST_ENTITY || 'todo.llista_compra';
const SESSION_DIR = '/config/wa-shopping-bot/session';

let targetGroupId = null;
const processedIds = new Set();

function markProcessed(id) {
  processedIds.add(id);
  if (processedIds.size > 500) processedIds.clear();
}

// ─── Connexió ─────────────────────────────────────────────────────────────────
async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();
  console.log(`[START] Baileys versió WA: ${version.join('.')}`);

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['WA Shopping Bot', 'Chrome', '120.0'],
    syncFullHistory: false,
    markOnlineOnConnect: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n========================================');
      console.log('ESCANEJA AQUEST QR AMB EL MOBIL:');
      console.log('========================================\n');
      qrcode.generate(qr, { small: true });
      console.log('WhatsApp -> Dispositius vinculats -> Vincular dispositiu\n');
    }

    if (connection === 'open') {
      console.log('[OK] WhatsApp connectat!');
      // Busca el grup després de connectar
      setTimeout(() => findTargetGroup(sock), 3000);
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      console.warn(`[WARN] Connexió tancada (codi: ${code}). Reconnectant: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(() => connectToWhatsApp(), 5000);
      } else {
        console.error('[ERR] Sessió expirada. Esborra la sessió i reinicia.');
      }
    }
  });

  // Captura TOTS els missatges (notify = nous, append = teus propis)
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    console.log(`[EV] messages.upsert type=${type} count=${messages.length}`);

    for (const msg of messages) {
      const id = msg.key.id;
      if (processedIds.has(id)) continue;
      markProcessed(id);

      const jid = msg.key.remoteJid || '';
      const fromMe = msg.key.fromMe || false;
      const text = msg.message?.conversation
        || msg.message?.extendedTextMessage?.text
        || msg.message?.imageMessage?.caption
        || '';

      console.log(`[MSG] jid=${jid} fromMe=${fromMe} text="${text.substring(0, 60)}"`);

      if (!text.trim()) continue;
      if (text.startsWith('>>')) continue;
      if (!jid.endsWith('@g.us')) continue; // només grups

      // Si el grup objectiu no s'ha trobat encara, intenta ara
      if (!targetGroupId) await findTargetGroup(sock);
      if (!targetGroupId || jid !== targetGroupId) continue;

      await processMessage(sock, jid, text);
    }
  });

  return sock;
}

// ─── Cerca el grup ────────────────────────────────────────────────────────────
async function findTargetGroup(sock) {
  try {
    const groups = await sock.groupFetchAllParticipating();
    const entries = Object.values(groups);
    console.log(`[GRUPS] Trobats ${entries.length} grups:`);
    entries.forEach(g => console.log(`  - "${g.subject}" (${g.id})`));

    const group = entries.find(g => g.subject === GROUP_NAME);
    if (group) {
      targetGroupId = group.id;
      console.log(`[OK] Grup objectiu: "${group.subject}" → ${group.id}`);
    } else {
      console.warn(`[WARN] No s'ha trobat el grup "${GROUP_NAME}"`);
    }
  } catch (err) {
    console.error('[ERR] Error cercant grups:', err.message);
  }
}

// ─── Processament de missatges ────────────────────────────────────────────────
async function processMessage(sock, jid, text) {
  const body = text.trim().toLowerCase();

  if (body === '!netejar' || body === '!neteja') {
    await clearCompletedItems();
    await sock.sendMessage(jid, { text: '>> Llista netejada!' });
    return;
  }

  if (body === '!llista') {
    const items = await getHAItems();
    if (items.length === 0) {
      await sock.sendMessage(jid, { text: '>> La llista esta buida!' });
      return;
    }
    const groups = {};
    for (const item of items) {
      const cat = CATEGORIES.find(c => item.summary.startsWith(c.icon)) || { id: 'altres', icon: '🛒', name: 'Altres' };
      if (!groups[cat.id]) groups[cat.id] = { ...cat, items: [] };
      groups[cat.id].items.push(item);
    }
    let txt = '';
    for (const cat of CATEGORIES) {
      const g = groups[cat.id];
      if (!g) continue;
      txt += `\n${cat.icon} *${cat.name}*\n`;
      for (const item of g.items) {
        const check = item.status === 'completed' ? '✅' : '◻️';
        const name = item.summary.replace(/^\S+\s/, '').trim();
        txt += `${check} ${name}\n`;
      }
    }
    const pending = items.filter(i => i.status === 'needs_action').length;
    const done = items.filter(i => i.status === 'completed').length;
    await sock.sendMessage(jid, { text: `>> 🛒 *Llista de la compra*\n${pending} pendents · ${done} fets\n${txt}` });
    return;
  }

  // Categoritza i afegeix
  console.log('[BOT] Categoritzant...');
  const items = await categorizeItems(text);
  if (items.length === 0) {
    console.log('[INFO] Cap article detectat.');
    return;
  }
  console.log(`[OK] Articles detectats: ${items.map(i => i.name).join(', ')}`);
  const existingItems = await getHAItems();
  for (const item of items) {
    const cat = getCategoryInfo(item.category_id);
    const itemName = `${cat.icon} ${item.name}`;
    await upsertItemToHA(itemName, existingItems);
  }
}

// ─── HA API ───────────────────────────────────────────────────────────────────
async function haRequest(method, path, body = null, returnResponse = false) {
  const url = returnResponse
    ? `${HA_URL}/api/${path}?return_response=true`
    : `${HA_URL}/api/${path}`;
  const opts = {
    method,
    headers: { 'Authorization': `Bearer ${HA_TOKEN}`, 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HA ${method} ${path} -> ${res.status}: ${t}`);
  }
  return res.json().catch(() => ({}));
}

function normalizeItemName(name) {
  return name.toLowerCase()
    .replace(/^\S+\s/, '') // treu emoji inicial
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function upsertItemToHA(itemName, existingItems) {
  try {
    const normNew = normalizeItemName(itemName);
    const existing = existingItems.find(i => normalizeItemName(i.summary) === normNew);

    if (existing) {
      if (existing.status === 'completed') {
        // Existeix i està fet → desmarca'l
        await haRequest('POST', 'services/todo/update_item', {
          entity_id: TODO_ENTITY,
          item: existing.summary,
          status: 'needs_action'
        });
        console.log(`[HA] Desmarcat: ${existing.summary}`);
      } else {
        // Existeix i ja és actiu → ignora
        console.log(`[HA] Ja existeix actiu: ${itemName}`);
      }
    } else {
      // No existeix → afegeix
      await haRequest('POST', 'services/todo/add_item', { entity_id: TODO_ENTITY, item: itemName });
      console.log(`[HA] Afegit: ${itemName}`);
    }
  } catch (err) {
    console.error(`[HA] Error amb "${itemName}":`, err.message);
  }
}

async function getHAItems() {
  try {
    const data = await haRequest('POST', 'services/todo/get_items', { entity_id: TODO_ENTITY }, true);
    return data?.service_response?.[TODO_ENTITY]?.items || [];
  } catch (err) {
    console.error('[HA] Error llegint items:', err.message);
    return [];
  }
}

async function clearCompletedItems() {
  try {
    await haRequest('POST', 'services/todo/remove_completed_items', { entity_id: TODO_ENTITY });
    console.log('[HA] Items completats eliminats.');
  } catch (err) {
    console.error('[HA] Error netejant:', err.message);
  }
}

// ─── Arrenca ──────────────────────────────────────────────────────────────────
console.log('[START] Iniciant WA Shopping Bot (Baileys)...');
connectToWhatsApp().catch(err => console.error('[ERR] Fatal:', err));
