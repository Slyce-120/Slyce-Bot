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
                '1': { n: 'Erba', g: '3g', p: 20, cat: 'leggera' },
                '2': { n: 'Haze', g: '5g', p: 50, cat: 'leggera' },
                '3': { n: 'Amnesia', g: '3g', p: 80, cat: 'leggera' },
                '4': { n: 'Cocaina', g: '1g', p: 150, cat: 'pesante' },
                '5': { n: 'Eroina', g: '1g', p: 200, cat: 'pesante' },
                '6': { n: 'Crystal Meth', g: '2g', p: 300, cat: 'pesante' }
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
        if (bossAttivo) return conn.reply(chat, `⚠️ La piazza è già occupata da @${piazza.boss.split('@')[0]}`, m, { mentions: [piazza.boss] })
        if (piazza.storico[user] === oggi) return m.reply('🚫 Hai già gestito la piazza oggi.')

        piazza.boss = user
        piazza.scadenza = ora + (24 * 60 * 60 * 1000)
        piazza.storico[user] = oggi
        piazza.banca = 0

        return conn.sendMessage(chat, { 
            text: `👑 @${user.split('@')[0]} è il nuovo boss della piazza!\nTutti gli incassi andranno a lui.`, 
            mentions: [user],
            footer,
            interactiveButtons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📦 APRI LISTINO', id: `${usedPrefix}spaccino` }) }]
        }, { quoted: m })
    }

    // --- 2. MENU SPACCINO ---
    if (command === 'spaccino') {
        if (!piazza.boss || ora > piazza.scadenza) return m.reply(`🏙️ Piazza vuota. Usa \`${usedPrefix}diventaspaccino\``)

        let menu = `ㅤ⋆｡˚『 ╭ \`💊 BLACK MARKET @${piazza.boss.split('@')[0].toUpperCase()} 💊\` ╯ 』˚｡⋆\n╭\n`
        
        // Costruzione dinamica del listino
        for (let key in piazza.prezzi) {
            let item = piazza.prezzi[key]
            menu += `│ 『 ${key} 』 *${item.n}* (${item.g}) ➔ *${item.p}€*\n`
        }
        
        menu += `│ ──────────────────\n`
        menu += `│ 『 🪙 』 Incasso Boss: ${piazza.banca}€\n`
        menu += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        const buttons = [
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🌿 LEGGERA', id: `${usedPrefix}compra leggera` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '💀 PESANTE', id: `${usedPrefix}compra pesante` }) }
        ]
        return conn.sendMessage(chat, { text: menu, footer, mentions: [piazza.boss], interactiveButtons: buttons }, { quoted: m })
    }

    // --- 3. COMPRA ---
    if (command === 'compra') {
        if (!piazza.boss || ora > piazza.scadenza) return m.reply('❌ Piazza vuota.')
        
        let sub = text.toLowerCase().trim()
        if (!sub) return m.reply(`Specifica cosa comprare! Es: \`${usedPrefix}compra 1\``)

        // Sottocategorie bottoni
        if (sub === 'leggera' || sub === 'pesante') {
            let ids = Object.keys(piazza.prezzi).filter(k => piazza.prezzi[k].cat === sub)
            let btnList = ids.map(id => ({
                name: 'quick_reply', 
                buttonParamsJson: JSON.stringify({ display_text: `${piazza.prezzi[id].n} (${piazza.prezzi[id].p}€)`, id: `${usedPrefix}compra ${id}` })
            }))
            return conn.sendMessage(chat, { text: `Scegli la roba ${sub}:`, footer, interactiveButtons: btnList }, { quoted: m })
        }

        let prodotto = piazza.prezzi[sub]
        if (!prodotto) return m.reply('❌ Numero non valido. Guarda lo `.spaccino`')

        if (dbUser.euro < prodotto.p) return m.reply(`📉 Ti servono ${prodotto.p}€, ne hai solo ${dbUser.euro}!`)

        // Transazione
        dbUser.euro -= prodotto.p
        piazza.banca += prodotto.p
        global.db.data.users[piazza.boss].euro += prodotto.p

        dbUser.inventario = { nome: prodotto.n, grammi: prodotto.g, cat: prodotto.cat }

        let tipoAzione = prodotto.cat === 'leggera' ? 'fuma' : 'pippa'
        const btnUsa = [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: `🚀 USA ORA`, id: `${usedPrefix}${tipoAzione}` }) }]
        
        return conn.sendMessage(chat, { text: `✅ Hai comprato *${prodotto.n} (${prodotto.g})*.\nI tuoi soldi sono andati al Boss.`, footer, interactiveButtons: btnUsa }, { quoted: m })
    }

    // --- 4. FUMA / PIPPA ---
    if (command === 'fuma' || command === 'pippa') {
        if (!dbUser.inventario) return m.reply('🤷‍♂️ La roba è finita! Devi ricomprarla dallo .spaccino')
        
        let roba = dbUser.inventario
        if (command === 'fuma' && roba.cat !== 'leggera') return m.reply('🤨 Questa roba è troppo pesante per essere fumata! Usa .pippa')
        if (command === 'pippa' && roba.cat !== 'pesante') return m.reply('🤨 Questa roba non si pippa! Usa .fuma')

        let mood = ''
        if (command === 'fuma') {
            let moods = ['🚨 PARANOIA: Pensi che il Boss ti abbia venduto origano.', '🍔 FAME CHIMICA: Hai mangiato un kebab da 4kg.', '☁️ RELAX: Sei diventato uno con il divano.']
            mood = moods[Math.floor(Math.random() * moods.length)]
        } else {
            let moods = ['⚡ POWER: Ti senti Tony Montana in ufficio!', '🕺 EUPHORIA: Stai parlando a 300 all\'ora.', '💔 CRASH: Ti senti il cuore in gola.']
            mood = moods[Math.floor(Math.random() * moods.length)]
        }

        let res = `ㅤ⋆｡˚『 ╭ \`🌬️ SESSIONE TERMINATA\` ╯ 』˚｡⋆\n`
        res += `│ 『 🧪 』 \`Usato:\` *${roba.nome} (${roba.grammi})*\n`
        res += `│ 『 🎭 』 \`Effetto:\` *${mood}*\n`
        res += `│ ──────────────────\n`
        res += `│ ⚠️ *Roba finita. Se ne vuoi ancora, paga il Boss!*\n`
        res += `*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

        delete dbUser.inventario 
        return conn.sendMessage(chat, { text: res, footer }, { quoted: m })
    }
}

handler.help = ['diventaspaccino', 'spaccino', 'compra', 'fuma', 'pippa']
handler.tags = ['giochi']
handler.command = /^(diventaspaccino|spaccino|compra|fuma|pippa)$/i
handler.group = true

export default handler
