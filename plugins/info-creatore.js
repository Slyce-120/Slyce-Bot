let handler = async (m, { conn }) => {
  const pp = 'https://telegra.ph/file/0c3f7614f177373f7c460.jpg' // Inserisci qui l'URL della tua immagine preferita
  const vcard = `BEGIN:VCARD
VERSION:3.0
N:;BLOOD;;;
FN:👑 BLOOD
ORG:Owner BLD-BLOOD;
TEL;type=CELL;type=VOICE;waid=393701330693:+39 370 133 0693
END:VCARD`

  let mention = `@${m.sender.split('@')[0]}`
  let text = `
*╭───╼ ⚡ ╾───╮*
   *DEVELOPER INFO*
*╰───╼ 👑 ╾───╯*

👋 Ciao ${mention}, 
ecco i riferimenti ufficiali del mio creatore.

*┏━━━━━━━━━━━━━━━━┓*
*┃* 👤 *OWNER:* Blood
*┃* 🪐 *STATUS:* Online
*┃* 💻 *DEV:* JavaScript / Node.js
*┗━━━━━━━━━━━━━━━━┛*

*───╼  SOCIAL LINKS  ╾───*
『 🔗 』*GitHub:* https://github.com/BLOOD212
『 📸 』*Instagram:* @blood_ilreal

━━━━━━━━━━━━━━━━━━━━
   *😈 𝖇𝖑𝖔𝖔𝖉 𝖉𝖔𝖒𝖎𝖓𝖆 ⚡*
━━━━━━━━━━━━━━━━━━━━`.trim()

  // Invia il contatto vCard
  await conn.sendMessage(m.chat, {
    contacts: { 
      displayName: 'BLOOD', 
      contacts: [{ vcard }] 
    }
  }, { quoted: m })

  // Invia l'immagine con testo e bottoni
  await conn.sendMessage(m.chat, {
    image: { url: pp },
    caption: text,
    footer: 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙʟᴅ ʙʟᴏᴏᴅ ʙᴏᴛ',
    mentions: [m.sender],
    buttons: [
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "📸 Instagram",
          url: "https://www.instagram.com/blood_ilreal"
        })
      },
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "💻 GitHub Repository",
          url: "https://github.com/BLOOD212/BLD-BLOOD-BOT"
        })
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "🛡️ Menu Comandi",
          id: ".menu"
        })
      }
    ]
  }, { quoted: m })
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = ['owner', 'creatore']

export default handler
