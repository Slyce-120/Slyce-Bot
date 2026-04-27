import { createCanvas } from 'canvas'

let unoSession = {}

const coloriHex = { 
    'Rosso': '#FF3B30', 
    'Blu': '#007AFF', 
    'Giallo': '#FFCC00', 
    'Verde': '#4CD964', 
    'Jolly': '#1C1C1E' 
}

const gameButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: '📥 PESCA', id: 'pesca' })
}, {
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: '🛑 ABBANDONA', id: 'enduno' })
}];

async function generaGrafica(s) {
    const canvas = createCanvas(1000, 600)
    const ctx = canvas.getContext('2d')

    const gradiente = ctx.createRadialGradient(500, 300, 50, 500, 300, 600)
    gradiente.addColorStop(0, '#2c3e50')
    gradiente.addColorStop(1, '#000000')
    ctx.fillStyle = gradiente
    ctx.fillRect(0, 0, 1000, 600)

    const drawCard = (x, y, label, color, isHidden = false, scale = 1) => {
        const w = 80 * scale
        const h = 120 * scale
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.roundRect(x, y, w, h, 8)
        ctx.fill()

        if (isHidden) {
            ctx.fillStyle = '#2c2c2e'
            ctx.beginPath()
            ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 5)
            ctx.fill()
            ctx.fillStyle = '#ffffff'
            ctx.font = `bold ${30 * scale}px Arial`
            ctx.textAlign = 'center'
            ctx.fillText('?', x + (w/2), y + (h/1.6))
        } else {
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 5)
            ctx.fill()
            ctx.fillStyle = '#ffffff'
            ctx.textAlign = 'center'
            ctx.font = `bold ${22 * scale}px Arial`
            let val = label.includes('Jolly') ? 'Jolly' : label.split(' ')[1]
            ctx.fillText(val || 'UNO', x + (w/2), y + (h/2) + 10)
        }
    }

    drawCard(50, 240, 'Mazzo', '#3a3a3c', true, 0.9)
    let botX = 500 - (Math.min(s.botHand.length, 10) * 15)
    s.botHand.slice(0, 12).forEach((_, i) => drawCard(botX + (i * 30), 40, '', '', true, 0.7))
    
    let tColore = coloriHex[s.tableCard.split(' ')[0]] || coloriHex['Jolly']
    drawCard(460, 230, s.tableCard, tColore, false, 1.2)

    let startX = 500 - (s.playerHand.length * 45)
    s.playerHand.forEach((c, i) => {
        let col = coloriHex[c.split(' ')[0]] || coloriHex['Jolly']
        drawCard(startX + (i * 90), 420, c, col, false, 1)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 18px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(i + 1, startX + (i * 90) + 40, 565)
    })

    return canvas.toBuffer()
}

function puoGiocare(carta, tavolo, coloreScelto) {
    if (carta.includes('Jolly')) return true
    let [c_c, v_c] = carta.split(' ')
    let [c_t, v_t] = tavolo.split(' ')
    if (tavolo.includes('Jolly')) return c_c === coloreScelto
    return c_c === c_t || v_c === v_t || c_c === coloreScelto
}

function creaMazzo() {
    let colori = ['Rosso', 'Blu', 'Giallo', 'Verde']
    let mazzo = []
    colori.forEach(c => {
        for (let v = 0; v <= 9; v++) {
            mazzo.push(`${c} ${v}`)
            if (v !== 0) mazzo.push(`${c} ${v}`) // Doppia copia tranne lo 0
        }
        mazzo.push(`${c} +2`)
    })
    for (let i = 0; i < 4; i++) {
        mazzo.push('Jolly')
        mazzo.push('Jolly +4')
    }
    return mazzo.sort(() => Math.random() - 0.5)
}

let handler = async (m, { conn }) => {
    let chat = m.chat
    let mazzo = creaMazzo()
    
    unoSession[chat] = {
        player: m.sender,
        mazzo: mazzo,
        playerHand: mazzo.splice(0, 7),
        botHand: mazzo.splice(0, 7),
        tableCard: mazzo.find(c => !c.includes('Jolly')),
        currentColor: ''
    }
    unoSession[chat].currentColor = unoSession[chat].tableCard.split(' ')[0]

    let img = await generaGrafica(unoSession[chat])
    await conn.sendMessage(chat, {
        image: img,
        caption: `🃏 *UNO MATCH INIZIATO!*\n🎨 Colore attuale: *${unoSession[chat].currentColor}*`,
        interactiveButtons: gameButtons()
    }, { quoted: m })
}

handler.before = async (m, { conn }) => {
    let chat = m.chat
    let s = unoSession[chat]
    if (!s || s.player !== m.sender) return

    let msgText = (m.text || m.body || '').trim().toLowerCase()
    if (m.message?.interactiveResponseMessage) {
        const params = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)
        msgText = params.id.toLowerCase()
    }

    if (msgText === '.uno') return
    let report = ''

    if (msgText === 'enduno' || msgText === '🛑 abbandona') {
        delete unoSession[chat]
        return m.reply('🛑 Partita chiusa.')
    }

    if (msgText === 'pesca' || msgText === '📥 pesca') {
        let p = s.mazzo.shift()
        s.playerHand.push(p)
        report = `📥 Hai pescato: ${p}`
        if (!puoGiocare(p, s.tableCard, s.currentColor)) {
            report += `\n❌ Non puoi giocare, passa il turno.`
            report += botTurno(s)
        }
    } else {
        let index = parseInt(msgText) - 1
        if (isNaN(index) || index < 0 || index >= s.playerHand.length) return
        
        let carta = s.playerHand[index]
        if (!puoGiocare(carta, s.tableCard, s.currentColor)) return m.reply('❌ Mossa non valida!')

        s.playerHand.splice(index, 1)
        s.tableCard = carta
        s.currentColor = carta.includes('Jolly') ? s.currentColor : carta.split(' ')[0]
        report = `✅ Hai giocato ${carta}`
        report += botTurno(s)
    }

    if (s.playerHand.length === 0) {
        delete unoSession[chat]; return m.reply('🏆 HAI VINTO!')
    }
    if (s.botHand.length === 0) {
        delete unoSession[chat]; return m.reply('💀 IL BOT HA VINTO!')
    }

    let img = await generaGrafica(s)
    await conn.sendMessage(chat, {
        image: img,
        caption: report,
        interactiveButtons: gameButtons()
    }, { quoted: m })
}

function botTurno(s) {
    // Il bot prova a giocare prima le carte normali, poi i jolly
    let mossePossibili = s.botHand.filter(c => puoGiocare(c, s.tableCard, s.currentColor))
    
    if (mossePossibili.length > 0) {
        // Priorità alle carte NON Jolly
        let scelta = mossePossibili.find(c => !c.includes('Jolly')) || mossePossibili[0]
        s.botHand.splice(s.botHand.indexOf(scelta), 1)
        s.tableCard = scelta
        s.currentColor = scelta.includes('Jolly') ? ['Rosso','Blu','Verde','Giallo'][Math.floor(Math.random()*4)] : scelta.split(' ')[0]
        return `\n🤖 Il Bot ha giocato: *${scelta}*`
    } else {
        s.botHand.push(s.mazzo.shift())
        return `\n🤖 Il Bot non aveva mosse e ha pescato.`
    }
}

handler.command = /^(uno)$/i
export default handler
