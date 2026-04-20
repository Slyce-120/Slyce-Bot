//By Bonzino & Gemini
import fs from 'fs'

const SNAI_PATH = './media/snai.png'

const CAMPIONATI = {
  "SERIE A": ["Atalanta", "Bologna", "Cagliari", "Como", "Empoli", "Fiorentina", "Genoa", "Inter", "Juventus", "Lazio", "Lecce", "Milan", "Monza", "Napoli", "Parma", "Roma", "Torino", "Udinese", "Venezia", "Verona"],
  "MONDIALI": ["Italia", "Argentina", "Brasile", "Francia", "Germania", "Spagna", "Inghilterra", "Portogallo", "Olanda", "Belgio", "Croazia", "Marocco", "Giappone", "Uruguay", "Svizzera", "USA"]
}

const EVENTI = [
  "🔥 Azione pericolosa sottoporta!",
  "🧤 Parata incredibile del portiere!",
  "🟨 Ammonizione per gioco scorretto.",
  "🎯 Conclusione potente, palla fuori di poco.",
  "🖥️ Controllo VAR in corso... gioco fermo.",
  "🚩 Calcio d'angolo battuto velocemente.",
  "⚡ Contropiede fulminante!",
  "🚫 Goal annullato per fuorigioco!"
]

function formatNumber(num) { return new Intl.NumberFormat('it-IT').format(num) }
function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)] }

async function modificaMessaggio(conn, chatId, key, testo) {
  await conn.relayMessage(chatId, { protocolMessage: { key, type: 14, editedMessage: { extendedTextMessage: { text: testo } } } }, {})
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const who = m.sender
  const user = global.db.data.users[who]
  const puntata = parseInt(args[0])
  const tipoCampionato = args[1] 
  const scommessa = args[2]?.toUpperCase() // 1, X, 2, UNDER, OVER, GOAL, NOGOAL

  // STEP 1: Selezione Puntata
  if (!puntata || isNaN(puntata)) {
    const buttons = [
      { buttonId: `${usedPrefix + command} 100`, buttonText: { displayText: '💸 100€' }, type: 1 },
      { buttonId: `${usedPrefix + command} 500`, buttonText: { displayText: '💸 500€' }, type: 1 },
      { buttonId: `${usedPrefix + command} 1000`, buttonText: { displayText: '💸 1000€' }, type: 1 }
    ]
    return conn.sendMessage(m.chat, {
      ...(fs.existsSync(SNAI_PATH) ? { image: fs.readFileSync(SNAI_PATH) } : {}),
      caption: `⚽ *SNAI BETTING*\n\n👤 Utente: @${who.split('@')[0]}\n💰 Saldo: ${formatNumber(user.euro)}€\n\nQuanto vuoi puntare?`,
      buttons,
      mentions: [who]
    }, { quoted: m })
  }

  // STEP 2: Selezione Campionato
  if (!tipoCampionato) {
    const buttons = [
      { buttonId: `${usedPrefix + command} ${puntata} SERIEA`, buttonText: { displayText: '🇮🇹 SERIE A' }, type: 1 },
      { buttonId: `${usedPrefix + command} ${puntata} MONDIALI`, buttonText: { displayText: '🌎 MONDIALI' }, type: 1 }
    ]
    return conn.sendMessage(m.chat, { text: `🎰 *PUNTATA: ${formatNumber(puntata)}€*\n\nSeleziona la competizione:`, buttons }, { quoted: m })
  }

  // Generazione Match
  const lista = CAMPIONATI[tipoCampionato === 'SERIEA' ? "SERIE A" : "MONDIALI"]
  const casa = pickRandom(lista)
  const trasf = pickRandom(lista.filter(s => s !== casa))

  // STEP 3: Selezione Mercato Scommesse
  if (!scommessa) {
    const buttons = [
      { buttonId: `${usedPrefix + command} ${puntata} ${tipoCampionato} 1`, buttonText: { displayText: `(1) ${casa}` }, type: 1 },
      { buttonId: `${usedPrefix + command} ${puntata} ${tipoCampionato} X`, buttonText: { displayText: '(X) Pareggio' }, type: 1 },
      { buttonId: `${usedPrefix + command} ${puntata} ${tipoCampionato} 2`, buttonText: { displayText: `(2) ${trasf}` }, type: 1 },
      { buttonId: `${usedPrefix + command} ${puntata} ${tipoCampionato} OVER`, buttonText: { displayText: 'Over 2.5' }, type: 1 },
      { buttonId: `${usedPrefix + command} ${puntata} ${tipoCampionato} GOAL`, buttonText: { displayText: 'Goal' }, type: 1 }
    ]
    return conn.sendMessage(m.chat, { text: `⚔️ *MATCH:* ${casa} vs ${trasf}\n\nScegli la tua giocata:`, buttons }, { quoted: m })
  }

  if (user.euro < puntata) return m.reply(`Saldo insufficiente! Hai ${formatNumber(user.euro)}€`)
  user.euro -= puntata

  // Logica Risultato
  const golCasa = Math.floor(Math.random() * 4)
  const golTrasf = Math.floor(Math.random() * 4)
  const totaleGol = golCasa + golTrasf
  const esito1X2 = golCasa > golTrasf ? '1' : (golCasa < golTrasf ? '2' : 'X')
  
  // Verifica Vincita
  let vinto = false
  let descScommessa = ""
  if (scommessa === '1') { vinto = esito1X2 === '1'; descScommessa = `Vittoria ${casa}` }
  else if (scommessa === 'X') { vinto = esito1X2 === 'X'; descScommessa = "Pareggio" }
  else if (scommessa === '2') { vinto = esito1X2 === '2'; descScommessa = `Vittoria ${trasf}` }
  else if (scommessa === 'OVER') { vinto = totaleGol > 2.5; descScommessa = "Over 2.5" }
  else if (scommessa === 'GOAL') { vinto = golCasa > 0 && golTrasf > 0; descScommessa = "Goal" }

  const quota = (Math.random() * (3.5 - 1.8) + 1.8).toFixed(2)
  const vincita = Math.floor(puntata * quota)

  // Inizio Live
  let liveText = `🏟️ *PARTITA: ${casa} vs ${trasf}*\n\n🎫 *SCHEDINA:* ${descScommessa} (x${quota})\n💰 *PUNTATA:* ${formatNumber(puntata)}€\n────────────────────`
  const live = await conn.sendMessage(m.chat, { text: liveText + `\n⌚ Minuto: 0'\n⚽ Risultato: 0 - 0` })

  for (let i = 1; i <= 4; i++) {
    await new Promise(r => setTimeout(r, 2500))
    let pCasa = Math.floor((golCasa / 4) * i)
    let pTrasf = Math.floor((golTrasf / 4) * i)
    liveText += `\n⌚ ${22 * i}' | ⚽ ${pCasa}-${pTrasf} | ${pickRandom(EVENTI)}`
    await modificaMessaggio(conn, m.chat, live.key, liveText)
  }

  await new Promise(r => setTimeout(r, 2000))
  if (vinto) user.euro += vincita
  
  liveText += `\n────────────────────\n🏁 *FINALE: ${golCasa} - ${golTrasf}*\n\n${vinto ? `✅ *VINTA!* +${formatNumber(vincita)}€` : `❌ *PERSA!* -${formatNumber(puntata)}€`}\n🏦 Saldo: ${formatNumber(user.euro)}€`
  await modificaMessaggio(conn, m.chat, live.key, liveText)
}

handler.command = /^(schedina|bet)$/i
handler.group = true
handler.tags = ('giochi')
export default handler
