import { createCanvas } from 'canvas'

// Inizializzazione sicura dell'oggetto globale
if (!global.piazze) global.piazze = {}

const footer = '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let chat = m.chat
    let user = m.sender
    let ora = Date.now()
    let oggi = new Date().toLocaleDateString('it-IT')

    // Inizializzazione della piazza specifica per questa chat
    if (!global.piazze[chat]) {
        global.piazze[chat] = {
            boss: null,
            scadenza: 0,
            banca: 0,
            prezzi: { '1': 15, '2': 35, '3': 75, '4': 150 },
            storico: {} 
        }
    }

    let piazza = global.piazze[chat]
    
    // Database utenti
    global.db.data.users[user] = global.db.data.users[user] || { euro: 0 }
    let dbUser = global.db.data.users[user]

    // --- 1. DIVENTA BOSS DEL GRUPPO ---
    if (command === 'diventaspaccino') {
        let bossAttivo = piazza.boss && ora < piazza.scadenza
        
        if (bossAttivo) {
            let oreMancanti = Math.ceil((piazza.scadenza - ora) / (1000 * 60 * 60))
            return conn.reply(chat, `⚠️ La piazza è già occupata da @${piazza.boss.split('@')[0]}.\nTorna tra ${oreMancanti} ore!`, m, { mentions: [piazza.boss] })
        }
        
        // Controllo se è stato boss oggi
        if (piazza.storico[user] === oggi) {
            return conn.reply(chat, '🚫 Hai già gestito la piazza in questo turno. Lascia spazio agli altri!', m)
        }

        // Assegnazione Ruolo
        piazza.boss = user
        piazza.scadenza = ora + (24 * 60 * 60 * 1000) // 24 ore
        piazza.storico[user] = oggi
        piazza.banca = 0

        let intro = `ㅤ⋆｡˚『 ╭ \`👑 NUOVO BOSS LOCALE 👑\` ╯ 』˚｡⋆\n╭\n`
        intro += `│ 『 👤 』 @${user.split('@')[0]} è lo spaccino del gruppo!\n`
        intro += `│ 『 💰 』 Tutti i profitti della chat andranno a lui.\n`
        intro += `│ 『 ⏳ 』 Scadenza: 24 ore.\n`
        intro += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        return conn.sendMessage(chat, { text: intro, mentions: [user] }, { quoted: m })
    }

    // --- 2. IL LISTINO ---
    if (command === 'spaccino') {
        if (!piazza.boss || ora > piazza.scadenza) {
            return conn.reply(chat, `🏙️ La piazza è libera. Usa \`${usedPrefix}diventaspaccino\`!`, m)
        }

        let menu = `ㅤ⋆｡˚『 ╭ \`🍀 MERCATO DI @${piazza.boss.split('@')[0].toUpperCase()} 🍀\` ╯ 』˚｡⋆\n╭\n`
        menu += `│ 『 🚬 』 *1. Erba* ➔ ${piazza.prezzi['1']}€\n`
        menu += `│ 『 🍋 』 *2. Haze* ➔ ${piazza.prezzi['2']}€\n`
        menu += `│ 『 🍫 』 *3. Resina* ➔ ${piazza.prezzi['3']}€\n`
        menu += `│ 『 👺 』 *4. Amnesia* ➔ ${piazza.prezzi['4']}€\n`
        menu += `│ ──────────────────\n`
        menu += `│ 『 🪙 』 \`Incasso attuale:\` ${piazza.banca}€\n`
        menu += `│ 『 🛒 』 Usa: \`${usedPrefix}compra <1-4>\`\n`
        menu += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
        return conn.sendMessage(chat, { text: menu, mentions: [piazza.boss] }, { quoted: m })
    }

    // --- 3. COMPRA ---
    if (command === 'compra') {
        if (!piazza.boss || ora > piazza.scadenza) return m.reply('❌ Piazza vuota.')
        if (user === piazza.boss) return m.reply('🤨 Sei il boss, fuma gratis con `.fuma`!')

        let scelta = text.trim()
        if (!['1', '2', '3', '4'].includes(scelta)) return m.reply('📦 Scegli un prodotto (1-4).')
        
        let prezzo = piazza.prezzi[scelta]
        if (dbUser.euro < prezzo) return m.reply(`📉 Non hai ${prezzo}€!`)

        // Transazione
        dbUser.euro -= prezzo
        piazza.banca += prezzo
        
        // Pagamento immediato al Boss
        global.db.data.users[piazza.boss] = global.db.data.users[piazza.boss] || { euro: 0 }
        global.db.data.users[piazza.boss].euro += prezzo

        dbUser.tasca_droga = { id: scelta, nome: ['Erba', 'Haze', 'Resina', 'Amnesia'][parseInt(scelta)-1] }

        return conn.reply(chat, `✅ Hai comprato *${dbUser.tasca_droga.nome}*.\nI soldi sono stati accreditati al Boss @${piazza.boss.split('@')[0]}`, m, { mentions: [piazza.boss] })
    }

    // --- 4. FUMA ---
    if (command === 'fuma') {
        let isBoss = (user === piazza.boss && ora < piazza.scadenza)
        if (!dbUser.tasca_droga && !isBoss) return m.reply('🤷‍♂️ Non hai roba. Passa dallo spaccino!')

        let qualita = isBoss ? 4 : parseInt(dbUser.tasca_droga.id)
        let nomeRoba = isBoss ? "Riserva del Boss" : dbUser.tasca_droga.nome
        
        const moodArr = [
            { t: 'PARANOIA', d: 'Senti le sirene? Nasconditi!', c: '#ff3333' },
            { t: 'FAME CHIMICA', d: 'Hai appena svaligiato una panetteria.', c: '#ff9900' },
            { t: 'RELAX', d: 'Sei una statua di sale.', c: '#33ccff' },
            { t: 'TRIP', d: 'Vedi i draghi volare nel gruppo.', c: '#cc33ff' }
        ]
        let mSel = moodArr[qualita - 1]

        const canvas = createCanvas(500, 200)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, 500, 200)
        ctx.strokeStyle = mSel.c; ctx.lineWidth = 10; ctx.strokeRect(5, 5, 490, 190)
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 35px Arial'; ctx.textAlign = 'center'
        ctx.fillText(mSel.t, 250, 90)
        ctx.font = '20px Arial'; ctx.fillText(mSel.d, 250, 140)

        let cap = `ㅤ⋆｡˚『 ╭ \`🌬️ SESSIONE DI FUMO\` ╯ 』˚｡⋆\n`
        cap += `│ 『 🌿 』 \`Prodotto:\` *${nomeRoba}*\n`
        cap += `│ 『 🎭 』 \`Effetto:\` *${mSel.t}*\n`
        cap += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        if (!isBoss) delete dbUser.tasca_droga
        return conn.sendMessage(chat, { image: canvas.toBuffer(), caption: cap, footer }, { quoted: m })
    }
}

handler.help = ['diventaspaccino', 'spaccino', 'compra', 'fuma']
handler.tags = ['giochi']
handler.command = /^(diventaspaccino|spaccino|compra|fuma)$/i
handler.group = true

export default handler
