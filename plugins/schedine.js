//by bonzino (AXION BOT)

import fs from 'fs'
import path from 'path'
import Jimp from 'jimp'

const PERCORSO_SQUADRE = './media/database/squadre.json'
const CARTELLA_CACHE = './media/seriea_cache'
const SFONDO_PATH = path.join(CARTELLA_CACHE, 'sfondo_serie_a.png')
const SNAI_PATH = './media/snai.png'

// Cambia questo se vuoi un altro sfondo
const SFONDO_URL = 'https://i.imgur.com/3GbgP6K.png'

const EVENTI = [
  'goal',
  'parata',
  'palo',
  'ammonizione',
  'var',
  'occasione',
  'corner',
  'contropiede',
  'fuorigioco',
  'traversa'
]

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num)
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function caricaSquadre() {
  try {
    const raw = fs.readFileSync(PERCORSO_SQUADRE, 'utf8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Errore caricamento squadre.json:', e)
    return []
  }
}

function pickTwoTeams() {
  const squadre = caricaSquadre()
  if (squadre.length < 2) throw new Error('Squadre insufficienti nel database')

  const casa = pickRandom(squadre)
  const trasf = pickRandom(squadre.filter(s => s.nome !== casa.nome))
  return { casa, trasf }
}

function generaQuota() {
  return (Math.random() * (4.2 - 1.55) + 1.55).toFixed(2)
}

function generaRisultato(vittoriaCasa) {
  let golCasa = Math.floor(Math.random() * 4)
  let golTrasf = Math.floor(Math.random() * 4)

  if (vittoriaCasa) {
    if (golCasa <= golTrasf) golCasa = golTrasf + 1
  } else {
    if (golTrasf <= golCasa) golTrasf = golCasa + 1
  }

  return { golCasa, golTrasf }
}

function eventoCasuale(casa, trasf) {
  const tipo = pickRandom(EVENTI)

  switch (tipo) {
    case 'goal':
      return `⚽ *𝐆𝐎𝐀𝐋!* ${pickRandom([casa, trasf])} 𝐬𝐛𝐥𝐨𝐜𝐜𝐚 𝐥𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚!`
    case 'parata':
      return `🧤 *𝐏𝐀𝐑𝐀𝐓𝐀 𝐃𝐄𝐂𝐈𝐒𝐈𝐕𝐀!* 𝐈𝐥 𝐩𝐨𝐫𝐭𝐢𝐞𝐫𝐞 𝐝𝐞𝐥 ${pickRandom([casa, trasf])} 𝐬𝐚𝐥𝐯𝐚 𝐭𝐮𝐭𝐭𝐨.`
    case 'palo':
      return `😱 *𝐏𝐀𝐋𝐎!* ${pickRandom([casa, trasf])} 𝐚 𝐮𝐧 𝐩𝐚𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐨𝐚𝐥.`
    case 'ammonizione':
      return `🟨 *𝐀𝐌𝐌𝐎𝐍𝐈𝐙𝐈𝐎𝐍𝐄* 𝐩𝐞𝐫 𝐮𝐧 𝐠𝐢𝐨𝐜𝐚𝐭𝐨𝐫𝐞 𝐝𝐞𝐥 ${pickRandom([casa, trasf])}.`
    case 'var':
      return `🖥️ *𝐕𝐀𝐑 𝐈𝐍 𝐂𝐎𝐑𝐒𝐎...* 𝐜𝐡𝐞𝐜𝐤 𝐩𝐞𝐫 𝐮𝐧 𝐞𝐩𝐢𝐬𝐨𝐝𝐢𝐨 𝐝𝐮𝐛𝐛𝐢𝐨.`
    case 'occasione':
      return `🔥 *𝐆𝐑𝐀𝐍𝐃𝐄 𝐎𝐂𝐂𝐀𝐒𝐈𝐎𝐍𝐄!* ${pickRandom([casa, trasf])} 𝐚𝐝 𝐮𝐧 𝐬𝐨𝐟𝐟𝐢𝐨 𝐝𝐚𝐥 𝐯𝐚𝐧𝐭𝐚𝐠𝐠𝐢𝐨.`
    case 'corner':
      return `🚩 *𝐂𝐀𝐋𝐂𝐈𝐎 𝐃'𝐀𝐍𝐆𝐎𝐋𝐎* 𝐢𝐧 𝐟𝐚𝐯𝐨𝐫𝐞 𝐝𝐞𝐥 ${pickRandom([casa, trasf])}.`
    case 'contropiede':
      return `⚡ *𝐂𝐎𝐍𝐓𝐑𝐎𝐏𝐈𝐄𝐃𝐄 𝐕𝐄𝐋𝐄𝐍𝐎𝐒𝐎* 𝐝𝐞𝐥 ${pickRandom([casa, trasf])}!`
    case 'fuorigioco':
      return `🚫 *𝐅𝐔𝐎𝐑𝐈𝐆𝐈𝐎𝐂𝐎* 𝐬𝐞𝐠𝐧𝐚𝐥𝐚𝐭𝐨, 𝐚𝐳𝐢𝐨𝐧𝐞 𝐬𝐟𝐮𝐦𝐚𝐭𝐚.`
    case 'traversa':
      return `😵 *𝐓𝐑𝐀𝐕𝐄𝐑𝐒𝐀!* 𝐂𝐡𝐞 𝐛𝐫𝐢𝐯𝐢𝐝𝐨 𝐩𝐞𝐫 ${pickRandom([casa, trasf])}.`
    default:
      return `⚽ *𝐏𝐚𝐫𝐭𝐢𝐭𝐚 𝐚𝐜𝐜𝐞𝐬𝐚* 𝐭𝐫𝐚 ${casa} 𝐞 ${trasf}.`
  }
}

