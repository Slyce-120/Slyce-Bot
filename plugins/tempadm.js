const handler = async (m, { conn, text, usedPrefix, command }) => {
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  else who = m.chat;

  const usage = `*⚠️ Utilizzo:* ${usedPrefix + command} @tag [numero] [s/m/h/d]`;
  
  if (!who || !text) return m.reply(usage);

  const args = text.trim().split(/\s+/);
  const duration = parseInt(args[1]);
  const unit = args[2] ? args[2].toLowerCase() : 'h';

  if (isNaN(duration)) return m.reply(usage);

  const user = global.db.data.users[who];
  if (!user) return m.reply(`*❌ Errore:* Utente non presente nel database.`);

  let timer;
  switch (unit) {
    case 's': timer = duration * 1000; break;
    case 'm': timer = duration * 60 * 1000; break;
    case 'h': timer = duration * 60 * 60 * 1000; break;
    case 'd': timer = duration * 24 * 60 * 60 * 1000; break;
    default: timer = duration * 60 * 60 * 1000;
  }

  const now = Date.now();
  user.adminTime = now + timer;
  user.tempAdmin = true;

  try {
    await conn.groupParticipantsUpdate(m.chat, [who], 'promote');
    
    const timeStr = await formatTime(timer);
    const name = '@' + who.split`@`[0];
    
    const confirmMsg = `*⚡ ADMIN TEMPORANEO IMPOSTATO*\n\n*👤 Utente:* ${name}\n*⏳ Durata:* ${duration}${unit}\n*📉 Scade tra:* ${timeStr}`;
    
    m.reply(confirmMsg, null, { mentions: [who] });

    setTimeout(async () => {
      const groupMetadata = await conn.groupMetadata(m.chat);
      const isStillAdmin = groupMetadata.participants.find(p => p.id === who && p.admin);

      if (isStillAdmin) {
        await conn.groupParticipantsUpdate(m.chat, [who], 'demote');
        conn.reply(m.chat, `*⏰ Tempo scaduto!*\nL'utente ${name} è stato rimosso dagli admin.`, null, { mentions: [who] });
        user.tempAdmin = false;
        user.adminTime = 0;
      }
    }, timer);

  } catch (e) {
    m.reply('*❌ Errore:* Impossibile promuovere l\'utente. Verifica i permessi del bot.');
  }
};

handler.help = ['tempadm @user <tempo> <s/m/h/d>'];
handler.tags = ['owner', 'group'];
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
