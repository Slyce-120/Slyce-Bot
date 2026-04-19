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

  // Struttura bottoni V1 (quella che hai confermato funzionante)
  const buttons = [
    { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '🛡️ MENU' }, type: 1 },
    { buttonId: `${usedPrefix}ping`, buttonText: { displayText: '⚡ STATUS' }, type: 1 },
    { buttonId: `.info_git`, buttonText: { displayText: '💻 GITHUB' }, type: 1 },
    { buttonId: `.info_insta`, buttonText: { displayText: '📸 INSTAGRAM' }, type: 1 }
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

// Comandi extra per far funzionare i bottoni dei link se cliccati
handler.before = async (m, { conn }) => {
  if (m.text === '.info_git') {
    await conn.reply(m.chat, '💻 *GitHub:* https://github.com/BLOOD212/BLD-BLOOD-BOT', m)
  }
  if (m.text === '.info_insta') {
    await conn.reply(m.chat, '📸 *Instagram:* https://www.instagram.com/blood_ilreal', m)
  }
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = ['owner', 'creatore']

export default handler