function generaCronaca(casa, trasf) {
  return [
    { minuto: "1'", testo: `🔔 *𝐂𝐚𝐥𝐜𝐢𝐨 𝐝'𝐢𝐧𝐢𝐳𝐢𝐨!*` },
    { minuto: "9'", testo: eventoCasuale(casa.nome, trasf.nome) },
    { minuto: "18'", testo: eventoCasuale(casa.nome, trasf.nome) },
    { minuto: "27'", testo: eventoCasuale(casa.nome, trasf.nome) },
    { minuto: "36'", testo: eventoCasuale(casa.nome, trasf.nome) },
    { minuto: "45'", testo: `⏸️ *𝐅𝐢𝐧𝐞 𝐩𝐫𝐢𝐦𝐨 𝐭𝐞𝐦𝐩𝐨.*` },
    { minuto: "46'", testo: `▶️ *𝐈𝐧𝐢𝐳𝐢𝐚 𝐢𝐥 𝐬𝐞𝐜𝐨𝐧𝐝𝐨 𝐭𝐞𝐦𝐩𝐨.*` },
    { minuto: "58'", testo: eventoCasuale(casa.nome, trasf.nome) },
    { minuto: "69'", testo: eventoCasuale(casa.nome, trasf.nome) },
    { minuto: "78'", testo: eventoCasuale(casa.nome, trasf.nome) },
    { minuto: "88'", testo: eventoCasuale(casa.nome, trasf.nome) },
    { minuto: "90+'", testo: `⏳ *𝐑𝐞𝐜𝐮𝐩𝐞𝐫𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...*` }
  ]
}

async function scaricaFile(url, destinazione) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Download fallito: ${url}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  fs.writeFileSync(destinazione, buffer)
}

async function assicuratiRisorseOnline(casa, trasf) {
  if (!fs.existsSync(CARTELLA_CACHE)) {
    fs.mkdirSync(CARTELLA_CACHE, { recursive: true })
  }

  if (!fs.existsSync(SFONDO_PATH)) {
    await scaricaFile(SFONDO_URL, SFONDO_PATH)
  }

  const pathLogoCasa = path.join(CARTELLA_CACHE, casa.file)
  const pathLogoTrasf = path.join(CARTELLA_CACHE, trasf.file)

  if (!fs.existsSync(pathLogoCasa)) {
    await scaricaFile(casa.logo, pathLogoCasa)
  }

  if (!fs.existsSync(pathLogoTrasf)) {
    await scaricaFile(trasf.logo, pathLogoTrasf)
  }

  return { pathLogoCasa, pathLogoTrasf }
}

