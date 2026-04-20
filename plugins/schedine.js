//By Bonzino 
import fs from 'fs'

const SNAI_PATH = './media/snai.png'

const CAMPIONATI = {
  "SERIE A": ["Atalanta", "Bologna", "Cagliari", "Como", "Empoli", "Fiorentina", "Genoa", "Inter", "Juventus", "Lazio", "Lecce", "Milan", "Monza", "Napoli", "Parma", "Roma", "Torino", "Udinese", "Venezia", "Verona"],
  "MONDIALI": ["Italia", "Argentina", "Brasile", "Francia", "Germania", "Spagna", "Inghilterra", "Portogallo", "Olanda", "Belgio", "Croazia", "Marocco", "Giappone", "Uruguay", "Svizzera", "USA"]
}

function formatNumber(num) { return new Intl.NumberFormat('it-IT').format(num) }
function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function generaRisultatoReale(segnoScelto) {
  let golCasa = Math.floor(Math.random() * 4)
  let golTrasf = Math.floor(Math.random() * 4)
  const vinceScommessa = Math.random() < 0.4 

  if (vinceScommessa) {
    if (segnoScelto === '1') { golCasa = Math.floor(Math.random() * 3) + 1; golTrasf = Math.floor(Math.random() * golCasa) }
    else if (segnoScelto === '2') { golTrasf = Math.floor(Math.random() * 3) + 1; golCasa = Math.floor(Math.random() * golTrasf) }
    else { golCasa = golTrasf = Math.floor(Math.random() * 3) }
  } else {
    if (segnoScelto === '1' && golCasa >= golTrasf) golTrasf = golCasa + 1
    if (segnoScelto === '2' && golTrasf >= golCasa) golCasa = golTrasf + 1
    if (segnoScelto === 'X' && golCasa === golTrasf) golCasa++
  }
  let esitoFinale = golCasa > golTrasf ? '1' : (golCasa < golTrasf ? '2' : 'X')
  return { golCasa, golTrasf, esitoFinale }
}

