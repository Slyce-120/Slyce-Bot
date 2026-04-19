let handler = async (m, { conn, usedPrefix }) => {
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

━━━━━━━━━━━━━━━━━━━━
   *😈 𝖇𝖑𝖔𝖔𝖉 𝖉𝖔𝖒𝖎𝖓𝖆 ⚡*
━━━━━━━━━━━━━━━━━━━━`.trim()

  const buttons = [
    { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '🛡️ MENU' }, type: 1 },
    { buttonId: `${usedPrefix}ping`, buttonText: { displayText: '⚡ STATUS' }, type: 1 },
    { buttonId: 'git_link', buttonText: { displayText: '💻 GITHUB' }, type: 1 },
    { buttonId: 'insta_link', buttonText: { displayText: '📸 INSTAGRAM' }, type: 1 }
  ]

  const buttonMessage = {
      text: text,
      footer: 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙʟᴅ ʙʟᴏᴏᴅ ʙᴏᴛ',
      buttons: buttons,
      headerType: 1,
      mentions: [m.sender]
  }

  try {
    await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
  } catch (e) {
    console.error("Errore invio bottoni:", e)
    await conn.reply(m.chat, text, m, { mentions: [m.sender] })
  }
}

// Funzione modificata per intercettare i Button ID correttamente
handler.before = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !m.text) return
  
  // Intercettazione tramite ID del bottone
  if (m.text === 'git_link') {
    await conn.reply(m.chat, '💻 *GitHub:* https://github.com/BLOOD212/BLD-BLOOD-BOT', m)
    return true
  }
  if (m.text === 'insta_link') {
    await conn.reply(m.chat, '📸 *Instagram:* https://www.instagram.com/blood_ilreal', m)
    return true
  }
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = ['owner', 'creatore']

export default handler