async function creaLocandinaPartita(casa, trasf, quota, puntata, vincita) {
  const { pathLogoCasa, pathLogoTrasf } = await assicuratiRisorseOnline(casa, trasf)

  const base = await Jimp.read(SFONDO_PATH)
  const logoCasa = await Jimp.read(pathLogoCasa)
  const logoTrasf = await Jimp.read(pathLogoTrasf)

  const fontBig = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE)
  const fontMed = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
  const fontSmall = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)

  logoCasa.contain(140, 140)
  logoTrasf.contain(140, 140)

  base.composite(logoCasa, 120, 130)
  base.composite(logoTrasf, 640, 130)

  base.print(fontBig, 0, 145, {
    text: 'VS',
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
  }, base.bitmap.width, 80)

  base.print(fontMed, 60, 300, casa.nome)
  base.print(fontMed, 570, 300, trasf.nome)

  base.print(fontSmall, 70, 390, `Puntata: ${formatNumber(puntata)}`)
  base.print(fontSmall, 70, 420, `Quota: x${quota}`)
  base.print(fontSmall, 70, 450, `Vincita: ${formatNumber(vincita)}`)

  const out = path.join(CARTELLA_CACHE, `match_${Date.now()}.jpg`)
  await base.quality(90).writeAsync(out)
  return out
}

