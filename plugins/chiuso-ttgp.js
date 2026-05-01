const handler = async (m, { conn, command }) => {
  const chats = Object.keys(conn.chats || {}).filter(jid => jid.endsWith('@g.us'));
  
  if (!chats.length) {
    const groups = await conn.groupFetchAllParticipating().catch(_ => ({}));
    chats.push(...Object.keys(groups));
  }

  const uniqueChats = [...new Set(chats)];

  if (!uniqueChats.length)
    return m.reply('⚠️ Nessun gruppo trovato nel database.');

  const isClose = command === 'chiusogp';
  const action = isClose ? 'announcement' : 'not_announcement';
  
  m.reply(`${isClose ? '🔒 Chiusura' : '🔓 Apertura'} di ${uniqueChats.length} gruppi...`);

  for (let jid of uniqueChats) {
    try {
      await conn.groupSettingUpdate(jid, action);
      await new Promise(res => setTimeout(res, 1200));
    } catch (e) {
      console.error(`Errore su ${jid}:`, e.message);
    }
  }

  m.reply('✅ Procedura terminata.');
};

handler.help = ['chiusogp', 'apertogp'];
handler.tags = ['owner'];
handler.command = ['chiusogp', 'apertogp'];
handler.owner = true;

export default handler;
