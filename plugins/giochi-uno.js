import { createCanvas } from 'canvas'

let unoSession = {}

const coloriHex = { 
    'Rosso': '#FF3B30', 
    'Blu': '#007AFF', 
    'Giallo': '#FFCC00', 
    'Verde': '#4CD964', 
    'Jolly': '#1C1C1E' 
}

async function generaGrafica(s) {
    const canvas = createCanvas(1000, 600)
    const ctx = canvas.getContext('2d')
    const gradiente = ctx.createRadialGradient(500, 300, 50, 500, 300, 600)
    gradiente.addColorStop(0, '#1a1a1d'); gradiente.addColorStop(1, '#000000')
    ctx.fillStyle = gradiente; ctx.fillRect(0, 0, 1000, 600)

    const drawCard = (x, y, label, color, isHidden = false, scale = 1) => {
        const w = 80 * scale, h = 120 * scale
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.fill()
        if (isHidden) {
            ctx.fillStyle = '#2c2c2e'; ctx.beginPath(); ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 5); ctx.fill()
        } else {
            ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x + 4, y + 4, w - 8, h - 8, 5); ctx.fill()
            ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.font = `bold ${22 * scale}px Arial`
            ctx.fillText(label.split(' ')[1] || label, x + (w/2), y + (h/2) + 10)
        }
    }

    drawCard(50, 240, 'Mazzo', '#3a3a3c', true, 0.9)
    let botX = 500 - (Math.min(s.botHand.length, 10) * 15)
    s.botHand.slice(0, 12).forEach((_, i) => drawCard(botX + (i * 30), 40, '', '', true, 0.7))
    let tColore = coloriHex[s.currentColor] || coloriHex['Jolly']
    drawCard(460, 230, s.tableCard, tColore, false, 1.2)
    let startX = 500 - (s.playerHand.length * 45)
    s.playerHand.forEach((c, i) => {
        let col = coloriHex[c.split(' ')[0]] || coloriHex['Jolly']
        drawCard(startX + (i * 90), 420, c, col, false, 1)
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px Arial'; ctx.textAlign = 'center'
        ctx.fillText(i + 1, startX + (i * 90) + 40, 565)
    })
    return canvas.toBuffer()
}

// STRUTTURA BOTTONI PER IPHONE (NATIVE FLOW)
const playButtons = [
    {
        name: 'single_select_reply',
        buttonParamsJson: JSON.stringify({
            title: 'Scegli Mossa',
            sections: [{
                title: 'Azioni Gioco',
                rows: [
                    { title: '📥 Pesca Carta', id: 'pesca' },
                    { title: '🛑 Abbandona', id: 'enduno' }
                ]
            }]
        })
    }
]

let handler = async (m, { conn }) => {
    let chat = m.chat
    let colori = ['Rosso', 'Blu', 'Giallo', 'Verde'], mazzo = []
    colori.forEach(c => {
        mazzo.push(`${c} 0`)
        for (let v = 1; v <= 9; v++) { mazzo.push(`${c} ${v}`); mazzo.push(`${c} ${v}`) }
        for (let i = 0; i < 2; i++) mazzo.push(`${c} +2`)
    })
    for (let i = 0; i < 4; i++) { mazzo.push('Jolly'); mazzo.push('Jolly +4') }
    mazzo.sort(() => Math.random() - 0.5)

    unoSession[chat] = {
        player: m.sender, mazzo,
        playerHand: mazzo.splice(0, 7),
        botHand: mazzo.splice(0, 7),
        tableCard: mazzo.find(c => !c.includes('Jolly') && !c.includes('+')),
        currentColor: ''
    }
    unoSession[chat].currentColor = unoSession[chat].tableCard.split(' ')[0]
    
    let img = await generaGrafica(unoSession[chat])
    
    // INVIO FORZATO PER IPHONE (viewOnceMessageV2 + interactiveMessage)
    await conn.relayMessage(chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: { hasVideoMessage: false, hasImageMessage: true, imageMessage: (await conn.prepareMessageMedia(img, { upload: conn.waUploadToServer })).imageMessage },
                    body: { text: `🃏 *UNO MATCH*\n🎨 Colore: *${unoSession[chat].currentColor}*` },
                    footer: { text: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙' },
                    nativeFlowMessage: { buttons: playButtons }
                }
            }
        }
    }, { quoted: m })
}

handler.before = async (m, { conn }) => {
    let chat = m.chat, s = unoSession[chat]
    if (!s || s.player !== m.sender) return
    
    let msgText = (m.text || '').trim().toLowerCase()

    // Cattura risposta dai bottoni Native Flow
    if (m.message?.interactiveResponseMessage) {
        const response = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)
        msgText = response.id
    }
    
    if (msgText === '.uno' || msgText === 'uno') return
    if (msgText === 'enduno') { delete unoSession[chat]; return m.reply('🛑 Partita terminata.') }

    // ... (restante logica di gioco pesca/numeri carta identica a prima) ...
    // Nota: Per brevità ho omesso la logica botTurno, tieni quella della versione precedente.
}

handler.command = /^(uno)$/i
export default handler