async function modificaMessaggio(conn, chatId, key, testo, mentions = []) {
  await conn.relayMessage(
    chatId,
    {
      protocolMessage: {
        key,
        type: 14,
        editedMessage: {
          extendedTextMessage: {
            text: testo,
            contextInfo: mentions.length ? { mentionedJid: mentions } : {}
          }
        }
      }
    },
    {}
  )
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const who = m.sender

  if (!global.db.data.users[who]) global.db.data.users[who] = {}
  const user = global.db.data.users[who]

  if (typeof user.euro === 'undefined') user.euro = 0

  const puntata = parseInt(args[0])

  if (!puntata || isNaN(puntata) || puntata <= 0) {
    const buttons = [
      { buttonId: `${usedPrefix + command} 10`, buttonText: { displayText: '💸 Punta 10' }, type: 1 },
      { buttonId: `${usedPrefix + command} 50`, buttonText: { displayText: '💸 Punta 50' }, type: 1 },
      { buttonId: `${usedPrefix + command} 100`, buttonText: { displayText: '💸 Punta 100' }, type: 1 },
      { buttonId: `${usedPrefix + command} 500`, buttonText: { displayText: '💸 Punta 500' }, type: 1 }
    ]

    return conn.sendMessage(m.chat, {
      image: fs.readFileSync(SNAI_PATH),
      caption:
`╭━━━━━━━🎰━━━━━━━╮
✦ 𝐒𝐂𝐎𝐌𝐌𝐄𝐒𝐒𝐀 ✦
╰━━━━━━━🎰━━━━━━━╯

👤 𝐔𝐭𝐞𝐧𝐭𝐞: @${who.split('@')[0]}
💸 𝐃𝐞𝐧𝐚𝐫𝐨: ${formatNumber(user.euro)}

📝 𝐒𝐞𝐥𝐞𝐳𝐢𝐨𝐧𝐚 𝐥𝐚 𝐩𝐮𝐧𝐭𝐚𝐭𝐚`,
      footer: '⚽ 𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐒𝐜𝐨𝐦𝐦𝐞𝐬𝐬𝐞',
      buttons,
      headerType: 4,
      mentions: [who]
    }, { quoted: m })
  }

  if (user.euro < puntata) {
    return m.reply(
`╭━━━━━━━💸━━━━━━━╮
✦ 𝐃𝐄𝐍𝐀𝐑𝐎 𝐈𝐍𝐒𝐔𝐅𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄 ✦
╰━━━━━━━💸━━━━━━━╯

💼 𝐇𝐚𝐢: ${formatNumber(user.euro)}
💳 𝐏𝐮𝐧𝐭𝐚𝐭𝐚: ${formatNumber(puntata)}`
    )
  }

  const { casa, trasf } = pickTwoTeams()
  const quota = generaQuota()
  const vincita = Math.floor(puntata * Number(quota))
  const vittoriaCasa = Math.random() > 0.4
  const risultato = generaRisultato(vittoriaCasa)
  const cronaca = generaCronaca(casa, trasf)

  user.euro -= puntata

  let immaginePartita = null
  try {
    immaginePartita = await creaLocandinaPartita(casa, trasf, quota, puntata, vincita)
  } catch (e) {
    console.error('Errore creazione locandina:', e)
  }

const messaggioIniziale = await conn.sendMessage(m.chat, {
  ...(immaginePartita && fs.existsSync(immaginePartita)
    ? { image: fs.readFileSync(immaginePartita) }
    : { image: fs.readFileSync(SNAI_PATH) }),
  caption:
`╭━━━━━━━🎫━━━━━━━╮
✦ 𝐒𝐂𝐇𝐄𝐃𝐈𝐍𝐀 𝐂𝐎𝐍𝐅𝐄𝐑𝐌𝐀𝐓𝐀 ✦
╰━━━━━━━🎫━━━━━━━╯

⚔️ 𝐌𝐚𝐭𝐜𝐡: ${casa.nome} vs ${trasf.nome}

💸 𝐏𝐮𝐧𝐭𝐚𝐭𝐚: ${formatNumber(puntata)}
📈 𝐐𝐮𝐨𝐭𝐚: x${quota}
🏆 𝐕𝐢𝐧𝐜𝐢𝐭𝐚 𝐩𝐨𝐬𝐬𝐢𝐛𝐢𝐥𝐞: ${formatNumber(vincita)}

⏳ 𝐋𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐬𝐭𝐚 𝐢𝐧𝐢𝐳𝐢𝐚𝐧𝐝𝐨...`
}, { quoted: m })

const messaggioLive = await conn.sendMessage(m.chat, {
  text:
`╭━━━━━━━📡━━━━━━━╮
✦ 𝐂𝐑𝐎𝐍𝐀𝐂𝐀 𝐋𝐈𝐕𝐄 ✦
╰━━━━━━━📡━━━━━━━╯

${casa.nome} 0 - 0 ${trasf.nome}`
}, { quoted: m })

const key = messaggioLive.key
if (!key) return

  let testoLive =
`╭━━━━━━━📡━━━━━━━╮
✦ 𝐂𝐑𝐎𝐍𝐀𝐂𝐀 𝐋𝐈𝐕𝐄 ✦
╰━━━━━━━📡━━━━━━━╯

${casa.nome} 0 - 0 ${trasf.nome}
`

  for (const evento of cronaca) {
    await new Promise(r => setTimeout(r, 1800))
    testoLive += `\n${evento.minuto} ${evento.testo}`
    await modificaMessaggio(conn, m.chat, key, testoLive, [who])
  }

  await new Promise(r => setTimeout(r, 2200))

  if (vittoriaCasa) {
    user.euro += vincita

    await modificaMessaggio(conn, m.chat, key,
`╭━━━━━━━🏁━━━━━━━╮
✦ 𝐅𝐈𝐒𝐂𝐇𝐈𝐎 𝐅𝐈𝐍𝐀𝐋𝐄 ✦
╰━━━━━━━🏁━━━━━━━╯

${casa.nome} ${risultato.golCasa} - ${risultato.golTrasf} ${trasf.nome}

✅ 𝐒𝐜𝐡𝐞𝐝𝐢𝐧𝐚 𝐯𝐢𝐧𝐭𝐚

💸 +${formatNumber(vincita)}
🏦 𝐒𝐚𝐥𝐝𝐨: ${formatNumber(user.euro)}`, [who])
  } else {
    await modificaMessaggio(conn, m.chat, key,
`╭━━━━━━━🏁━━━━━━━╮
✦ 𝐅𝐈𝐒𝐂𝐇𝐈𝐎 𝐅𝐈𝐍𝐀𝐋𝐄 ✦
╰━━━━━━━🏁━━━━━━━╯

${casa.nome} ${risultato.golCasa} - ${risultato.golTrasf} ${trasf.nome}

❌ 𝐒𝐜𝐡𝐞𝐝𝐢𝐧𝐚 𝐩𝐞𝐫𝐬𝐚

📉 -${formatNumber(puntata)}
💼 𝐒𝐚𝐥𝐝𝐨: ${formatNumber(user.euro)}`, [who])
  }

  if (immaginePartita && fs.existsSync(immaginePartita)) {
    fs.unlinkSync(immaginePartita)
  }
}

handler.help = ['schedina']
handler.tags = ['giochi']
handler.command = /^(schedina|bet)$/i
handler.group = true

export default handler





usa questo sistema euro






const playAgainButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: 'Mbare dinuovo!', id: `.bandiera` })
}];

let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, usedPrefix, command }) => {
    let frasi = [
        `🇺🇳 *INDOVINA LA BANDIERA!* 🇺🇳`,
        `🌍 *Che nazione rappresenta questa bandiera?*`,
        `🏳️ *Sfida geografica: riconosci questa questa bandiera?*`,
        `🧭 *Indovina la nazione dalla sua bandiera!*`,
        `🎯 *Quiz bandiere: quale paese è questo?*`,
        `🌟 *Metti alla prova la tua conoscenza geografica!*`,
        `🔍 *Osserva attentamente e indovina la nazione!*`,
    ];

    if (m.text?.toLowerCase() === '.skipbandiera') {
        if (!m.isGroup) return m.reply('⚠️ Questo comando funziona solo nei gruppi!');
        if (!global.bandieraGame?.[m.chat]) return m.reply('⚠️ Non c\'è nessuna partita attiva in questo gruppo!');

        if (!isAdmin && !m.fromMe) {
            return m.reply('❌ *Questo comando può essere usato solo dagli admin!*');
        }

        clearTimeout(global.bandieraGame[m.chat].timeout);

        let skipText = `ㅤ⋆｡˚『 ╭ \`GIOCO INTERROTTO\` ╯ 』˚｡⋆\n╭\n`;
        skipText += `│ 『 🏳️ 』 \`La risposta era:\`\n│ 『 ‼️ 』 *\`${global.bandieraGame[m.chat].rispostaOriginale}\`*\n`;
        skipText += `│ 『 👑 』 _*Interrotto da un admin*_\n`;
        skipText += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

        await conn.sendMessage(m.chat, {
            text: skipText,
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
            interactiveButtons: playAgainButtons()
        }, { quoted: m });
        delete global.bandieraGame[m.chat];
        return;
    }

    if (global.bandieraGame?.[m.chat]) {
        return m.reply('⚠️ C\'è già una partita attiva in questo gruppo!');
    }

    const cooldownKey = `bandiera_${m.chat}`;
    const lastGame = global.cooldowns?.[cooldownKey] || 0;
    const now = Date.now();
    const cooldownTime = 5000;

    if (now - lastGame < cooldownTime) {
        const remainingTime = Math.ceil((cooldownTime - (now - lastGame)) / 1000);
        return m.reply(`⏳ *Aspetta ancora ${remainingTime} secondi prima di avviare un nuovo gioco!*`);
    }

    global.cooldowns = global.cooldowns || {};
    global.cooldowns[cooldownKey] = now;

    let bandiere = [
        { url: 'https://flagcdn.com/w320/it.png', nome: 'Italia' },
        { url: 'https://flagcdn.com/w320/fr.png', nome: 'Francia' },
        { url: 'https://flagcdn.com/w320/de.png', nome: 'Germania' },
        { url: 'https://flagcdn.com/w320/gb.png', nome: 'Regno Unito' },
        { url: 'https://flagcdn.com/w320/es.png', nome: 'Spagna' },
        { url: 'https://flagcdn.com/w320/se.png', nome: 'Svezia' },
        { url: 'https://flagcdn.com/w320/no.png', nome: 'Norvegia' },
        { url: 'https://flagcdn.com/w320/fi.png', nome: 'Finlandia' },
        { url: 'https://flagcdn.com/w320/dk.png', nome: 'Danimarca' },
        { url: 'https://flagcdn.com/w320/pl.png', nome: 'Polonia' },
        { url: 'https://flagcdn.com/w320/pt.png', nome: 'Portogallo' },
        { url: 'https://flagcdn.com/w320/gr.png', nome: 'Grecia' },
        { url: 'https://flagcdn.com/w320/ch.png', nome: 'Svizzera' },
        { url: 'https://flagcdn.com/w320/at.png', nome: 'Austria' },
        { url: 'https://flagcdn.com/w320/be.png', nome: 'Belgio' },
        { url: 'https://flagcdn.com/w320/nl.png', nome: 'Paesi Bassi' },
        { url: 'https://flagcdn.com/w320/ua.png', nome: 'Ucraina' },
        { url: 'https://flagcdn.com/w320/ro.png', nome: 'Romania' },
        { url: 'https://flagcdn.com/w320/hu.png', nome: 'Ungheria' },
        { url: 'https://flagcdn.com/w320/cz.png', nome: 'Repubblica Ceca' },
        { url: 'https://flagcdn.com/w320/ie.png', nome: 'Irlanda' },
        { url: 'https://flagcdn.com/w320/bg.png', nome: 'Bulgaria' },
        { url: 'https://flagcdn.com/w320/md.png', nome: 'Moldavia' },
        { url: 'https://flagcdn.com/w320/us.png', nome: 'Stati Uniti' },
        { url: 'https://flagcdn.com/w320/ca.png', nome: 'Canada' },
        { url: 'https://flagcdn.com/w320/mx.png', nome: 'Messico' },
        { url: 'https://flagcdn.com/w320/br.png', nome: 'Brasile' },
        { url: 'https://flagcdn.com/w320/ar.png', nome: 'Argentina' },
        { url: 'https://flagcdn.com/w320/cl.png', nome: 'Cile' },
        { url: 'https://flagcdn.com/w320/co.png', nome: 'Colombia' },
        { url: 'https://flagcdn.com/w320/pe.png', nome: 'Perù' },
        { url: 'https://flagcdn.com/w320/ve.png', nome: 'Venezuela' },
        { url: 'https://flagcdn.com/w320/cu.png', nome: 'Cuba' },
        { url: 'https://flagcdn.com/w320/au.png', nome: 'Australia' },
        { url: 'https://flagcdn.com/w320/nz.png', nome: 'Nuova Zelanda' },
        { url: 'https://flagcdn.com/w320/cn.png', nome: 'Cina' },
        { url: 'https://flagcdn.com/w320/jp.png', nome: 'Giappone' },
        { url: 'https://flagcdn.com/w320/in.png', nome: 'India' },
        { url: 'https://flagcdn.com/w320/kr.png', nome: 'Corea del Sud' },
        { url: 'https://flagcdn.com/w320/th.png', nome: 'Thailandia' },
        { url: 'https://flagcdn.com/w320/vn.png', nome: 'Vietnam' },
        { url: 'https://flagcdn.com/w320/id.png', nome: 'Indonesia' },
        { url: 'https://flagcdn.com/w320/ph.png', nome: 'Filippine' },
        { url: 'https://flagcdn.com/w320/my.png', nome: 'Malesia' },
        { url: 'https://flagcdn.com/w320/sg.png', nome: 'Singapore' },
        { url: 'https://flagcdn.com/w320/pk.png', nome: 'Pakistan' },
        { url: 'https://flagcdn.com/w320/af.png', nome: 'Afghanistan' },
        { url: 'https://flagcdn.com/w320/ir.png', nome: 'Iran' },
        { url: 'https://flagcdn.com/w320/iq.png', nome: 'Iraq' },
        { url: 'https://flagcdn.com/w320/tr.png', nome: 'Turchia' },
        { url: 'https://flagcdn.com/w320/il.png', nome: 'Israele' },
        { url: 'https://flagcdn.com/w320/sa.png', nome: 'Arabia Saudita' },
        { url: 'https://flagcdn.com/w320/ae.png', nome: 'Emirati Arabi Uniti' },
        { url: 'https://flagcdn.com/w320/qa.png', nome: 'Qatar' },
        { url: 'https://flagcdn.com/w320/eg.png', nome: 'Egitto' },
        { url: 'https://flagcdn.com/w320/ng.png', nome: 'Nigeria' },
        { url: 'https://flagcdn.com/w320/ma.png', nome: 'Marocco' },
        { url: 'https://flagcdn.com/w320/tn.png', nome: 'Tunisia' },
        { url: 'https://flagcdn.com/w320/ke.png', nome: 'Kenya' },
        { url: 'https://flagcdn.com/w320/et.png', nome: 'Etiopia' },
        { url: 'https://flagcdn.com/w320/gh.png', nome: 'Ghana' },
        { url: 'https://flagcdn.com/w320/cm.png', nome: 'Camerun' },
        { url: 'https://flagcdn.com/w320/ci.png', nome: "Costa d'Avorio" },
        { url: 'https://flagcdn.com/w320/sn.png', nome: 'Senegal' },
        { url: 'https://flagcdn.com/w320/za.png', nome: 'Sudafrica' },
        { url: 'https://flagcdn.com/w320/dz.png', nome: 'Algeria' },
        { url: 'https://flagcdn.com/w320/sd.png', nome: 'Sudan' },
        { url: 'https://flagcdn.com/w320/cd.png', nome: 'Repubblica Democratica del Congo' },
        { url: 'https://flagcdn.com/w320/ao.png', nome: 'Angola' },
        { url: 'https://flagcdn.com/w320/mg.png', nome: 'Madagascar' },
        { url: 'https://flagcdn.com/w320/tz.png', nome: 'Tanzania' },
        { url: 'https://flagcdn.com/w320/ug.png', nome: 'Uganda' },
    ];

    let scelta = bandiere[Math.floor(Math.random() * bandiere.length)];
    let frase = frasi[Math.floor(Math.random() * frasi.length)];

    try {
        let startCaption = `ㅤ⋆｡˚『 ╭ \`${frase}\` ╯ 』˚｡⋆\n╭\n`;
        startCaption += `│ 『 🏳️ 』 \`Rispondi con il nome\` *della nazione*\n`;
        startCaption += `│ 『 ⏱️ 』 \`Tempo disponibile:\` *30 secondi*\n`;
        startCaption += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

        let msg = await conn.sendMessage(m.chat, {
            image: { url: scelta.url },
            caption: startCaption,
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙'
        }, { quoted: m });

        global.bandieraGame = global.bandieraGame || {};
        global.bandieraGame[m.chat] = {
            id: msg.key.id,
            risposta: scelta.nome.toLowerCase(),
            rispostaOriginale: scelta.nome,
            tentativi: {},
            suggerito: false,
            startTime: Date.now(),
            timeout: setTimeout(async () => {
                if (global.bandieraGame?.[m.chat]) {
                    let timeoutText = `ㅤ⋆｡˚『 ╭ \`TEMPO SCADUTO!\` ╯ 』˚｡⋆\n╭\n`;
                    timeoutText += `│ 『 🏳️ 』 \`La risposta era:\`\n│ 『 ‼️ 』 *\`${scelta.nome}\`*\n`;
                    timeoutText += `│ 『 💡 』 _*Sii più veloce la prossima volta!*_\n`;
                    timeoutText += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

                    await conn.sendMessage(m.chat, {
                        text: timeoutText,
                        footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
                        interactiveButtons: playAgainButtons()
                    }, { quoted: msg });
                    delete global.bandieraGame[m.chat];
                }
            }, 30000)
        };
    } catch (error) {
        console.error('Errore nel gioco bandiere:', error);
        m.reply('❌ *Si è verificato un errore durante l\'avvio del gioco*\n\n🔄 *Riprova tra qualche secondo*');
    }
};

