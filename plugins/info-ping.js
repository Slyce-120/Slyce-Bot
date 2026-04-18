import speed from 'performance-now'
import os from 'os'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    let start = speed()
    await conn.readMessages([m.key])
    let end = speed()
    
    // Precisione nanometrica
    let latency = (end - start).toFixed(4)
    const uptimeMs = process.uptime() * 1000
    const { rss, heapUsed } = process.memoryUsage()
    
    // Info Sistema
    const cpu = os.cpus()[0].model.replace(/Core\(TM\)|CPU|@|骁龙|Processor/g, '').trim()
    const platform = os.platform().toUpperCase()

    const message = `
🩸 *ＢＬＯＯＤ ＳＹＳＴＥＭ* 🩸
『 ᴘᴇʀғᴏʀᴍᴀɴᴄᴇ ᴍᴏɴɪᴛᴏʀ 』

┏━━━━━━━━━━━━━━━━━━━━━┓
┃ 🧪 *LATENZA:* \`${latency} ms\`
┃ ⏳ *UPTIME:* \`${clockString(uptimeMs)}\`
┃ 📡 *HOST:* \`${platform}\`
┗━━━━━━━━━━━━━━━━━━━━━┛

   〔 🖥️ *HARDWARE DATA* 〕
  
   ◈ **CPU:** \`${cpu}\`
   ◈ **RAM:** \`${(heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)}GB\`
   ◈ **RSS:** \`${(rss / 1024 / 1024).toFixed(2)} MB\`

   ┍━━━━━━━━━━━━━━━━━━━━━┑
      *OFFLINE IS NOT AN OPTION*
   ┕━━━━━━━━━━━━━━━━━━━━━┙

      *OWNER:* **BLOOD**
`.trim()

    await conn.sendMessage(m.chat, {
      text: message,
      contextInfo: {
        externalAdReply: {
          title: `[ ⚡ ] PING: ${latency}ms`,
          body: `System Status: Optimal`,
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: false,
          sourceUrl: 'https://github.com'
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
  return `${h}h ${m}m ${s}s`
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^(ping)$/i

export default handler
