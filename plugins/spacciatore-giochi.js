import { createCanvas } from 'canvas'

// Inizializziamo l'oggetto globale per gestire le piazze dei vari gruppi
global.piazze = global.piazze || {}

const footer = '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let chat = m.chat
    let user = m.sender
    let ora = Date.now()
    let oggi = new Date().toLocaleDateString()

    // Inizializza la piazza specifica per questo gruppo
    if (!global.piazze[chat]) {
        global.piazze[chat] = {
            boss: null,
            scadenza: 0,
            banca: 0,
            prezzi: { '1': 15, '2': 35, '3': 70, '4': 120 },
            storico: {} 
        }
    }

    let piazza = global.piazze[chat]
    global.db.data.users[user] = global.db.data.users[user] || {}
    let dbUser = global.db.data.users[user]

    // --- 1. DIVENTA BOSS DEL GRUPPO ---
    if (command === 'diventa_spaccino') {
        let bossAttivo = piazza.boss && ora < piazza.scadenza
        
        if (bossAttivo) {
            let oreMancanti = Math.ceil((piazza.scadenza - ora) / (1000 * 60 * 60))
            return m.reply(`⚠️ La piazza di questo gruppo è già gestita da @${piazza.boss.split('@')[0]}.\nTorna tra ${oreMancanti} ore!`, null, { mentions: [piazza.boss] })
        }
        
        if (piazza.storico[user] === oggi) {
            return m.reply('🚫 Hai già gestito questa piazza nelle ultime 24h. Lascia spazio agli altri del gruppo!')
        }

        // Assegnazione ruolo
        piazza.boss = user
        piazza.scadenza = ora + (24 * 60 * 60 * 1000)
        piazza.storico[user] = oggi
        piazza.banca = 0

        let intro = `ㅤ⋆｡˚『 ╭ \`👑 NUOVO BOSS LOCALE 👑\` ╯ 』˚｡⋆\n╭\n`
        intro += `│ 『 👤 』 @${user.split('@')[0]} è lo spacciatore del gruppo!\n`
        intro += `│ 『 💰 』 I profitti di questa chat andranno a lui.\n`
        intro += `│ 『 ⏳ 』 Turno valido per 24 ore.\n`
        intro += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        return conn.sendMessage(chat, { text: intro, mentions: [user] })
    }

    // --- 2. MENU DEL GRUPPO ---
    if (command === 'spaccino') {
        if (!piazza.boss || ora > piazza.scadenza) {
            return m.reply(`🏙️ Piazza libera. Usa \`${usedPrefix}diventa_spaccino\` per prendere il controllo del gruppo!`)
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
        return conn.sendMessage(chat, { text: menu, mentions: [piazza.boss] })
    }

    // --- 3. ACQUISTO ---
    if (command === 'compra') {
        if (!piazza.boss || ora > piazza.scadenza) return m.reply('❌ Nessuno spaccia in questo gruppo al momento.')
        if (user === piazza.boss) return m.reply('🤨 Sei il boss, non puoi comprare da te stesso!')

        let scelta = text.trim()
        let nomi = { '1': 'Erba', '2': 'Haze', '3': 'Resina', '4': 'Amnesia' }
        let prezzo = piazza.prezzi[scelta]

        if (!prezzo) return m.reply('📦 Scegli un numero tra 1 e 4.')
        if (dbUser.euro < prezzo) return m.reply(`📉 Non hai abbastanza euro!`)

        // Pagamento al boss del gruppo
        dbUser.euro -= prezzo
        piazza.banca += prezzo
        global.db.data.users[piazza.boss].euro = (global.db.data.users[piazza.boss].euro || 0) + prezzo

        dbUser.tasca_droga = { id: scelta, nome: nomi[scelta] }

        return m.reply(`✅ Hai comprato *${nomi[scelta]}*.\nEuro inviati al boss del gruppo: @${piazza.boss.split('@')[0]}`, null, { mentions: [piazza.boss] })
    }

    // --- 4. FUMA ---
    if (command === 'fuma') {
        if (!dbUser.tasca_droga) return m.reply('🤷‍♂️ Non hai roba. Passa dallo `.spaccino`!')

        let qualita = parseInt(dbUser.tasca_droga.id)
        const moodArr = [
            { t: 'PARANOIA', d: 'Stai controllando se c\'è la pula nel gruppo.', c: '#ff3333' },
            { t: 'FAME CHIMICA', d: 'Hai appena svuotato il frigo.', c: '#ff9900' },
            { t: 'CHILL', d: 'Ti senti in pace con il mondo.', c: '#33ccff' },
            { t: 'TRIP', d: 'Vedi i messaggi del bot che ballano.', c: '#cc33ff' }
        ]
        let mSelected = moodArr[qualita - 1]

        const canvas = createCanvas(500, 200)
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, 500, 200)
        ctx.strokeStyle = mSelected.c; ctx.lineWidth = 10; ctx.strokeRect(5, 5, 490, 190)

        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 35px Arial'; ctx.textAlign = 'center'
        ctx.fillText(mSelected.t, 250, 90)
        ctx.font = '20px Arial'; ctx.fillText(mSelected.d, 250, 140)

        let cap = `ㅤ⋆｡˚『 ╭ \`🌬️ SPINNELLO CONSUMATO\` ╯ 』˚｡⋆\n`
        cap += `│ 『 🎭 』 \`Mood:\` *${mSelected.t}*\n`
        cap += `│ 『 📦 』 \`Tipo:\` *${dbUser.tasca_droga.nome}*\n`
        cap += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        delete dbUser.tasca_droga
        return conn.sendMessage(chat, { image: canvas.toBuffer(), caption: cap, footer }, { quoted: m })
    }
}

handler.help = ['diventaspaccino', 'spaccino', 'compra', 'fuma']
handler.tags = ['giochi']
handler.command = /^(diventaspaccino|spaccino|compra|fuma)$/i
handler.group = true

export default handler
