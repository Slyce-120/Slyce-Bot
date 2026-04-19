// Inizializzazione sicura dell'oggetto globale
if (!global.piazze) global.piazze = {}

const footer = '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let chat = m.chat
    let user = m.sender
    let ora = Date.now()
    let oggi = new Date().toLocaleDateString('it-IT')

    // Inizializzazione piazza locale
    if (!global.piazze[chat]) {
        global.piazze[chat] = {
            boss: null,
            scadenza: 0,
            banca: 0,
            prezzi: { 
                '1': { n: 'Erba (3g)', p: 20, cat: 'leggera' },
                '2': { n: 'Haze (5g)', p: 50, cat: 'leggera' },
                '3': { n: 'Amnesia (3g)', p: 80, cat: 'leggera' },
                '4': { n: 'Cocaina (1g)', p: 150, cat: 'pesante' },
                '5': { n: 'Eroina (1g)', p: 200, cat: 'pesante' },
                '6': { n: 'Crystal Meth (2g)', p: 300, cat: 'pesante' }
            },
            storico: {} 
        }
    }

    let piazza = global.piazze[chat]
    global.db.data.users[user] = global.db.data.users[user] || { euro: 0 }
    let dbUser = global.db.data.users[user]

    // --- 1. DIVENTASPACCINO ---
    if (command === 'diventaspaccino') {
        let bossAttivo = piazza.boss && ora < piazza.scadenza
        if (bossAttivo) return conn.reply(chat, `⚠️ C'è già un boss: @${piazza.boss.split('@')[0]}`, m, { mentions: [piazza.boss] })
        if (piazza.storico[user] === oggi) return m.reply('🚫 Hai già gestito la piazza oggi.')

        piazza.boss = user
        piazza.scadenza = ora + (24 * 60 * 60 * 1000)
        piazza.storico[user] = oggi
        piazza.banca = 0

        return conn.sendMessage(chat, { 
            text: `👑 @${user.split('@')[0]} ora controlla la piazza!\nTutti gli acquisti arricchiranno lui.`, 
            mentions: [user],
            footer,
            interactiveButtons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📦 LISTINO', id: `${usedPrefix}spaccino` }) }]
        }, { quoted: m })
    }

    // --- 2. MENU SPACCINO ---
    if (command === 'spaccino') {
        if (!piazza.boss || ora > piazza.scadenza) return m.reply(`🏙️ Piazza libera. Usa \`${usedPrefix}diventaspaccino\``)

        let menu = `ㅤ⋆｡˚『 ╭ \`💊 BLACK MARKET @${piazza.boss.split('@')[0].toUpperCase()} 💊\` ╯ 』˚｡⋆\n╭\n`
        Object.keys(piazza.prezzi).forEach(key => {
            menu += `│ 『 ${key} 』 ${piazza.prezzi[key].n} ➔ ${piazza.prezzi[key].p}€\n`
        })
        menu += `│ ──────────────────\n`
        menu += `│ 『 🪙 』 Incasso Boss: ${piazza.banca}€\n`
        menu += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        const buttons = [
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🌿 DROGHE LEGGERE', id: `${usedPrefix}compra leggera` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '💀 DROGHE PESANTI', id: `${usedPrefix}compra pesante` }) }
        ]
        return conn.sendMessage(chat, { text: menu, footer, mentions: [piazza.boss], interactiveButtons: buttons }, { quoted: m })
    }

    // --- 3. COMPRA ---
    if (command === 'compra') {
        if (!piazza.boss || ora > piazza.scadenza) return m.reply('❌ Piazza vuota.')
        
        let sub = text.toLowerCase().trim()
        if (!sub) return m.reply(`Specifica cosa comprare!`)

        // Se l'utente clicca su una categoria
        if (sub === 'leggera' || sub === 'pesante') {
            let ids = Object.keys(piazza.prezzi).filter(key => piazza.prezzi[key].cat === sub)
            let btnList = ids.map(id => ({
                name: 'quick_reply', 
                buttonParamsJson: JSON.stringify({ display_text: `${piazza.prezzi[id].n} (${piazza.prezzi[id].p}€)`, id: `${usedPrefix}compra ${id}` })
            }))
            return conn.sendMessage(chat, { text: `Scegli il prodotto ${sub}:`, footer, interactiveButtons: btnList }, { quoted: m })
        }

        // Se l'utente sceglie l'ID specifico
        let prodotto = piazza.prezzi[sub]
        if (!prodotto) return m.reply('❌ Prodotto non trovato nel listino.')

        if (dbUser.euro < prodotto.p) return m.reply('📉 Non hai abbastanza euro!')

        // Transazione
        dbUser.euro -= prodotto.p
        piazza.banca += prodotto.p
        global.db.data.users[piazza.boss] = global.db.data.users[piazza.boss] || { euro: 0 }
        global.db.data.users[piazza.boss].euro += prodotto.p

        dbUser.inventario = { nome: prodotto.n, cat: prodotto.cat }

        let az = prodotto.cat === 'leggera' ? 'fuma' : 'pippa'
        const btnUsa = [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: `🚀 USA: ${prodotto.n}`, id: `${usedPrefix}${az}` }) }]
        
        return conn.sendMessage(chat, { text: `✅ Hai comprato *${prodotto.n}*.\nI soldi sono andati al Boss.`, footer, interactiveButtons: btnUsa }, { quoted: m })
    }

    // --- 4. FUMA / PIPPA ---
    if (command === 'fuma' || command === 'pippa') {
        if (!dbUser.inventario) return m.reply('🤷‍♂️ Hai già finito tutto! Torna dallo .spaccino per altra roba.')
        
        let roba = dbUser.inventario
        if (command === 'fuma' && roba.cat !== 'leggera') return m.reply('🤨 Questa roba non si fuma, si pippa! Usa .pippa')
        if (command === 'pippa' && roba.cat !== 'pesante') return m.reply('🤨 Questa roba non si pippa, si fuma! Usa .fuma')

        let mood = ''
        if (command === 'fuma') {
            let moods = ['🚨 PARANOIA: Hai visto una volante?', '🍔 FAME CHIMICA: Hai mangiato pure il telecomando.', '☁️ RELAX: Ti senti una nuvola.']
            mood = moods[Math.floor(Math.random() * moods.length)]
        } else {
            let moods = ['⚡ POWER: Ti senti Tony Montana!', '🕺 EUPHORIA: Il cuore batte a 200!', '💔 CRASH: Ti senti un rottame.']
            mood = moods[Math.floor(Math.random() * moods.length)]
        }

        let res = `ㅤ⋆｡˚『 ╭ \`🌬️ SESSIONE TERMINATA\` ╯ 』˚｡⋆\n`
        res += `│ 『 🧪 』 \`Usato:\` *${roba.nome}*\n`
        res += `│ 『 🎭 』 \`Effetto:\` *${mood}*\n`
        res += `│ ──────────────────\n`
        res += `│ ⚠️ *Roba finita. Ricompra per usare di nuovo!*\n`
        res += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        delete dbUser.inventario // RIMOZIONE DOPO L'USO
        return conn.sendMessage(chat, { text: res, footer }, { quoted: m })
    }
}

handler.help = ['diventaspaccino', 'spaccino', 'compra', 'fuma', 'pippa']
handler.tags = ['giochi']
handler.command = /^(diventaspaccino|spaccino|compra|fuma|pippa)$/i
handler.group = true

export default handler
