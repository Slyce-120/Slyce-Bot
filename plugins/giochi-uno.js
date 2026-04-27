let unoSession = {}

const colori = { 'Rosso': '🔴', 'Blu': '🔵', 'Giallo': '🟡', 'Verde': '🟢' }

function creaMazzo() {
    let mazzo = []
    for (let c in colori) {
        for (let v = 0; v <= 9; v++) mazzo.push(`${c} ${v}`)
    }
    for (let i = 0; i < 4; i++) {
        mazzo.push('+2')
        mazzo.push('Jolly')
        mazzo.push('Jolly +4')
    }
    for (let i = mazzo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mazzo[i], mazzo[j]] = [mazzo[j], mazzo[i]]
    }
    return mazzo
}

function formattaCarta(carta) {
    if (carta === 'Jolly') return '🌈 *Jolly*'
    if (carta === 'Jolly +4') return '🌈 *Jolly +4*'
    if (carta === '+2') return '🃏 *+2 Neutro*'
    let [c, v] = carta.split(' ')
    return `*${v}${colori[c]}*`
}

function puoGiocare(carta, tavolo, coloreScelto) {
    if (carta === 'Jolly' || carta === 'Jolly +4' || carta === '+2') return true
    let [c_c, v_c] = carta.split(' ')
    if (tavolo === '+2' || tavolo.includes('Jolly')) return c_c === coloreScelto
    let [c_t, v_t] = tavolo.split(' ')
    return c_c === c_t || v_c === v_t || c_c === coloreScelto
}

function generaStato(s, nomeUtente, extraMsg = '') {
    return `━━━━━━━━━━━━━━━━━━━━
🃏   *PARTITA DI UNO* 🃏
━━━━━━━━━━━━━━━━━━━━

${extraMsg ? extraMsg + '\n' : ''}
📍 In Tavola: ${formattaCarta(s.tableCard)}
🎨 Colore Attivo: *${s.currentColor} ${colori[s.currentColor] || ''}*
🤖 Bot: *${s.botHand.length}* | 🎴 Mazzo: *${s.mazzo.length}*

👤 *MANO DI ${nomeUtente.toUpperCase()}:*
${s.playerHand.map((c, i) => `  *${i + 1}* ⮕ ${formattaCarta(c)}`).join('\n')}

*COMANDI:* Numero | *pesca* | *enduno*
━━━━━━━━━━━━━━━━━━━━`
}

let handler = async (m, { conn, command }) => {
    let chat = m.chat
    if (command === 'uno') {
        if (unoSession[chat]) return m.reply('⚠️ Partita in corso!')
        let mazzo = creaMazzo()
        let playerHand = mazzo.splice(0, 7)
        let botHand = mazzo.splice(0, 7)
        let tableIdx = mazzo.findIndex(c => !['Jolly', 'Jolly +4', '+2'].includes(c))
        let tableCard = mazzo.splice(tableIdx, 1)[0]
        unoSession[chat] = {
            player: m.sender,
            mazzo,
            playerHand,
            botHand,
            tableCard,
            currentColor: tableCard.split(' ')[0]
        }
        await conn.sendMessage(chat, { text: generaStato(unoSession[chat], conn.getName(m.sender)) }, { quoted: m })
    }
}

handler.before = async function (m, { conn }) {
    if (!m.chat || !unoSession[m.chat] || unoSession[m.chat].player !== m.sender || m.isBaileys) return
    let s = unoSession[m.chat]
    let msg = m.text.trim().toLowerCase()
    let name = conn.getName(m.sender)

    if (msg === 'enduno') {
        delete unoSession[m.chat]
        return m.reply('❌ Finita!')
    }

    if (msg === 'pesca') {
        if (!s.mazzo.length) s.mazzo = creaMazzo()
        let p = s.mazzo.shift()
        s.playerHand.push(p)
        let report = `📥 Hai pescato: ${formattaCarta(p)}`
        let bIdx = s.botHand.findIndex(c => puoGiocare(c, s.tableCard, s.currentColor))
        if (bIdx !== -1) {
            let cB = s.botHand.splice(bIdx, 1)[0]
            s.tableCard = cB
            if (!['Jolly', 'Jolly +4', '+2'].includes(cB)) s.currentColor = cB.split(' ')[0]
            report += `\n🤖 Bot gioca: ${formattaCarta(cB)}`
        } else {
            if (!s.mazzo.length) s.mazzo = creaMazzo()
            s.botHand.push(s.mazzo.shift()); report += `\n🤖 Bot pesca.`
        }
        return m.reply(generaStato(s, name, report))
    }

    let index = parseInt(msg) - 1
    if (!isNaN(index) && index >= 0 && index < s.playerHand.length) {
        let carta = s.playerHand[index]
        if (!puoGiocare(carta, s.tableCard, s.currentColor)) return m.reply(`🚫 No!`)
        s.playerHand.splice(index, 1)
        s.tableCard = carta
        
        if (carta.includes('Jolly')) {
            let cP = { 'Rosso': 0, 'Blu': 0, 'Giallo': 0, 'Verde': 0 }
            s.playerHand.forEach(c => { if(c.includes(' ')) cP[c.split(' ')[0]]++ })
            s.currentColor = Object.keys(cP).reduce((a, b) => cP[a] > cP[b] ? a : b)
        } else if (carta !== '+2') {
            s.currentColor = carta.split(' ')[0]
        }

        if (s.playerHand.length === 0) {
            delete unoSession[m.chat]
            return m.reply(`🏆 VINTO!`)
        }

        let report = `✅ Giocata: ${formattaCarta(carta)}`
        if (carta.includes('+2') || carta.includes('+4')) {
            let n = carta.includes('+4') ? 4 : 2
            for(let i=0; i<n; i++) { if(!s.mazzo.length) s.mazzo = creaMazzo(); s.botHand.push(s.mazzo.shift()) }
            return m.reply(generaStato(s, name, report + `\n🤖 Bot +${n} e salta!`))
        }

        let bIdx = s.botHand.findIndex(c => puoGiocare(c, s.tableCard, s.currentColor))
        if (bIdx !== -1) {
            let cB = s.botHand.splice(bIdx, 1)[0]
            s.tableCard = cB
            if (cB.includes('Jolly')) {
                let ct = { 'Rosso': 0, 'Blu': 0, 'Giallo': 0, 'Verde': 0 }
                s.botHand.forEach(c => { if(c.includes(' ')) ct[c.split(' ')[0]]++ })
                s.currentColor = Object.keys(ct).reduce((a, b) => ct[a] > ct[b] ? a : b)
            } else if (cB !== '+2') {
                s.currentColor = cB.split(' ')[0]
            }
            report += `\n🤖 Bot gioca: ${formattaCarta(cB)}`
            if (cB.includes('+2') || cB.includes('+4')) {
                let n = cB.includes('+4') ? 4 : 2
                for(let i=0; i<n; i++) { if(!s.mazzo.length) s.mazzo = creaMazzo(); s.playerHand.push(s.mazzo.shift()) }
                report += `\n⚠️ Prendi +${n} e salti!`
            }
        } else { if(!s.mazzo.length) s.mazzo = creaMazzo(); s.botHand.push(s.mazzo.shift()); report += `\n🤖 Bot pesca.` }

        if (s.botHand.length === 0) { delete unoSession[m.chat]; return m.reply(report + `\n\n🤡 PERSO!`) }
        return m.reply(generaStato(s, name, report))
    }
}

handler.command = /^(uno)$/i
export default handler