function normalizeString(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
}

function calculateSimilarity(str1, str2) {
    const words1 = str1.split(' ').filter(word => word.length > 1);
    const words2 = str2.split(' ').filter(word => word.length > 1);

    if (words1.length === 0 || words2.length === 0) return 0;

    const matches = words1.filter(word =>
        words2.some(w2 => w2.includes(word) || word.includes(w2))
    );

    return matches.length / Math.max(words1.length, words2.length);
}

function isAnswerCorrect(userAnswer, correctAnswer) {
    if (userAnswer.length < 2) return false;

    const similarityScore = calculateSimilarity(userAnswer, correctAnswer);

    return (
        userAnswer === correctAnswer ||
        (correctAnswer.includes(userAnswer) && userAnswer.length > correctAnswer.length * 0.5) ||
        (userAnswer.includes(correctAnswer) && userAnswer.length < correctAnswer.length * 1.5) ||
        similarityScore >= 0.8
    );
}

handler.before = async (m, { conn, usedPrefix, command }) => {
    const chat = m.chat;
    const game = global.bandieraGame?.[chat];

    // Gestione bottoni interattivi
    if (m.message && m.message.interactiveResponseMessage) {
        const response = m.message.interactiveResponseMessage;

        if (response.nativeFlowResponseMessage?.paramsJson) {
            try {
                const params = JSON.parse(response.nativeFlowResponseMessage.paramsJson);
                if (params.id === '.bandiera') {
                    if (!global.bandieraGame?.[chat]) {
                        const fakeMessage = {
                            ...m,
                            text: usedPrefix + 'bandiera',
                            body: usedPrefix + 'bandiera'
                        };
                        try {
                            await handler(fakeMessage, { conn, usedPrefix, command: 'bandiera' });
                        } catch (error) {
                            console.error('Errore nel riavvio del gioco dai bottoni:', error);
                            conn.reply(chat, '❌ *Errore nel riavvio del gioco. Prova a digitare manualmente il comando.*', m);
                        }
                    }
                }
            } catch (error) {
                console.error('Errore nel parsing dei parametri del bottone:', error);
            }
        }
        return;
    }

    if (!game || !m.quoted || m.quoted.id !== game.id || m.key.fromMe) return;

    const userAnswer = normalizeString(m.text || '');
    const correctAnswer = normalizeString(game.risposta);

    if (!userAnswer || userAnswer.length < 2) return;

    const similarityScore = calculateSimilarity(userAnswer, correctAnswer);

    if (isAnswerCorrect(userAnswer, correctAnswer)) {
        clearTimeout(game.timeout);

        const timeTaken = Math.round((Date.now() - game.startTime) / 1000);
        let reward = Math.floor(Math.random() * 31) + 20;
        let exp = 150;

        const timeBonus = timeTaken <= 10 ? 20 : timeTaken <= 20 ? 10 : 0;
        reward += timeBonus;

        if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};
        global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + reward;
        global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + exp;

        let congratsMessage = `ㅤ⋆｡˚『 ╭ \`RISPOSTA CORRETTA!\` ╯ 』˚｡⋆\n╭\n`;
        congratsMessage += `│ 『 🏳️ 』 \`Nazione:\` *${game.rispostaOriginale}*\n`;
        congratsMessage += `│ 『 ⏱️ 』 \`Tempo impiegato:\` *${timeTaken}s*\n`;
        congratsMessage += `│ 『 🎁 』 \`Ricompense:\`\n`;
        congratsMessage += `│ 『 💰 』 *${reward}€* ${timeBonus > 0 ? `(+${timeBonus} bonus velocità)` : ''}\n`;
        congratsMessage += `│ 『 🆙 』 *${exp} EXP*\n`;
        congratsMessage += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

        await conn.sendMessage(chat, {
            text: congratsMessage,
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
            interactiveButtons: playAgainButtons()
        }, { quoted: m });
        delete global.bandieraGame[chat];

    } else if (similarityScore >= 0.6 && !game.suggerito) {
        game.suggerito = true;
        await conn.reply(chat, '👀 *Ci sei quasi!*', m);

    } else if (game.tentativi[m.sender] >= 3) {
        let failText = `ㅤ⋆｡˚『 ╭ \`TENTATIVI ESAURITI!\` ╯ 』˚｡⋆\n╭\n`;
        failText += `│ 『 ❌ 』 \`Hai esaurito i tuoi 3 tentativi!\`\n`;
        failText += `│ 『 ⏳ 』 _*Aspetta che altri provino...*_\n`;
        failText += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

        await conn.sendMessage(chat, {
            text: failText,
            footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
            interactiveButtons: playAgainButtons()
        }, { quoted: m });
        delete global.bandieraGame[chat];

    } else {
        game.tentativi[m.sender] = (game.tentativi[m.sender] || 0) + 1;
        const tentativiRimasti = 3 - game.tentativi[m.sender];

        if (tentativiRimasti === 1) {
            const primaLettera = game.rispostaOriginale[0].toUpperCase();
            const numeroLettere = game.rispostaOriginale.length;
            await conn.reply(chat, `❌ *Risposta errata!*

💡 *Suggerimento:*
  • Inizia con la lettera *"${primaLettera}"*
  • È composta da *${numeroLettere} lettere*`, m);
        } else if (tentativiRimasti === 2) {
            await conn.reply(chat, `❌ *Risposta errata!*

📝 *Tentativi rimasti:* ${tentativiRimasti}
🤔 *Pensa bene alla tua prossima risposta!*`, m);
        } else {
            await conn.reply(chat, `❌ *Risposta errata!*

📝 *Ultimo tentativo rimasto..*`, m);
        }
    }
};

handler.help = ['bandiera'];
handler.tags = ['giochi'];
handler.command = /^(bandiera|skipbandiera)$/i;
handler.group = true;
handler.register = false;

export default handler;