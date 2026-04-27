let unoSession = {}

const colori = { 'Rosso': '🟥', 'Blu': '🟦', 'Giallo': '🟨', 'Verde': '🟩' }

const playAgainButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: '🔄 RIGIOCA', id: '.uno' })
}];

const gameButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: '📥 PESCA', id: 'pesca' })
}, {
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: '🛑 ABBANDONA', id: 'enduno' })
}];

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
    for (let i = mazzo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mazzo[i], mazzo[j]] = [mazzo[j], mazzo[i]]
    }
    return mazzo
}

function formattaCarta(carta) {
    if (carta === 'Jolly') return '🌈 *JOLLY*'
    if (carta === 'Jolly +4') return '🌈 *JOLLY +4*'
    let [c, v] = carta.split(' ')
    return `*${v} ${colori[c]}*`
}

function puoGiocare(carta, tavolo, coloreScelto) {
    if (carta.includes('Jolly')) return true
    let [c_c, v_c] = carta.split(' ')
    let [c_t, v_t] = tavolo.split(' ')
    if (tavolo.includes('Jolly')) return c_c === coloreScelto
    return c_c === c_t || v_c === v_t || c_c === coloreScelto
}

function generaStato(s, nomeUtente, extraMsg = '') {
    let txt = `╔══════════════════╗\n`
    txt += `     🃏  *UNO CHAMPIONSHIP* 🃏\n`
    txt += `╚══════════════════╝\n\n`
    
    if (extraMsg) txt += `🔔 *ULTIMA AZIONE:*\n${extraMsg}\n\n`
    
    txt += `┌───  *CAMPO DI GIOCO* ───\n`
    txt += `│ 📍 In Tavola: ${formattaCarta(s.tableCard)}\n`
    txt += `│ 🎨 Colore: *${s.currentColor.toUpperCase()} ${colori[s.currentColor] || ''}*\n`
    txt += `│ 🤖 Bot: [ ${'🎴'.repeat(s.botHand.length)} ]\n`
    txt += `└───────────────────\n\n`
    
    txt += `👤 *MANO DI ${nomeUtente.toUpperCase()}:*\n`
    s.playerHand.forEach((c, i) => {
        txt += `  *${i + 1}* ⮕ ${formattaCarta(c)}\n`
    })
    
    txt += `\n✨ *Come giocare?*\nScrivi il numero della carta o usa i tasti.\n`
    txt += `━━━━━━━━━━━━━━━━━━━━`
    return txt
}

function pescaCarte(mazzo, mano, quantita) {
    for (let i = 0; i < quantita; i++) {
        if (mazzo.length === 0) mazzo.push(...creaMazzo())
        mano.push(mazzo.shift())
    }
}

let handler = async (m, { conn, command, text }) => {
    let chat = m.chat
    let name = conn.getName(m.sender)

    delete unoSession[chat]
    let mazzo = creaMazzo()
    let playerHand = mazzo.splice(0, 7)
    let botHand = mazzo.splice(0, 7)
    let tableIdx = mazzo.findIndex(c => !c.includes('Jolly') && !c.includes('+2'))
    let tableCard = mazzo.splice(tableIdx, 1)[0]

    unoSession[chat] = {
        player: m.sender,
        mazzo: mazzo,
        playerHand: playerHand,
        botHand: botHand,
        tableCard: tableCard,
        currentColor: tableCard.split(' ')[0]
    }

    let s = unoSession[chat]

    await conn.sendMessage(chat, {
        text: generaStato(s, name, "🎮 *La partita è iniziata! Buona fortuna.*"),
        interactiveButtons: gameButtons()
    }, { quoted: m })
}

