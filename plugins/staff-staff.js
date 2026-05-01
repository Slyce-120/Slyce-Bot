let handler = async (m, { conn, command, usedPrefix }) => {
    let staff = `
ㅤㅤ⋆｡˚『 ╭ \`STAFF 𝑺𝑳𝒀𝑪𝑬 𝑩𝑶𝑻\` ╯ 』˚｡⋆\n╭\n│
│ 『 🤖 』 \`Bot:\` *${global.nomebot}*
│ 『 🍥 』 \`Versione:\` *${global.versione}*
│
│⭒─ׄ─『 👑 \`Sviluppatore\` 』 ─ׄ─⭒
│
│ • \`Nome:\` ꪶ͢ 𝓩𝓮𝓾𝓼 ꫂ ⁷⁷⁷
│ • \`Ruolo:\` *Creatore / dev*
│ • \`Contatto:\` @393762257368
│
│⭒─ׄ─『 🛡️ \`Moderatori\` 』 ─ׄ─⭒
│
│ • \`Nome:\` *Death*
│ • \`Ruolo:\` *Moderatore*
│─ׄ─『 📌 \`Info Utili\` 』 ─ׄ─⭒
│
│ 
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
    await conn.reply(
        m.chat, 
        staff.trim(), 
        m, 
        { 
            ...global.fake,
            contextInfo: {
                ...global.fake.contextInfo,
                mentionedJid: ['393476686131@s.whatsapp.net', '67078163216@s.whatsapp.net', '393511082922@s.whatsapp.net'],
                externalAdReply: {
                    renderLargerThumbnail: true,
                    title: 'STAFF - UFFICIALE',
                    body: 'Supporto e Moderazione',
                    mediaType: 1,
                    sourceUrl: 'varebot',
                    thumbnailUrl: 'https://i.ibb.co/rfXDzMNQ/aizenginnigga.jpg'
                }
            }
        }
    );

    await conn.sendMessage(m.chat, {
        contacts: {
            contacts: [
                {
                    vcard: `BEGIN:VCARD
VERSION:3.0
FN:slyce
ORG:SlyceBot - Creatore
TEL;type=CELL;type=VOICE;waid=393476686131:+393476686131
END:VCARD`
                },
                {
                    vcard: `BEGIN:VCARD
VERSION:3.0
FN: DEATH 
ORG:SlyceBot - Moderatore
TEL;type=CELL;type=VOICE;waid=67078163216:+67078163216
END:VCARD`
                },
                {
                    vcard: `BEGIN:VCARD
VERSION:3.0
FN:
ORG:VareBot -
TEL;type=CELL;type=VOICE;waid=393511082922:+393511082922
END:VCARD`
                }
            ]
        }
    }, { quoted: m });

    m.react('🉐');
};

handler.help = ['staff'];
handler.tags = ['main'];
handler.command = ['staff', 'moderatori', 'collaboratori'];

export default handler;