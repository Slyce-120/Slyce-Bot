import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
// Importiamo il servizio che abbiamo creato nel file risposte-ai.js
import { createAIService } from './risposte-ai.js'; 

// ==========================================
// CONFIGURAZIONE CHIAVE API
// Sostituisci la stringa qui sotto con la tua API KEY di OpenAI
const OPENAI_KEY = 'IL_TUO_TOKEN_OPENAI_QUI';
// ==========================================

const bloodbot = createAIService(OPENAI_KEY);

const PERM = {
  ADMIN: 'admin',
  OWNER: 'owner',
  sam: 'sam',
};

const featureRegistry = [
  { key: 'bestemmiometro', store: 'chat', perm: PERM.ADMIN, name: '🤬 Bestemmiometro', desc: 'Rileva e conta le bestemmie' },
  { key: 'antidelete', store: 'chat', perm: PERM.ADMIN, name: '🗑️ Antidelete', desc: 'Recupera messaggi eliminati' },
  { key: 'welcome', store: 'chat', perm: PERM.ADMIN, name: '👋 Welcome', desc: 'Messaggio di benvenuto' },
  { key: 'goodbye', store: 'chat', perm: PERM.ADMIN, name: '🚪 Addio', desc: 'Messaggio di addio' },
  { key: 'antispam', store: 'chat', perm: PERM.ADMIN, name: '🛑 Antispam', desc: 'Protezione flood e spam' },
  { key: 'ai', store: 'chat', perm: PERM.ADMIN, name: '🧠 Bloodbot IA', desc: 'Intelligenza Artificiale attiva' },
  { key: 'vocali', store: 'chat', perm: PERM.ADMIN, name: '🎤 Siri', desc: 'Risponde con audio ai messaggi' },
  { key: 'antiLink', store: 'chat', perm: PERM.ADMIN, name: '🔗 Antilink', desc: 'Blocca link WhatsApp' },
  { key: 'antiprivato', store: 'bot', perm: PERM.OWNER, name: '🔒 Blocco privato', desc: 'Blocca chi scrive in DM al bot' },
  { key: 'soloe', store: 'bot', perm: PERM.sam, name: '👑 Solocreatore', desc: 'Bot utilizzabile solo da Blood' },
  // ... puoi aggiungere gli altri moduli qui sotto seguendo lo stesso schema
];

const aliasMap = new Map();
featureRegistry.forEach(f => {
  aliasMap.set(f.key.toLowerCase(), f);
});

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isSam }) => {
  const isEnable = ['enable', 'attiva', 'on', '1'].includes(command?.toLowerCase());
  const userName = m.pushName || 'User';

  // Inizializzazione DB se non esiste
  global.db.data.chats = global.db.data.chats || {};
  global.db.data.settings = global.db.data.settings || {};
  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});
  const botJid = conn.decodeJid(conn.user.jid);
  const bot = global.db.data.settings[botJid] || (global.db.data.settings[botJid] = {});

  // 1. LOGICA RISPOSTA IA (Si attiva se chat.ai è ON)
  // Il bot risponde se: modulo AI attivo E (Chat Privata OPPURE Tag al bot)
  const isMentioned = m.mentionedJid?.includes(botJid) || m.text?.includes(botJid.split('@')[0]);
  
  if (!command && chat.ai && m.text && !m.fromMe && (!m.isGroup || isMentioned)) {
    try {
      // Puliamo il testo dal tag del bot per non confondere l'IA
      const textClean = m.text.replace(new RegExp(`@${botJid.split('@')[0]}`, 'gi'), '').trim();
      
      const reply = await bloodbot.generateReply({
        messageText: textClean || "Ciao Bloodbot",
        authorName: userName,
        chatName: m.isGroup ? (m.chatName || 'Gruppo') : 'Privato',
        chatId: m.chat
      });
      
      if (reply) return conn.reply(m.chat, reply, m);
    } catch (e) {
      console.error('Errore Bloodbot IA:', e);
    }
  }

  // 2. GESTIONE COMANDI ATTIVA/DISATTIVA
  if (args[0] && ['enable', 'disable', 'attiva', 'disattiva', 'on', 'off'].includes(command?.toLowerCase())) {
    let type = args[0].toLowerCase();
    const feat = aliasMap.get(type);
    if (!feat) return m.reply(`『 ❌ 』 Modulo *${type}* non trovato.`);

    // Controllo Permessi
    if (feat.perm === PERM.sam && !isSam) return m.reply('『 ❌ 』 Accesso negato.');
    if (feat.perm === PERM.OWNER && !isOwner && !isSam) return m.reply('『 ❌ 』 Accesso negato.');
    if (feat.perm === PERM.ADMIN && m.isGroup && !(isAdmin || isOwner || isSam)) return m.reply('『 ❌ 』 Solo per Admin.');

    const target = feat.store === 'bot' ? bot : chat;
    target[feat.key] = isEnable;
    
    // Se spegniamo l'AI, cancelliamo la memoria locale della chat
    if (feat.key === 'ai' && !isEnable) bloodbot.resetHistory(m.chat);

    return m.reply(`*〘 📡 BLD-SYSTEM 〙*\n\nModulo: *${feat.name}*\nStato: *${isEnable ? 'ATTIVATO 🟢' : 'DISATTIVATO 🔴'}*`);
  }

  // 3. MOSTRA IL MENU SE NON CI SONO ARGOMENTI
  if (['enable', 'disable', 'attiva', 'disattiva'].includes(command?.toLowerCase())) {
    const getStatus = (f) => (f.store === 'bot' ? bot[f.key] : chat[f.key]) ? '🟢' : '🔴';

    let menu = `┎━━━━━━━━━━━━━━━━━━━━┑\n┃   ✧  𝐁𝐋𝐃 - 𝐌𝐀𝐒𝐓𝐄𝐑 𝐂𝐎𝐍𝐓𝐑𝐎𝐋  ✧   ┃\n┖━━━━━━━━━━━━━━━━━━━━┙\n\n*〘 ɪɴsᴛʀᴜᴢɪᴏɴɪ 〙*\n> .attiva <nome>\n> .disattiva <nome>\n\n`;

    featureRegistry.forEach(f => {
      menu += `┇ ${getStatus(f)} ${f.name}\n┇ ➤ *${f.key}*\n┇\n`;
    });

    menu += `_ʙʟᴅ-ʙᴏᴛ sᴇᴄᴜʀɪᴛʏ ɪɴᴛᴇʀꜰᴀᴄᴇ_`;

    return conn.sendMessage(m.chat, { text: menu }, { quoted: m });
  }
};

handler.help = ['attiva', 'disattiva'];
handler.tags = ['main'];
handler.command = ['enable', 'disable', 'attiva', 'disattiva', 'on', 'off'];

export default handler;
