let handler = async (m, { conn, usedPrefix, command }) => {
  
  // Se il comando eseguito è 'git' o 'insta', manda solo il link e chiudi la funzione
  if (command === 'git') {
    return await conn.reply(m.chat, '💻 *GitHub:* non disponibile', m)
  }
  if (command === 'insta') {
    return await conn.reply(m.chat, '📸 *Instagram:* https://www.instagram.com/zeus_ilreal?igsh=OHFmdTduaTl4aTNh&utm_source=qr', m)
  }

  // Se invece il comando è 'owner' o 'creatore', manda il box con i bottoni
  let mention = `@${m.sender.split('@')[0]}`
  let text = `
*╭───╼ ⚡ ╾───╮*
   *DEVELOPER INFO*
*╰───╼ 👑 ╾───╯*

👋 Ciao ${mention}, 
ecco i riferimenti ufficiali del mio creatore.

*┏━━━━━━━━━━━━━━━━┓*
*┃* 👤 *OWNER:* Slyce
*┃* 🪐 *STATUS:* Online
*┃* 💻 *DEV:* JavaScript / Node.js
*┗━━━━━━━━━━━━━━━━┛*

━━━━━━━━━━━━━━━━━━━━
   *😈 ˢᴸʸᶜᴱ 𝖉𝖔𝖒𝖎𝖓𝖆 ⚡*
━━━━━━━━━━━━━━━━━━━━`.trim()

  const buttons = [
    { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '🛡️ MENU' }, type: 1 },
    { buttonId: `${usedPrefix}ping`, buttonText: { displayText: '⚡ STATUS' }, type: 1 },
    { buttonId: `${usedPrefix}git`, buttonText: { displayText: '💻 GITHUB' }, type: 1 },
    { buttonId: `${usedPrefix}insta`, buttonText: { displayText: '📸 INSTAGRAM' }, type: 1 }
  ]

  const buttonMessage = {
      text: text,
      footer: 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ˢᴸʸᶜᴱ ʙᴏᴛ',
      buttons: buttons,
      headerType: 1,
      mentions: [m.sender]
  }

  await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
}

handler.help = ['owner']
handler.tags = ['info']
// Registriamo tutti i comandi necessari
handler.command = ['owner', 'creatore', 'git', 'insta'] 

export default handler
