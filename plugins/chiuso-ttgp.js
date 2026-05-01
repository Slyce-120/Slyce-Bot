const handler = async (m, { conn, command }) => {
  m.reply('⏳ Analisi permessi e avvio chiusura...');

  const groups = await conn.groupFetchAllParticipating();
  const jids = Object.keys(groups);

  if (!jids.length) return m.reply('⚠️ Nessun gruppo trovato.');

  const isClose = command === 'chiusogp';
  const action = isClose ? 'announcement' : 'not_announcement';
  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  
  let success = 0;
  let failed = 0;
  let noAdmin = 0;

  for (let jid of jids) {
    try {
      const metadata = groups[jid];
      const isBotAdmin = metadata.participants.some(p => p.id === botJid && (p.admin === 'admin' || p.admin === 'superadmin'));

      if (!isBotAdmin) {
        noAdmin++;
        continue;
      }

      await conn.groupSettingUpdate(jid, action);
      success++;
      
      await new Promise(res => setTimeout(res, 2500));
    } catch (e) {
      failed++;
      await new Promise(res => setTimeout(res, 1000));
    }
  }

  m.reply(`✅ **Risultato finale:**\n\n🟢 Riusciti: ${success}\n🟡 Saltati (Non Admin): ${noAdmin}\n🔴 Errori Tecnici: ${failed}`);
};

handler.help = ['chiusogp', 'apertogp'];
handler.tags = ['owner'];
handler.command = ['chiusogp', 'apertogp'];
handler.owner = true;

export default handler;
