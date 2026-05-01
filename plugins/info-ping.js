import os from 'os'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    // Misurazione ad altissima precisione (Nanosecondi)
    const start = process.hrtime.bigint()
    await conn.readMessages([m.key])
    const end = process.hrtime.bigint()
    
    // Conversione in ms con precisione al millesimo
    const latency = (Number(end - start) / 1000000).toFixed(3)

    const uptimeMs = process.uptime() * 1000
    const uptimeStr = clockString(uptimeMs)

    // Calcolo esatto timestamp di avvio
    const botStartTime = new Date(Date.now() - uptimeMs)
    const activationTime = botStartTime.toLocaleString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    const message = `
╭━━━━━━•✦•━━━━━━╮
              ✨ ᴘɪɴɢ ✨
            ˢᴸʸᶜᴱ-ʙᴏᴛ
╰━━━━━━•✦•━━━━━━╯

◈ 𝖴𝗉𝗍𝗂𝗆𝖾: \`${uptimeStr}\`
◈ 𝖫𝖺𝗍𝖾𝗇𝗓𝖺: \`${latency} ms\`
◈ 𝖠𝗏𝗏𝗂𝗈: \`${activationTime}\`

╭━━━━━━•✦•━━━━━━╮
   𝖮𝗐𝗇𝖾𝗋: *𝕊𝕃𝕐ℂ𝔼*
   𝖲𝗍𝖺𝗍𝗈: _Online_
╰━━━━━━•✦•━━━━━━╯
`.trim()

    await conn.sendMessage(m.chat, {
      text: message,
      contextInfo: {
        externalAdReply: {
          title: `ˢᴸʸᶜᴱ ᴘᴇʀғᴏʀᴍᴀɴᴄᴇ ᴄᴏɴᴛʀᴏʟ`,
          body: `Latenza reale: ${latency}ms`,
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: false,
          sourceUrl: ''
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
  }
}

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor((ms % 3600000) / 60000)
  let s = Math.floor((ms % 60000) / 1000)
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^(ping)$/i

export default handler