handler.before = async (m, { conn }) => {
    const chat = m.chat
    let msgText = (m.text || m.body || '').trim().toLowerCase()

    if (m.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
        try {
            const params = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)
            msgText = params.id.toLowerCase()
        } catch (e) {}
    }

    if (msgText === '.uno') return false

    let s = unoSession[chat]
    if (!s || s.player !== m.sender) return

    let name = conn.getName(m.sender)

    if (msgText === 'enduno' || msgText === '🛑 abbandona') {
        delete unoSession[chat]
        await m.reply('🏳️ *Partita interrotta.* Alla prossima!')
        return true
    }

    if (msgText === 'pesca' || msgText === '📥 pesca') {
        if (s.mazzo.length === 0) s.mazzo = creaMazzo()
        let p = s.mazzo.shift()
        s.playerHand.push(p)
        let reportP = `📥 Hai pescato: ${formattaCarta(p)}`

        if (!puoGiocare(p, s.tableCard, s.currentColor)) {
            reportP += `\n❌ Non giocabile! Passi il turno.`
            let bIdx = s.botHand.findIndex(c => puoGiocare(c, s.tableCard, s.currentColor))
            if (bIdx !== -1) {
                let cBot = s.botHand.splice(bIdx, 1)[0]
                s.tableCard = cBot
                s.currentColor = cBot.includes('Jolly') ? s.currentColor : cBot.split(' ')[0]
                reportP += `\n🤖 Il Bot risponde con: ${formattaCarta(cBot)}`

                if (cBot.includes('+2')) {
                    pescaCarte(s.mazzo, s.playerHand, 2)
                    reportP += `\n⚠️ *Ahi!* Il Bot ti infligge un +2!`
                } else if (cBot.includes('+4')) {
                    pescaCarte(s.mazzo, s.playerHand, 4)
                    reportP += `\n⚠️ *Brutta storia!* Il Bot ti infligge un +4!`
                }
            } else {
                if (s.mazzo.length > 0) s.botHand.push(s.mazzo.shift())
                reportP += `\n🤖 Il Bot non ha mosse e pesca.`
            }
        } else {
            reportP += `\n✅ Fortuna! La carta è giocabile.`
        }

        await conn.sendMessage(chat, {
            text: generaStato(s, name, reportP),
            interactiveButtons: gameButtons()
        }, { quoted: m })
        return true
    }

    let index = parseInt(msgText) - 1
    if (!isNaN(index) && index >= 0 && index < s.playerHand.length) {
        let cartaScelta = s.playerHand[index]
        if (!puoGiocare(cartaScelta, s.tableCard, s.currentColor)) {
            await m.reply(`⚠️ *MOSSA NON VALIDA*\nLa carta ${formattaCarta(cartaScelta)} non può essere giocata su ${formattaCarta(s.tableCard)}.`)
            return true
        }

        s.playerHand.splice(index, 1)
        s.tableCard = cartaScelta
        s.currentColor = cartaScelta.includes('Jolly') ? s.currentColor : cartaScelta.split(' ')[0]

        if (s.playerHand.length === 0) {
            delete unoSession[chat]
            await conn.sendMessage(chat, {
                text: `🎊 *COMPLIMENTI ${name.toUpperCase()}!* 🎊\nHai svuotato la mano e vinto la partita! 🏆`,
                interactiveButtons: playAgainButtons()
            }, { quoted: m })
            return true
        }

        let report = `✅ Hai giocato ${formattaCarta(cartaScelta)}.`

        if (cartaScelta.includes('+2')) {
            pescaCarte(s.mazzo, s.botHand, 2)
            report += `\n🎁 Hai dato un +2 al Bot!`
        } else if (cartaScelta.includes('+4')) {
            pescaCarte(s.mazzo, s.botHand, 4)
            report += `\n🔥 Hai dato un +4 al Bot!`
        }

        let bIdx = s.botHand.findIndex(c => puoGiocare(c, s.tableCard, s.currentColor))
        if (bIdx !== -1) {
            let cBot = s.botHand.splice(bIdx, 1)[0]
            s.tableCard = cBot
            s.currentColor = cBot.includes('Jolly') ? s.currentColor : cBot.split(' ')[0]
            report += `\n🤖 Il Bot gioca: ${formattaCarta(cBot)}`

            if (cBot.includes('+2')) {
                pescaCarte(s.mazzo, s.playerHand, 2)
                report += `\n⚠️ Ti becchi un +2 dal Bot!`
            } else if (cBot.includes('+4')) {
                pescaCarte(s.mazzo, s.playerHand, 4)
                report += `\n⚠️ Ti becchi un +4 dal Bot!`
            }
        } else {
            if (s.mazzo.length === 0) s.mazzo = creaMazzo()
            s.botHand.push(s.mazzo.shift())
            report += `\n🤖 Il Bot non ha carte e pesca.`
        }

        if (s.botHand.length === 0) {
            delete unoSession[chat]
            await conn.sendMessage(chat, {
                text: `${report}\n\n💀 *SCONFITTA!*\nIl Bot ha vinto la partita. Più fortuna la prossima volta!`,
                interactiveButtons: playAgainButtons()
            }, { quoted: m })
            return true
        }

        await conn.sendMessage(chat, {
            text: generaStato(s, name, report),
            interactiveButtons: gameButtons()
        }, { quoted: m })
        return true
    }
}

handler.help = ['uno']
handler.tags = ['giochi']
handler.command = /^(uno)$/i
handler.group = true

export default handler
