import { createCanvas, loadImage } from 'canvas'
import GIFEncoder from 'gif-encoder-2'

// --- CONFIGURAZIONI ---
const fruits = ['🍒', '🍋', '🍉', '🍇', '🍎', '🍓']
const fruitURLs = {
    '🍒': 'https://twemoji.maxcdn.com/v/latest/72x72/1f352.png',
    '🍋': 'https://twemoji.maxcdn.com/v/latest/72x72/1f34b.png',
    '🍉': 'https://twemoji.maxcdn.com/v/latest/72x72/1f349.png',
    '🍇': 'https://twemoji.maxcdn.com/v/latest/72x72/1f347.png',
    '🍎': 'https://twemoji.maxcdn.com/v/latest/72x72/1f34e.png',
    '🍓': 'https://twemoji.maxcdn.com/v/latest/72x72/1f353.png'
}
const cavalliConfig = [
    { nome: 'ROSSO', color: '#ff4d4d' },
    { nome: 'BLU', color: '#4d94ff' },
    { nome: 'VERDE', color: '#4dff88' },
    { nome: 'GIALLO', color: '#ffff4d' }
]

let handler = async (m, { conn, command, args, usedPrefix }) => {
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
    let user = global.db.data.users[m.sender]
    if (user.euro === undefined) user.euro = 1000

    const checkMoney = (costo) => {
        if (user.euro < costo) {
            m.reply(`⚠️ Non hai abbastanza Euro! (Saldo: ${user.euro}€)`)
            return false
        }
        return true
    }

    // --- 1. MENU ---
    if (command === 'casino') {
        let intro = `*🎰 GRAND CASINÒ ANIMATO 🎰*\n*💰 SALDO:* *${user.euro}€*`
        const buttons = [
            { buttonId: `${usedPrefix}infoslot`, buttonText: { displayText: '🎰 SLOT' }, type: 1 },
            { buttonId: `${usedPrefix}infocorsa`, buttonText: { displayText: '🏇 CORSA' }, type: 1 },
            { buttonId: `${usedPrefix}inforigore`, buttonText: { displayText: '⚽ RIGORI' }, type: 1 },
            { buttonId: `${usedPrefix}infogratta`, buttonText: { displayText: '🎟️ GRATTA' }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: intro, buttons }, { quoted: m })
    }

    // INFO TASTI
    if (command === 'infoslot') return conn.sendMessage(m.chat, { text: `*🎰 SLOT*\nPunta 100€!`, buttons: [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 TIRA' }, type: 1 }] })
    if (command === 'inforigore') return conn.sendMessage(m.chat, { text: `*⚽ RIGORI*\nScegli dove tirare (100€):`, buttons: [{ buttonId: `${usedPrefix}rigore sx`, buttonText: { displayText: '⬅️ SX' }, type: 1 }, { buttonId: `${usedPrefix}rigore cx`, buttonText: { displayText: '⬆️ CX' }, type: 1 }, { buttonId: `${usedPrefix}rigore dx`, buttonText: { displayText: '➡️ DX' }, type: 1 }] })
    if (command === 'infocorsa') return conn.sendMessage(m.chat, { text: `*🏇 CORSA*\nPunta 100€ sul vincitore:`, buttons: cavalliConfig.map(c => ({ buttonId: `${usedPrefix}puntacorsa ${c.nome}`, buttonText: { displayText: c.nome }, type: 1 })) })
    if (command === 'infogratta') return conn.sendMessage(m.chat, { text: `*🎟️ GRATTA*\nCosto 200€`, buttons: [{ buttonId: `${usedPrefix}gratta`, buttonText: { displayText: '🎟️ COMPRA' }, type: 1 }] })

    // --- 2. LOGICHE ANIMATE ---

    // 🎰 SLOT ANIMATA
    if (command === 'slot') {
        if (!checkMoney(100)) return
        const encoder = new GIFEncoder(600, 250); encoder.start(); encoder.setRepeat(0); encoder.setDelay(100); encoder.setQuality(10)
        const canvas = createCanvas(600, 250); const ctx = canvas.getContext('2d')
        
        let final = [fruits[Math.floor(Math.random()*6)], fruits[Math.floor(Math.random()*6)], fruits[Math.floor(Math.random()*6)]]
        let win = (final[0] === final[1] || final[1] === final[2] || final[0] === final[2])
        const imgs = {}; for(let f of fruits) imgs[f] = await loadImage(fruitURLs[f])

        for(let i=0; i<12; i++) { // Frame animazione
            ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0,0,600,250)
            for(let j=0; j<3; j++) ctx.drawImage(imgs[fruits[Math.floor(Math.random()*6)]], 100+(j*150), 50, 100, 100)
            encoder.addFrame(ctx)
        }
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0,0,600,250) // Frame finale
        ctx.drawImage(imgs[final[0]], 100, 50, 100, 100); ctx.drawImage(imgs[final[1]], 250, 50, 100, 100); ctx.drawImage(imgs[final[2]], 400, 50, 100, 100)
        for(let i=0; i<10; i++) encoder.addFrame(ctx)
        
        encoder.finish(); user.euro += win ? 200 : -100
        return conn.sendMessage(m.chat, { video: encoder.out.getData(), gifPlayback: true, caption: win ? '✅ VINTO!' : '❌ PERSO!', buttons: [{ buttonId: `${usedPrefix}slot`, buttonText: { displayText: '🎰 RIGIOCA' }, type: 1 }] })
    }

    // 🏇 CORSA ANIMATA
    if (command === 'puntacorsa') {
        if (!checkMoney(100)) return
        const encoder = new GIFEncoder(700, 400); encoder.start(); encoder.setRepeat(0); encoder.setDelay(100)
        const canvas = createCanvas(700, 400); const ctx = canvas.getContext('2d')
        
        let winnerIdx = Math.floor(Math.random()*4), win = args[0]?.toUpperCase() === cavalliConfig[winnerIdx].nome
        let positions = [100, 100, 100, 100]

        for(let f=0; f<20; f++) {
            ctx.fillStyle = '#2e7d32'; ctx.fillRect(0,0,700,400)
            cavalliConfig.forEach((c, i) => {
                positions[i] += (f === 19 && i === winnerIdx) ? 400 : Math.random()*25
                ctx.fillStyle = c.color; ctx.beginPath(); ctx.arc(positions[i], 80+(i*80), 20, 0, Math.PI*2); ctx.fill()
                ctx.fillStyle = '#fff'; ctx.fillText(c.nome, 20, 85+(i*80))
            })
            encoder.addFrame(ctx)
        }
        encoder.finish(); user.euro += win ? 250 : -100
        return conn.sendMessage(m.chat, { video: encoder.out.getData(), gifPlayback: true, caption: win ? '🏆 HAI VINTO!' : `💀 PERSO! VINCE IL ${cavalliConfig[winnerIdx].nome}` })
    }

    // ⚽ RIGORE ANIMATO
    if (command === 'rigore') {
        if (!checkMoney(100)) return
        const encoder = new GIFEncoder(600, 350); encoder.start(); encoder.setRepeat(0); encoder.setDelay(100)
        const canvas = createCanvas(600, 350); const ctx = canvas.getContext('2d')
        let tiro = args[0], parata = ['sx', 'cx', 'dx'][Math.floor(Math.random()*3)], win = tiro !== parata
        let pos = { sx: 150, cx: 300, dx: 450 }

        for(let f=0; f<10; f++) {
            ctx.fillStyle = '#4caf50'; ctx.fillRect(0,0,600,350)
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.strokeRect(100, 50, 400, 250)
            // Palla che si muove
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(300 + (pos[tiro]-300)*(f/10), 300 - (150*(f/10)), 15, 0, Math.PI*2); ctx.fill()
            encoder.addFrame(ctx)
        }
        encoder.finish(); user.euro += win ? 150 : -100
        return conn.sendMessage(m.chat, { video: encoder.out.getData(), gifPlayback: true, caption: win ? '⚽ GOOOL!' : '🧤 PARATA!' })
    }

    // 🎟️ GRATTA (Immagine statica veloce)
    if (command === 'gratta') {
        if (!checkMoney(200)) return
        let v = [0, 0, 500, 0, 1000, 5000][Math.floor(Math.random()*6)]
        const canvas = createCanvas(400, 200); const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffd700'; ctx.fillRect(0,0,400,200)
        ctx.fillStyle = '#000'; ctx.font = 'bold 30px Arial'; ctx.textAlign = 'center'
        ctx.fillText(v > 0 ? `HAI VINTO ${v}€!` : 'NON HAI VINTO', 200, 110)
        user.euro += (v - 200)
        return conn.sendMessage(m.chat, { image: canvas.toBuffer(), caption: `Saldo attuale: ${user.euro}€` })
    }
}

handler.command = /^(casino|infoslot|infogratta|inforigore|infocorsa|slot|gratta|rigore|puntacorsa)$/i
handler.group = true
export default handler
