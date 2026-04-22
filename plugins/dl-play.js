import yts from 'yt-search';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import os from 'os';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🩸 *𝐁𝐋𝐎𝐎𝐃 𝐁𝐎𝐓*\n\n💡 _Scrivi:_ ${usedPrefix + command} nome canzone`);

  try {
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) return m.reply('⚠️ *𝗥𝗶𝘀𝘂𝗹𝘁𝗮𝘁𝗼 𝗻𝗼𝗻 𝘁𝗿𝗼𝘃𝗮𝘁𝗼.*');

    const url = vid.url;

    if (command === 'play') {
        let infoMsg = `┏━━━━━━━━━━━━━━━━━━━━┓\n`;
        infoMsg += `   🎧  *𝐁𝐋𝐎𝐎𝐃 𝐁𝐎𝐓 𝐏𝐋𝐀𝐘𝐄𝐑* 🎧\n`;
        infoMsg += `┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        infoMsg += `◈ 📌 *𝗧𝗶𝘁𝗼𝗹𝗼:* ${vid.title}\n`;
        infoMsg += `◈ ⏱️ *𝗗𝘂𝗿𝗮𝘁𝗮:* ${vid.timestamp}\n\n`;
        infoMsg += `*𝗦𝗲𝗹𝗲𝘇𝗶𝗼𝗻𝗮 𝗶𝗹 𝗳𝗼𝗿𝗺𝗮𝘁𝗼:*`;

        return await conn.sendMessage(m.chat, {
            image: { url: vid.thumbnail },
            caption: infoMsg,
            footer: '𝐁𝐋𝐎𝐎𝐃 𝐁𝐎𝐓 • 𝟤𝟢𝟤𝟨',
            buttons: [
                { buttonId: `${usedPrefix}playaud ${url}`, buttonText: { displayText: '🎵 𝗔𝗨𝗗𝗜𝗢 (𝗠𝗣𝟯)' }, type: 1 },
                { buttonId: `${usedPrefix}playvid ${url}`, buttonText: { displayText: '🎬 𝗩𝗜𝗗𝗘𝗢 (𝗠𝗣𝟰)' }, type: 1 }
            ],
            headerType: 4
        }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { react: { text: "🩸", key: m.key } });

    let downloadUrl = null;
    let success = false;
    const isAudio = command === 'playaud';

    // Lista API aggiornate 2026 (Rotazione Automatica)
    const apiList = [
        `https://api.alyachan.dev/api/ytmp${isAudio ? '3' : '4'}?url=${url}`,
        `https://api.maher-zubair.tech/download/ytmp${isAudio ? '3' : '4'}?url=${url}`,
        `https://api.siputzx.my.id/api/d/ytmp${isAudio ? '3' : '4'}?url=${url}`,
        `https://api.lolhuman.xyz/api/ytmp${isAudio ? '3' : '4'}?apikey=GataDios&url=${url}`
    ];

    for (let api of apiList) {
        try {
            console.log(`[BLOOD BOT] Provando server: ${api}`);
            let res = await fetch(api);
            let json = await res.json();
            
            // Estrazione link universale
            downloadUrl = json.data?.url || json.result?.url || json.result?.download_url || json.result?.dl || json.result?.link || json.url;
            
            if (downloadUrl && downloadUrl.startsWith('http')) {
                success = true;
                break;
            }
        } catch (e) {
            console.error(`[BLOOD BOT] Server fallito, passo al successivo...`);
        }
    }

    if (!success || !downloadUrl) {
        throw new Error('Tutti i server di download sono attualmente offline.');
    }

    const tmpDir = os.tmpdir();
    const filePath = path.join(tmpDir, `blood_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`);

    // Download effettivo del file
    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error('Il server ha rifiutato il download.');
    
    const buffer = await response.buffer();
    fs.writeFileSync(filePath, buffer);

    if (isAudio) {
        await conn.sendMessage(m.chat, {
            audio: fs.readFileSync(filePath),
            mimetype: 'audio/mpeg',
            fileName: `${vid.title}.mp3`,
            ptt: false
        }, { quoted: m });
    } else {
        await conn.sendMessage(m.chat, {
            video: fs.readFileSync(filePath),
            mimetype: 'video/mp4',
            caption: `✅ *𝐒𝐜𝐚𝐫𝐢𝐜𝐚𝐭𝐨 𝐝𝐚 𝐁𝐋𝐎𝐎𝐃 𝐁𝐎𝐓*`,
        }, { quoted: m });
    }

    // Pulizia
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (e) {
    console.error('ERRORE CRITICO:', e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`🚀 *𝐁𝐋𝐎𝐎𝐃 𝐁𝐎𝐓 𝐄𝐑𝐑𝐎𝐑:*\n\nI server di YouTube sono sovraccarichi o il file è troppo grande. Riprova tra poco.`);
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|playaud|playvid)$/i;

export default handler;
