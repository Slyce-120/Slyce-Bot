const handler = async (m, { conn, text, usedPrefix, command }) => {
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  else who = m.chat;

  const usage = `*⚠️ Utilizzo:* ${usedPrefix + command} @tag [tempo] [unità]\n\n*Esempio:* ${usedPrefix + command} @user 30 m\n*(s = secondi, m = minuti, h = ore, d = giorni)*`;
  
  if (!who || !text) return m.reply(usage);

  const args = text.trim().split(/\s+/);
  let duration = parseInt(args[1]);
  let unit = args[2] ? args[2].toLowerCase() : 'h';

  if (isNaN(duration)) {
    const match = text.match(/(\d+)([smhd])/i);
    if (match) {
      duration = parseInt(match[1]);
      unit = match[2].toLowerCase();
    } else {
      return m.reply(usage);
    }
  }

  const user = global.db.data.users[who];
  if (!user) return m.reply(`*❌ Errore:* Utente non presente nel database.`);

  let timer;
  if (unit === 's') timer = duration * 1000;
  else if (unit === 'm') timer = duration * 60 * 1000;
  else if (unit === 'h') timer = duration * 3600 * 1000;
  else if (unit === 'd') timer = duration * 86400 * 1000;
  else timer = duration * 3600 * 1000;

  try {
    await conn.groupParticipantsUpdate(m.chat, [who], 'promote');
    
    const timeStr = await formatTime(timer);
    const name = '@' + who.split`@`[0];
    
    const confirmMsg = `*⚡ ADMIN TEMPORANEO*\n\n*👤 Utente:* ${name}\n*⏳ Durata:* ${duration}${unit}\n*📉 Scade tra:* ${timeStr}`;
    
    m.reply(confirmMsg, null, { mentions: [who] });

    setTimeout(async () => {
      const groupMetadata = await conn.groupMetadata(m.chat);
      const isStillAdmin = groupMetadata.participants.find(p => p.id === who && (p.admin || p.ismember));

      await conn.groupParticipantsUpdate(m.chat, [who], 'demote');
      conn.reply(m.chat, `*⏰ Tempo scaduto!*\nL'utente ${name} è tornato un utente comune.`, null, { mentions: [who] });
    }, timer);

  } catch (e) {
    m.reply('*❌ Errore:* Verifica che il bot sia admin e che l\'utente sia nel gruppo.');
  }
};

handler.help = ['tempadm @user <tempo> <s/m/h/d>'];
handler.tags = ['group'];
handler.command = ['tempadm', 'tempadmin'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;

async function formatTime(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  seconds %= 60;
  minutes %= 60;
  hours %= 24;
  let timeString = '';
  if (days) timeString += `${days}g `;
  if (hours) timeString += `${hours}h `;
  if (minutes) timeString += `${minutes}m `;
  if (seconds) timeString += `${seconds}s`;
  return timeString.trim();
}
