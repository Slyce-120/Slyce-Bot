import { createAIService } from './risposte-ai.js'; 

// ==========================================
// CONFIGURAZIONE CHIAVE API
const OPENAI_KEY = 'Sk-proj-9Ip3i319NNppry7Jl5VQ_0WJmHcVBwnE-_LvFPd3YUT8s07J1PT4g_ncgZHRi6eMjIe836ZjpvT3BlbkFJOkYgGWNqN4wGXbzfikfSivwLzkGqsv0rreiQl6BPtHwzMQ7zQ8JRQGmlAUWJTen1Oa3SlFGyoA'; 
// ==========================================

const botAI = createAIService(OPENAI_KEY);

const PERM = { ADMIN: 'admin', OWNER: 'owner', sam: 'sam' };

const featureRegistry = [
  { key: 'bestemmiometro', store: 'chat', perm: PERM.ADMIN, name: '🤬 Bestemmiometro', desc: 'Rileva e conta le bestemmie' },
  { key: 'antidelete', store: 'chat', perm: PERM.ADMIN, name: '🗑️ Antidelete', desc: 'Recupera messaggi eliminati' },
  { key: 'antispam', store: 'chat', perm: PERM.ADMIN, name: '🛑 Antispam', desc: 'Protezione flood e spam' },
  { key: 'ai', store: 'chat', perm: PERM.ADMIN, name: '🧠 Bot IA', desc: 'Intelligenza Artificiale attiva' },
  { key: 'antigore', store: 'chat', perm: PERM.ADMIN, name: '🚫 Antigore', desc: 'Blocca contenuti splatter' },
  { key: 'antiporno', store: 'chat', perm: PERM.ADMIN, name: '🔞 Antiporno', desc: 'Filtro contenuti NSFW' },
  { key: 'welcome', store: 'chat', perm: PERM.ADMIN, name: '👋 Welcome', desc: 'Messaggio di benvenuto' },
  { key: 'antiLink', store: 'chat', perm: PERM.ADMIN, name: '🔗 Antilink', desc: 'Blocca link WhatsApp' },
  { key: 'registrazioni', store: 'bot', perm: PERM.OWNER, name: '📛 Registrazione', desc: 'Obbligo registrazione utenti' },
  { key: 'autoread', store: 'bot', perm: PERM.OWNER, name: '👀 Lettura', desc: 'Auto-visualizzazione messaggi' }
];

const aliasMap = new Map();
featureRegistry.forEach(f => aliasMap.set(f.key.toLowerCase(), f));

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isSam }) => {
  const isEnable = ['enable', 'attiva', 'on', '1'].includes(command?.toLowerCase());
  const userName = m.pushName || 'User';

  global.db.data.chats = global.db.data.chats || {};
  global.db.data.settings = global.db.data.settings || {};
  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});
  const botJid = conn.decodeJid(conn.user.jid);
  const botSettings = global.db.data.settings[botJid] || (global.db.data.settings[botJid] = {});

  // --- GESTIONE COMANDI ABILITA/DISABILITA ---
  if (args[0] && ['enable', 'disable', 'attiva', 'disattiva', 'on', 'off'].includes(command?.toLowerCase())) {
    let type = args[0].toLowerCase();
    const feat = aliasMap.get(type);
    if (!feat) return m.reply(`『 ❌ 』 Modulo *${type}* non trovato.`);

    // Controllo Permessi
    if (feat.perm === PERM.sam && !isSam) return m.reply('『 ❌ 』 Accesso negato.');
    if (feat.perm === PERM.OWNER && !isOwner && !isSam) return m.reply('『 ❌ 』 Accesso negato.');
    if (feat.perm === PERM.ADMIN && m.isGroup && !(isAdmin || isOwner || isSam)) return m.reply('『 ❌ 』 Richiesti permessi Admin.');

    const target = feat.store === 'bot' ? botSettings : chat;
    target[feat.key] = isEnable;
    
    if (feat.key === 'ai' && !isEnable) botAI.resetHistory(m.chat);

    return m.reply(`*〘 📡 SYSTEM 〙*\n\nModulo: *${feat.name}*\nStato: *${isEnable ? 'ATTIVATO 🟢' : 'DISATTIVATO 🔴'}*`);
  }

  // --- MENU DI CONTROLLO (Se scrivi solo .attiva) ---
  if (['enable', 'disable', 'attiva', 'disattiva'].includes(command?.toLowerCase())) {
    const getStatus = (f) => (f.store === 'bot' ? botSettings[f.key] : chat[f.key]) ? '🟢' : '🔴';
    let menu = `┎━━━━━━━━━━━━━━━━━━━━┑\n┃   ✧  𝐌𝐀𝐒𝐓𝐄𝐑 𝐂𝐎𝐍𝐓𝐑𝐎𝐋  ✧   ┃\n┖━━━━━━━━━━━━━━━━━━━━┙\n\n`;
    featureRegistry.forEach(f => {
      menu += `┇ ${getStatus(f)} ${f.name}\n┇ ➤ *${f.key}*\n┇\n`;
    });
    menu += `_ʙʟᴅ-ʙᴏᴛ sᴇᴄᴜʀɪᴛʏ ɪɴᴛᴇʀꜰᴀᴄᴇ_`;
    return conn.sendMessage(m.chat, { text: menu }, { quoted: m });
  }
};

// --- LOGICA RISPOSTA AUTOMATICA (Senza Tag) ---
handler.before = async function (m) {
  if (!m.text || m.fromMe || m.isBaileys) return;
  
  const chat = global.db.data.chats[m.chat];
  if (!chat?.ai) return;

  // Non rispondere se il messaggio è un comando (inizia con . ! #)
  const prefix = /^[.!#]/;
  if (prefix.test(m.text)) return;

  try {
    const reply = await botAI.generateReply({
      messageText: m.text,
      authorName: m.pushName || 'User',
      chatId: m.chat
    });

    if (reply) {
      return this.reply(m.chat, reply, m);
    }
  } catch (e) {
    console.error('Errore AI in background:', e);
  }
};

handler.help = ['attiva', 'disattiva'];
handler.tags = ['main'];
handler.command = ['enable', 'disable', 'attiva', 'disattiva', 'on', 'off'];

export default handler;
