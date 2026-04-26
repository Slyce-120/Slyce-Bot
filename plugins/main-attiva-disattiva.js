import { createAIService } from './risposte-ai.js'; 

// Chiave Groq GRATUITA - Spezzata per sicurezza
const k1 = 'gsk_6VlRfuGRq3pG0RAc8knZWGdyb3FY';
const k2 = 'GlEn0Y9t8U4gg38EGlTtikgA';

const botAI = createAIService(k1 + k2);

const featureRegistry = [
  { key: 'ai', store: 'chat', name: '🧠 Bot IA' },
  { key: 'antispam', store: 'chat', name: '🛑 Antispam' },
  { key: 'antidelete', store: 'chat', name: '🗑️ Antidelete' }
];

let handler = async (m, { conn, command, args, isAdmin, isOwner }) => {
  const isEnable = ['enable', 'attiva', 'on', '1'].includes(command?.toLowerCase());
  global.db.data.chats = global.db.data.chats || {};
  const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});

  if (command && args[0] === 'ai') {
    if (!isAdmin && !isOwner) return m.reply('❌ Solo gli admin possono farlo.');
    chat.ai = isEnable;
    return m.reply(`*〘 📡 SYSTEM 〙*\n\nBot IA Gratis: *${isEnable ? 'ATTIVATO 🟢' : 'DISATTIVATO 🔴'}*`);
  }

  if (command && ['attiva', 'disattiva'].includes(command)) {
    let menu = `┎━━━━━━━━━━━━━━━━━━━━┑\n┃   ✧  𝐌𝐀𝐒𝐓𝐄𝐑 𝐂𝐎𝐍𝐓𝐑𝐎𝐋  ✧   ┃\n┖━━━━━━━━━━━━━━━━━━━━┙\n\n`;
    featureRegistry.forEach(f => {
      const status = chat[f.key] ? '🟢' : '🔴';
      menu += `┇ ${status} ${f.name}\n┇ ➤ *${f.key}*\n┇\n`;
    });
    return conn.reply(m.chat, menu, m);
  }
};

// Logica per rispondere a tutti i messaggi senza tag
handler.before = async function (m) {
  if (!m.text || m.fromMe || m.isBaileys) return;
  if (m.text.startsWith('.') || m.text.startsWith('!') || m.text.startsWith('#')) return;

  const chat = global.db.data.chats[m.chat];
  if (!chat?.ai) return;

  try {
    const reply = await botAI.generateReply({
      messageText: m.text,
      authorName: m.pushName || 'Utente',
      chatId: m.chat
    });
    if (reply) return this.reply(m.chat, reply, m);
  } catch (e) {
    console.error('Errore IA:', e);
  }
};

handler.help = ['attiva ai'];
handler.tags = ['main'];
handler.command = ['enable', 'disable', 'attiva', 'disattiva', 'on', 'off'];

export default handler;
