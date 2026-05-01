const handler = async (m, { conn, command }) => {
  const groups = await conn.groupFetchAllParticipating();
  const jids = Object.keys(groups);

  if (!jids.length) return m.reply('⚠️ Nessun gruppo trovato.');

  const isClose = command === 'chiusogp';
  const action = isClose ? 'announcement' : 'not_announcement';
  
  m.reply(`🚀 Esecuzione rapida su ${jids.length} gruppi...`);

  let success = 0;
  let failed = 0;

  const chunks = [];
  for (let i = 0; i < jids.length; i += 5) {
    chunks.push(jids.slice(i, i + 5));
  }

  for (const chunk of chunks) {
    await Promise.all(chunk.map(async (jid) => {
      try {
        await conn.groupSettingUpdate(jid, action);
        success++;
      } catch (e) {
        failed++;
      }
    }));
    await new Promise(res => setTimeout(res, 1000));
  }

  m.reply(`✅ Operazione conclusa.\n\n🟢 Riusciti: ${success}\n🔴 Falliti: ${failed}\n\nNota: Se molti sono falliti, assicurati che il bot sia ADMIN.`);
};

handler.help = ['chiusogp', 'apertogp'];
handler.tags = ['owner'];
handler.command = ['chiusogp', 'apertogp'];
handler.owner = true;

export default handler;