async function modificaMessaggio(conn, chatId, key, testo, mentions = []) {
  await conn.relayMessage(chatId, { protocolMessage: { key, type: 14, editedMessage: { extendedTextMessage: { text: testo, contextInfo: mentions.length ? { mentionedJid: mentions } : {} } } } }, {})
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const who = m.sender
  const user = global.db.data.users[who]
  const puntata = parseInt(args[0])
  const tipoCampionato = args[1] // SERIEA o MONDIALI
  const segno = args[2]?.toUpperCase()

  // STEP 1: Selezione Puntata
  if (!puntata || isNaN(puntata)) {
    const buttons = [
      { buttonId: `${usedPrefix + command} 100`, buttonText: { displayText: '💸 100€' }, type: 1 },
      { buttonId: `${usedPrefix + command} 500`, buttonText: { displayText: '💸 500€' }, type: 1 },
      { buttonId: `${usedPrefix + command} 1000`, buttonText: { displayText: '💸 1000€' }, type: 1 }
    ]
    const caption = `⚽ *SNAI BETTING*\n\n👤 Utente: @${who.split('@')[0]}\n💰 Saldo: ${formatNumber(user.euro)}€\n\nQuanto vuoi puntare?`
    return conn.sendMessage(m.chat, {
      ...(fs.existsSync(SNAI_PATH) ? { image: fs.readFileSync(SNAI_PATH), caption } : { text: caption }),
      footer: 'Seleziona l\'importo della scommessa',
      buttons,
      mentions: [who]
    }, { quoted: m })
  }

  // STEP 2: Selezione Campionato
  if (!tipoCampionato || !['SERIEA', 'MONDIALI'].includes(tipoCampionato)) {
    const buttons = [
      { buttonId: `${usedPrefix + command} ${puntata} SERIEA`, buttonText: { displayText: '🇮🇹 SERIE A' }, type: 1 },
      { buttonId: `${usedPrefix + command} ${puntata} MONDIALI`, buttonText: { displayText: '🌎 MONDIALI' }, type: 1 }
    ]
    return conn.sendMessage(m.chat, {
      text: `🎰 *PUNTATA: ${formatNumber(puntata)}€*\n\nSeleziona la competizione su cui scommettere:`,
      buttons
    }, { quoted: m })
  }

  // LOGICA SQUADRE (selezionate prima della scelta del segno)
  const listaSquadre = tipoCampionato === 'SERIEA' ? CAMPIONATI["SERIE A"] : CAMPIONATI["MONDIALI"]
  const nomeCasa = pickRandom(listaSquadre)
  const nomeTrasf = pickRandom(listaSquadre.filter(s => s !== nomeCasa))

  // STEP 3: Selezione Segno
  if (!segno || !['1', 'X', '2'].includes(segno)) {
    const buttons = [
      { buttonId: `${usedPrefix + command} ${puntata} ${tipoCampionato} 1`, buttonText: { displayText: `(1) ${nomeCasa}` }, type: 1 },
      { buttonId: `${usedPrefix + command} ${puntata} ${tipoCampionato} X`, buttonText: { displayText: '(X) Pareggio' }, type: 1 },
      { buttonId: `${usedPrefix + command} ${puntata} ${tipoCampionato} 2`, buttonText: { displayText: `(2) ${nomeTrasf}` }, type: 1 }
    ]
    return conn.sendMessage(m.chat, {
      text: `⚔️ *MATCH:* ${nomeCasa} vs ${nomeTrasf}\n🏆 *COMP:* ${tipoCampionato}\n\nScegli il tuo pronostico:`,
      buttons
    }, { quoted: m })
  }

  if (user.euro < puntata) return m.reply(`Saldo insufficiente! Hai solo ${formatNumber(user.euro)}€`)

  // INIZIO PARTITA
  const quota = (Math.random() * (3.5 - 1.8) + 1.8).toFixed(2)
  const vincita = Math.floor(puntata * quota)
  const risultato = generaRisultatoReale(segno)
  
  user.euro -= puntata
  
  const live = await conn.sendMessage(m.chat, { 
    text: `🏟️ *PARTITA INIZIATA: ${nomeCasa} vs ${nomeTrasf}*\n\n🎫 *SCHEDINA:* Segno ${segno} (x${quota})\n💰 *PUNTATA:* ${formatNumber(puntata)}€\n────────────────────\n⌚ Minuto: 0'\n⚽ Risultato: 0 - 0` 
  })

  let cronacaStorico = `🏟️ *PARTITA: ${nomeCasa} vs ${nomeTrasf}*\n\n🎫 *SCHEDINA:* Segno ${segno} (x${quota})\n💰 *PUNTATA:* ${formatNumber(puntata)}€\n────────────────────`
  
  for (let i = 0; i < 4; i++) {
    await new Promise(r => setTimeout(r, 2500))
    let progressoGolCasa = Math.floor((risultato.golCasa / 4) * (i + 1))
    let progressoGolTrasf = Math.floor((risultato.golTrasf / 4) * (i + 1))
    
    let eventoMsg = pickRandom([
        `🔥 Azione pericolosa del ${nomeCasa}!`,
        `🧤 Il portiere del ${nomeTrasf} devia in angolo!`,
        `🟨 Cartellino giallo per proteste.`,
        `🎯 Conclusione potente, palla fuori di poco.`,
        `🖥️ Controllo VAR in corso... gioco fermo.`
    ])

    cronacaStorico += `\n⌚ ${22 * (i+1)}' | ⚽ ${progressoGolCasa}-${progressoGolTrasf} | ${eventoMsg}`
    await modificaMessaggio(conn, m.chat, live.key, cronacaStorico)
  }

  await new Promise(r => setTimeout(r, 2000))
  const vinto = segno === risultato.esitoFinale
  cronacaStorico += `\n────────────────────\n🏁 *FISCHIO FINALE: ${risultato.golCasa} - ${risultato.golTrasf}*`

  if (vinto) {
    user.euro += vincita
    cronacaStorico += `\n\n✅ *VINTA!* +${formatNumber(vincita)}€\n🏦 Saldo: ${formatNumber(user.euro)}€`
  } else {
    cronacaStorico += `\n\n❌ *PERSA!* -${formatNumber(puntata)}€\n💼 Saldo: ${formatNumber(user.euro)}€`
  }
  
  await modificaMessaggio(conn, m.chat, live.key, cronacaStorico)
}

handler.help = ['schedina']
handler.tags = ['game']
handler.command = /^(schedina|bet)$/i
handler.group = true

export default handler
