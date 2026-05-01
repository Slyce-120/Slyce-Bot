const handler = async (m, { conn, command }) => {
  const chats = Object.entries(conn.chats)
    .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);

  if (!chats.length) return m.reply('⚠️ Nessun gruppo in memoria.');

  const isClose = command === 'chiusogp';
  const action = isClose ? 'announcement' : 'not_announcement';
  
  m.reply(`🚀 ${isClose ? 'Chiusura' : 'Apertura'} rapida di ${chats.length} gruppi...`);

  let success = 0;
  for (let [jid] of chats) {
    try {
      await conn.groupSettingUpdate(jid, action);
      success++;
      await new Promise(res => setTimeout(res, 1500));
    } catch (e) {
      console.log(`Errore su ${jid}`);
    }
  }

  m.reply(`✅ Finito! Riusciti: ${success}/${chats.length}`);
};

handler.help = ['chiusogp', 'apertogp'];
handler.tags = ['owner'];
handler.command = ['chiusogp', 'apertogp'];
handler.owner = true;

export default handler;
