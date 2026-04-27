import { createCanvas } from 'canvas'

// ... (tieni le funzioni generaGrafica, creaMazzo, puoGiocare e botTurno di prima) ...

let handler = async (m, { conn }) => {
    let chat = m.chat
    // ... (inizializzazione sessione gioco) ...

    let img = await generaGrafica(unoSession[chat])

    // PREPARAZIONE MEDIA
    const uploadedImg = await conn.prepareMessageMedia(img, { upload: conn.waUploadToServer })

    // FORMATO TEMPLATE (L'unico che iPhone non può ignorare)
    const message = {
        templateMessage: {
            hydratedTemplate: {
                imageMessage: uploadedImg.imageMessage,
                hydratedContentText: `🃏 *UNO MATCH*\n🎨 Colore: *${unoSession[chat].currentColor}*`,
                hydratedFooterText: '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
                hydratedButtons: [
                    { index: 1, urlButton: { displayText: 'Sito BLD', url: 'https://google.com' } }, // Obbligatorio a volte per triggerare il template
                    { index: 2, quickReplyButton: { displayText: '📥 PESCA', id: 'pesca' } },
                    { index: 3, quickReplyButton: { displayText: '🛑 FINE', id: 'enduno' } }
                ]
            }
        }
    }

    await conn.relayMessage(chat, message, { quoted: m })
}

handler.before = async (m, { conn }) => {
    let chat = m.chat
    let s = unoSession[chat]
    if (!s || s.player !== m.sender) return

    let msgText = ""
    
    // Gestione specifica per TemplateButtonReply (Visto nel tuo log)
    if (m.message?.templateButtonReplyMessage) {
        msgText = m.message.templateButtonReplyMessage.selectedId
    } else {
        msgText = (m.text || "").trim().toLowerCase()
    }

    if (msgText === 'pesca') {
        // ... (logica pesca)
    } else if (!isNaN(parseInt(msgText))) {
        // ... (logica numeri)
    }
    
    // INVIO AGGIORNAMENTO (Sempre via Template)
    // Usa la stessa struttura relayMessage usata sopra
}

handler.command = /^(uno)$/i
export default handler
