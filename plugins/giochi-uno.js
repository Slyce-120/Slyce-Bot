import { createCanvas } from 'canvas'

let unoSession = {}
const coloriHex = { 'Rosso': '#FF0000', 'Blu': '#0000FF', 'Giallo': '#FFD700', 'Verde': '#008000', 'Jolly': '#444444' }

async function disegnaPartita(s) {
    const canvas = createCanvas(800, 500)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, 800, 500)

    const drawCard = (x, y, label, color, isHidden = false) => {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.strokeRect(x, y, 60, 90)
        
        if (isHidden) {
            ctx.fillStyle = '#333'
            ctx.fillRect(x+2, y+2, 56, 86)
            ctx.fillStyle = '#fff'
            ctx.font = 'bold 30px Arial'
            ctx.fillText('?', x + 22, y + 55)
        } else {
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.roundRect(x + 5, y + 5, 50, 80, 10)
            ctx.fill()
            ctx.fillStyle = '#fff'
            ctx.font = 'bold 20px Arial'
            let txt = label.split(' ')[1] || label
            ctx.fillText(txt, x + 15, y + 50)
        }
    }

    drawCard(50, 50, 'Mazzo', '#222')
    ctx.fillStyle = '#fff'
    ctx.fillText('MAZZO', 50, 40)

    s.botHand.forEach((_, i) => {
        if (i < 8) drawCard(500 + (i * 20), 50, '', '', true)
    })
    ctx.fillText(`BOT (${s.botHand.length})`, 500, 40)

    let tavoloColore = coloriHex[s.tableCard.split(' ')[0]] || coloriHex['Jolly']
    drawCard(370, 200, s.tableCard, tavoloColore)
    ctx.fillText('TAVOLO', 370, 190)

    s.playerHand.forEach((c, i) => {
        let col = coloriHex[c.split(' ')[0]] || coloriHex['Jolly']
        drawCard(50 + (i * 70), 380, c, col)
        ctx.fillStyle = '#aaa'
        ctx.font = '15px Arial'
        ctx.fillText(i + 1, 75 + (i * 70), 485)
    })
    ctx.fillStyle = '#fff'
    ctx.font = '20px Arial'
    ctx.fillText('LE TUE CARTE', 50, 370)

    return canvas.toBuffer()
}

let handler = async (m, { conn, command }) => {
    let chat = m.chat
    let mazzo = creaMazzo()
    let playerHand = mazzo.splice(0, 7)
    let botHand = mazzo.splice(0, 7)
    let tableCard = mazzo.filter(c => !c.includes('Jolly'))[0]
    
    unoSession[chat] = {
        player: m.sender,
        mazzo: mazzo,
        playerHand: playerHand,
        botHand: botHand,
        tableCard: tableCard,
        currentColor: tableCard.split(' ')[0]
    }

    let buffer = await disegnaPartita(unoSession[chat])
    await conn.sendMessage(chat, { 
        image: buffer, 
        caption: `🃏 *GIOCHIAMO A UNO!*\n\nUsa i bottoni o scrivi il numero della carta per giocare.`
    }, { quoted: m })
}

function creaMazzo() {
    let colori = ['Rosso', 'Blu', 'Giallo', 'Verde']
    let mazzo = []
    colori.forEach(c => {
        for (let v = 0; v <= 9; v++) mazzo.push(`${c} ${v}`)
        mazzo.push(`${c} +2`)
    })
    for (let i = 0; i < 4; i++) mazzo.push('Jolly', 'Jolly +4')
    return mazzo.sort(() => Math.random() - 0.5)
}

handler.command = /^(uno)$/i
export default handler
