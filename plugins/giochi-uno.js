let unoSession = {}

const colori = { 'Rosso': '🔴', 'Blu': '🔵', 'Giallo': '🟡', 'Verde': '🟢' }

function creaMazzo() {
    let mazzo = []
    for (let c in colori) {
        for (let v = 0; v <= 9; v++) mazzo.push(`${c} ${v}`)
        mazzo.push(`${c} +2`)
    }
    for (let i = 0; i < 4; i++) {
        mazzo.push('Jolly')
        mazzo.push('Jolly +4')
    }
    return mazzo.sort(() => Math.random() - 0.5)
}

function formattaCarta(carta) {
    if (carta === 'Jolly') return '🌈 Jolly'
    if (carta === 'Jolly +4') return '🌈 Jolly +4'
    let [c, v] = carta.split(' ')
    return `${v}${colori[c]}`
}

function puoGiocare(carta, tavolo, coloreScelto) {
    if (carta.includes('Jolly')) return true
    let [c_c, c_v] = carta.split(' ')
    let [t_c, t_v] = tavolo.split(' ')
    return c_c === t_c || c_v === t_v || c_c === coloreScelto
}

let handler = async (m, { conn, command }) => {
    let chat = m.chat
    if (command === 'uno') {
        if (unoSession[chat]) return m.reply('⚠️ Partita già in corso!')
        
        let mazzo = creaMazzo()
        let playerHand = mazzo.splice(0, 7)
        let botHand = mazzo.splice(0, 7)
        let tableCard = mazzo.find(c => !c.includes('Jolly'))
        mazzo.splice(mazzo.indexOf(tableCard), 1)

        unoSession[chat] = {
            player: m.sender,
            mazzo,
            playerHand,
            botHand,
            tableCard,
            currentColor: tableCard.split(' ')[0]
        }

        let s = unoSession[chat]
        let txt = `🃏 *UNO: SFIDA AL BOT* 🃏\n\n`
        txt += `📍 Tavola: *${formattaCarta(s.tableCard)}*\n`
        txt += `🎨 Colore: *${s.currentColor}*\n\n`
        txt += `*LE TUE CARTE:*\n`
        s.playerHand.forEach((c, i) => txt += `*${i + 1}* = ${formattaCarta(c)}\n`)
        txt += `\nInvia il *numero* della carta per giocare o scrivi *pesca*.`

        await conn.sendMessage(chat, { text: txt, mentions: [m.sender] }, { quoted: m })
    }
}

handler.before = async function (m, { conn }) {
    if (!m.chat || !m.sender || m.isBaileys) return
    let s = unoSession[m.chat]
    if (!s || s.player !== m.sender) return

    let msg = m.text.trim().toLowerCase()

    if (msg === 'pesca') {
        let p = s.mazzo.shift()
        s.playerHand.push(p)
        return m.reply(`Hai pescato: ${formattaCarta(p)}`)
    }

    let index = parseInt(msg) - 1
    if (!isNaN(index) && index >= 0 && index < s.playerHand.length) {
        let cartaScelta = s.playerHand[index]

        if (!puoGiocare(cartaScelta, s.tableCard, s.currentColor)) {
            return m.reply(`❌ Mossa non valida! Non puoi usare ${formattaCarta(cartaScelta)} ora.`)
        }

        s.playerHand.splice(index, 1)
        s.tableCard = cartaScelta
        
        if (cartaScelta.includes('Jolly')) {
            let conta = { 'Rosso': 0, 'Blu': 0, 'Giallo': 0, 'Verde': 0 }
            s.playerHand.forEach(c => { if(!c.includes('Jolly')) conta[c.split(' ')[0]]++ })
            s.currentColor = Object.keys(conta).reduce((a, b) => conta[a] > conta[b] ? a : b)
        } else {
            s.currentColor = cartaScelta.split(' ')[0]
        }

        if (s.playerHand.length === 0) {
            delete unoSession[m.chat]
            return m.reply('🎉 *UNO!* Hai vinto la partita!')
        }

        let report = `Hai giocato ${formattaCarta(cartaScelta)}.\n`
        
        if (cartaScelta.includes('+2')) {
            s.botHand.push(s.mazzo.shift(), s.mazzo.shift())
            report += `🤖 Il bot pesca 2 carte e salta il turno!\n`
        } else if (cartaScelta.includes('+4')) {
            for(let i=0; i<4; i++) s.botHand.push(s.mazzo.shift())
            report += `🤖 Il bot pesca 4 carte e salta il turno!\n`
        } else {
            let bIdx = s.botHand.findIndex(c => puoGiocare(c, s.tableCard, s.currentColor))
            if (bIdx !== -1) {
                let cBot = s.botHand.splice(bIdx, 1)[0]
                s.tableCard = cBot
                if (cBot.includes('Jolly')) {
                    let cB = { 'Rosso': 0, 'Blu': 0, 'Giallo': 0, 'Verde': 0 }
                    s.botHand.forEach(c => { if(!c.includes('Jolly')) cB[c.split(' ')[0]]++ })
                    s.currentColor = Object.keys(cB).reduce((a, b) => cB[a] > cB[b] ? a : b)
                } else {
                    s.currentColor = cBot.split(' ')[0]
                }
                report += `🤖 Il bot gioca: *${formattaCarta(cBot)}*\n`
                if (cBot.includes('+2')) {
                    s.playerHand.push(s.mazzo.shift(), s.mazzo.shift())
                    report += `⚠️ Hai ricevuto un +2! Pesca e salta il turno.\n`
                } else if (cBot.includes('+4')) {
                    for(let i=0; i<4; i++) s.playerHand.push(s.mazzo.shift())
                    report += `⚠️ Hai ricevuto un +4! Pesca e salta il turno.\n`
                }
            } else {
                s.botHand.push(s.mazzo.shift())
                report += `🤖 Il bot non ha carte valide e pesca.\n`
            }
        }

        if (s.botHand.length === 0) {
            delete unoSession[m.chat]
            return m.reply(report + '🤡 *SCONFITTA!* Il bot ha vinto.')
        }

        let status = `${report}\n📍 Tavola: *${formattaCarta(s.tableCard)}*\n🎨 Colore: *${s.currentColor}*\n🤖 Carte Bot: ${s.botHand.length}\n\n*LE TUE CARTE:*\n`
        s.playerHand.forEach((c, i) => status += `*${i + 1}* = ${formattaCarta(c)}\n`)
        return m.reply(status)
    }
}

handler.help = ['uno']
handler.tags = ['giochi']
handler.command = /^(uno)$/i
handler.group = true

export default handler
