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
        let infoMsg = `┏━━━━━━━━━━━━━━━━━━━━┓\n   🎧  *𝐁𝐋𝐎𝐎𝐃 𝐁𝐎𝐓 𝐏𝐋𝐀𝐘𝐄𝐑* 🎧\n┗━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        infoMsg += `◈ 📌 *𝗧𝗶𝘁𝗼𝗹𝗼:* ${vid.title}\n◈ ⏱️ *𝗗𝘂𝗿𝗮𝘁𝗮:* ${vid.timestamp}\n\n*𝗦𝗲𝗹𝗲𝘇𝗶𝗼𝗻𝗮 𝗶𝗹 𝗳𝗼𝗿𝗺𝗮𝘁𝗼:*`;

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
    const isAudio = command === 'playaud';

    // NUOVA LISTA API - AGGIORNATA ORA
    const apiList = [
        `https://api.guruapi.tech/ytdl/video?url=${url}`, // Prova GuruAPI (molto potente)
        `https://api.pts-ofc.xyz/api/download/ytmp${isAudio ? '3' : '4'}?url=${url}`,
        `https://widipe.com/download/ytmp${isAudio ? '3' : '4'}?url=${url}`,
        `https://api.fgmods.xyz/api/downloader/ytmp${isAudio ? '3' : '4'}?url=${url}&apikey=fg-852` 
    ];

    for (let api of apiList) {
        try {
            console.log(`[BLOOD] Test server: ${api}`);
            let res = await fetch(api);
            let json = await res.json();
            
            // Gestione specifica per GuruAPI e Widipe
            downloadUrl = json.result?.url || json.result?.download_url || json.result?.dl_url || json.dl_url || json.url;
            
            if (downloadUrl && typeof downloadUrl === 'string' && downloadUrl.startsWith('http')) break;
        } catch (e) {
            continue;
        }
    }

    if (!downloadUrl) {
        throw new Error('SERVER_OFFLINE');
    }

    const tmpDir = os.tmpdir();
    const filePath = path.join(tmpDir, `blood_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`);

    const response = await fetch(downloadUrl);
    const buffer = await response.buffer();
    fs.writeFileSync(filePath, buffer);

    if (isAudio) {
        await conn.sendMessage(m.chat, {
            audio: fs.readFileSync(filePath),
            mimetype: 'audio/mpeg',
            fileName: `${vid.title}.mp3`
        }, { quoted: m });
    } else {
        await conn.sendMessage(m.chat, {
            video: fs.readFileSync(filePath),
            mimetype: 'video/mp4',
            caption: `✅ *𝐒𝐜𝐚𝐫𝐢𝐜𝐚𝐭𝐨 𝐝𝐚 𝐁𝐋𝐎𝐎𝐃 𝐁𝐎𝐓*`
        }, { quoted: m });
    }

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (e) {
    console.error('ERRORE FINALE:', e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`🚀 *𝐁𝐋𝐎𝐎𝐃 𝐁𝐎𝐓 𝐄𝐑𝐑𝐎𝐑:*\n\nNessun server disponibile. Probabile restrizione IP di YouTube. Riprova più tardi.`);
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|playaud|playvid)$/i;

export default handler;
