import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { createAIService } from './risposte-ai.js'; 

// ==========================================
// CONFIGURAZIONE CHIAVE API - INSERITA ✅
const OPENAI_KEY = 'Sk-proj-9Ip3i319NNppry7Jl5VQ_0WJmHcVBwnE-_LvFPd3YUT8s07J1PT4g_ncgZHRi6eMjIe836ZjpvT3BlbkFJOkYgGWNqN4wGXbzfikfSivwLzkGqsv0rreiQl6BPtHwzMQ7zQ8JRQGmlAUWJTen1Oa3SlFGyoA'; 
// ==========================================

const bloodbot = createAIService(OPENAI_KEY);

const PERM = { ADMIN: 'admin', OWNER: 'owner', sam: 'sam' };

const featureRegistry = [
  { key: 'bestemmiometro', store: 'chat', perm: PERM.ADMIN, name: '🤬 Bestemmiometro', desc: 'Rileva e conta le bestemmie' },
  { key: 'antidelete', store: 'chat', perm: PERM.ADMIN, name: '🗑️ Antidelete', desc: 'Recupera messaggi eliminati' },
  { key: 'antispam', store: 'chat', perm: PERM.ADMIN, name: '🛑 Antispam', desc: 'Protezione flood e spam' },
  { key: 'ai', store: 'chat', perm: PERM.ADMIN, name: '🧠 Bloodbot IA', desc: 'Intelligenza Artificiale attiva' },
  { key: 'registrazioni', store: 'bot', perm: PERM.OWNER, name: '📛 Registrazione', desc: 'Obbligo registrazione utenti' },
  { key: 'antigore', store: 'chat', perm: PERM.ADMIN, name: '🚫 Antigore', desc: 'Blocca contenuti splatter' },
  { key: 'antiporno', store: 'chat', perm: PERM.ADMIN, name: '🔞 Antiporno', desc: 'Filtro contenuti NSFW' }
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
  const bot = global.db.data.settings[botJid] || (global.db.data.settings[botJid] = {});

  // --- LOGICA RISPOSTA BLOODBOT ---
  const isMentioned = m.mentionedJid?.includes(botJid) || m.text?.includes(botJid.split('@')[0]);
  const shouldReply = chat.ai && !command && (!m.isGroup || isMentioned);

  if (shouldReply && m.text && !m.fromMe) {
    const textClean = m.text.replace(new RegExp(`@${botJid.split('@')[0]}`, 'gi'), '').trim();
    const reply = await bloodbot.generateReply({
      messageText: textClean || "Ciao",
      authorName: userName,
      chatId: m.chat
    });
    if (reply) return conn.reply(m.chat, reply, m);
  }

  // --- GESTIONE COMANDI ---
  if (args[0] && ['enable', 'disable', 'attiva', 'disattiva', 'on', 'off'].includes(command?.toLowerCase())) {
    let type = args[0].toLowerCase();
    const feat = aliasMap.get(type);
    if (!feat) return m.reply(`『 ❌ 』 Modulo *${type}* non trovato.`);

    const target = feat.store === 'bot' ? bot : chat;
    target[feat.key] = isEnable;
    
    if (feat.key === 'ai' && !isEnable) bloodbot.resetHistory(m.chat);

    return m.reply(`*〘 📡 BLD-SYSTEM 〙*\n\nModulo: *${feat.name}*\nStato: *${isEnable ? 'ATTIVATO 🟢' : 'DISATTIVATO 🔴'}*`);
  }

  // --- MENU VISIVO ---
  if (['enable', 'disable', 'attiva', 'disattiva'].includes(command?.toLowerCase())) {
    const getStatus = (f) => (f.store === 'bot' ? bot[f.key] : chat[f.key]) ? '🟢' : '🔴';
    let menu = `┎━━━━━━━━━━━━━━━━━━━━┑\n┃   ✧  𝐁𝐋𝐃 - 𝐌𝐀𝐒𝐓𝐄𝐑 𝐂𝐎𝐍𝐓𝐑𝐎𝐋  ✧   ┃\n┖━━━━━━━━━━━━━━━━━━━━┙\n\n`;
    featureRegistry.forEach(f => {
        menu += `┇ ${getStatus(f)} ${f.name}\n┇ ➤ *${f.key}*\n┇\n`;
    });
    return conn.sendMessage(m.chat, { text: menu }, { quoted: m });
  }
};

handler.help = ['attiva', 'disattiva'];
handler.tags = ['main'];
handler.command = ['enable', 'disable', 'attiva', 'disattiva', 'on', 'off'];

export default handler;
