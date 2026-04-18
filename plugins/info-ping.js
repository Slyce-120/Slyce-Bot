import os from 'os'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    // Misurazione Nanometrica (High-Resolution Time)
    const start = process.hrtime.bigint()
    await conn.readMessages([m.key])
    const end = process.hrtime.bigint()
    
    // Calcolo latenza convertendo nanosecondi in millisecondi (con 6 decimali)
    const latency = (Number(end - start) / 1000000).toFixed(6)
    
    const uptimeMs = process.uptime() * 1000
    const { rss, heapUsed, heapTotal } = process.memoryUsage()
    
    // Load Average (Precisione Linux)
    const load = os.loadavg().map(l => l.toFixed(2)).join(' | ')
    const cpu = os.cpus()[0].model.replace(/Core\(TM\)|CPU|@|骁龙|Processor|with IBPB/g, '').trim()

    const message = `
🩸 *ＢＬＯＯＤ ＳＹＳＴＥＭ* 🩸
『 *ᴘᴇʀғᴏʀᴍᴀɴᴄᴇ ᴍᴏɴɪᴛᴏʀ* 』

┏━━━━━━━━━━━━━━━━━━━━━┓
┃ 🧪 *LATENZA:* \`${latency} ms\`
┃ ⏳ *UPTIME:* \`${clockString(uptimeMs)}\`
┃ 📡 *HOST:* \`${os.platform().toUpperCase()}\`
┗━━━━━━━━━━━━━━━━━━━━━┛

   〔 *🖥️ HARDWARE DATA* 〕
  
   ◈ *CPU:* \`${cpu}\`
   ◈ *LOAD:* \`${load}\`
   ◈ *RAM:* \`${(heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)}GB\`
   ◈ *HEAP:* \`${(heapTotal / 1024 / 1024).toFixed(2)} MB\`
   ◈ *RSS:* \`${(rss / 1024 / 1024).toFixed(2)} MB\`

   ┍━━━━━━━━━━━━━━━━━━━━━┑
      *OFFLINE IS NOT AN OPTION*
   ┕━━━━━━━━━━━━━━━━━━━━━┙

      *OWNER:* *BLOOD*
`.trim()

    await conn.sendMessage(m.chat, {
      text: message,
      contextInfo: {
        externalAdReply: {
          title: `[ ⚡ ] PRECISION: ${latency}ms`,
          body: `LOAD: ${load}`,
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
  return `${h}h ${m}m ${s}s`
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^(ping)$/i

export default handler
