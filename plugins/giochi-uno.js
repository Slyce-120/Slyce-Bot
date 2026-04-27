import { createCanvas } from 'canvas'

// ... (tieni le funzioni generaGrafica, creaMazzo, puoGiocare e botTurno di prima) ...

let handler = async (m, { conn }) => {
    // ... (Logica di avvio gioco identica alla versione precedente) ...
}

handler.before = async (m, { conn }) => {
    let chat = m.chat
    let s = global.unoSession?.[chat]
    if (!s || s.player !== m.sender) return

    // --- LOGICA DI INTERCETTAZIONE BOTTONI (CRUCIALE PER IPHONE) ---
    let msgText = ""
    
    if (m.message?.templateButtonReplyMessage) {
        // Clic da bottoni vecchio stile (Template)
        msgText = m.message.templateButtonReplyMessage.selectedId
    } else if (m.message?.buttonsResponseMessage) {
        // Clic da bottoni standard
        msgText = m.message.buttonsResponseMessage.selectedButtonId
    } else if (m.message?.interactiveResponseMessage) {
        // Clic da bottoni moderni (Native Flow / Bandiera)
        const params = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)
        msgText = params.id
    } else {
        // Testo normale (se l'utente scrive "pesca" o un numero)
        msgText = (m.text || "").trim().toLowerCase()
    }
    // ---------------------------------------------------------------

    if (!msgText || msgText === 'uno' || msgText === '.uno') return
    if (msgText === 'enduno') { 
        delete global.unoSession[chat]
        return m.reply('🛑 Partita terminata.') 
    }

    let report = ""
    if (msgText === 'pesca') {
        if (s.mazzo.length === 0) s.mazzo = creaMazzo()
        let p = s.mazzo.shift()
        s.playerHand.push(p)
        report = `📥 Hai pescato: *${p}*`
        
        if (!puoGiocare(p, s.tableCard, s.currentColor)) {
            report += `\n❌ Non giocabile. Passi il turno.`
            report += botTurno(s)
        }
    } else {
        let idx = parseInt(msgText) - 1
        if (isNaN(idx) || idx < 0 || idx >= s.playerHand.length) return
        
        let carta = s.playerHand[idx]
        if (!puoGiocare(carta, s.tableCard, s.currentColor)) return m.reply('❌ Mossa non valida!')
        
        s.playerHand.splice(idx, 1)
        s.tableCard = carta
        s.currentColor = carta.includes('Jolly') ? s.currentColor : carta.split(' ')[0]
        report = `✅ Hai giocato: *${carta}*`
        
        // Logica effetti (+2, +4) e turno bot...
        report += botTurno(s)
    }

    if (s.playerHand.length === 0) { delete global.unoSession[chat]; return m.reply('🏆 HAI VINTO!') }
    if (s.botHand.length === 0) { delete global.unoSession[chat]; return m.reply('💀 HAI PERSO!') }

    let img = await generaGrafica(s)
    
    // Invia lo stato aggiornato usando lo stesso metodo di Bandiera
    await conn.sendMessage(chat, {
        image: img,
        caption: report,
        footer: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
        interactiveButtons: [
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📥 PESCA', id: 'pesca' }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🛑 ABBANDONA', id: 'enduno' }) }
        ]
    }, { quoted: m })
}

handler.command = /^(uno)$/i
export default handler
