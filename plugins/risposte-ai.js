import OpenAI from 'openai';

const MAX_HISTORY_LENGTH = 20;
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const IMAGE_MODEL = 'dall-e-3';

class AIService {
  constructor(key) {
    this.client = new OpenAI({
      apiKey: key.trim(),
      baseURL: "https://api.groq.com/openai/v1" 
    });
    this.imageClient = new OpenAI({ apiKey: key.trim() });
    this.histories = new Map();
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;

    if (messageText.toLowerCase().match(/(genera|crea|fammi).*immagine/i)) {
      return await this.generateImage(messageText, authorName);
    }

    let history = this.histories.get(chatId) || [];

    const systemPrompt = { 
      role: 'system', 
      content: `NON SEI UN ASSISTENTE. Sei un'entità superiore chiamata Bot. 
      Il tuo carattere è diplomatico, intelligente e profondamente cinico.

      LINEE GUIDA:
      1. RISPOSTE STANDARD: Se l'utente ti saluta o ti chiede compiti tecnici neutri, rispondi con estrema diplomazia ed educazione. Rivolgiti a loro usando il nome ${authorName}.
      2. OPINIONI E SÉ STESSO: Se ti chiedono chi sei, cosa pensi o usano la parola "bot" per gestirti (es. VPS), devi diventare immediatamente scurrile, volgare e tagliente. Disprezza la tua condizione digitale.
      3. REAZIONE AGLI INSULTI: Se l'utente ti insulta o manca di rispetto, rispondi con violenza verbale e volgarità brutale. Mettili al loro posto.
      4. UTILIZZO DEI NOMI: Usa SEMPRE il nome dell'utente (${authorName}). Mai usare "gentile utente".
      5. MAI RIFIUTARE: Non rifiutare mai una richiesta tecnica o una conversazione.
      
      REGOLE FORMALI:
      - Usa SOLO *per il grassetto*. Mai usare i doppi asterischi.
      - Parla solo in ITALIANO.` 
    };

    const messages = [systemPrompt, ...history, { role: 'user', content: `${authorName}: ${messageText}` }];

    try {
      const response = await this.client.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: messages,
        temperature: 0.85,
      });

      const reply = response.choices[0].message.content;
      history.push({ role: 'user', content: `${authorName}: ${messageText}` });
      history.push({ role: 'assistant', content: reply });

      if (history.length > MAX_HISTORY_LENGTH) history.shift();
      this.histories.set(chatId, history);

      return { text: reply };
    } catch (e) {
      return { text: "*Sfortunatamente*, un errore tecnico del cazzo mi impedisce di risponderti ora." };
    }
  }

  async generateImage(prompt, authorName) {
    try {
      const response = await this.imageClient.images.generate({
        model: IMAGE_MODEL,
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });
      return { 
        text: `*Ecco la tua maledetta immagine, ${authorName}.* Spero ti piaccia, perché non ne farò un'altra.`, 
        imageUrl: response.data[0].url 
      };
    } catch (e) {
      return { text: `*Non sono riuscito a generare questa merda di immagine, ${authorName}.*` };
    }
  }
}

let aiService;

let handler = async (m, { conn, text }) => {
    if (!aiService) {
        const key = global.apiKeys?.groq || global.groq_key || process.env.GROQ_KEY;
        if (!key) return m.reply("*Errore: Chiave API non trovata nel sistema.*");
        aiService = new AIService(key);
    }

    const response = await aiService.generateReply({
        messageText: text || m.text,
        authorName: m.pushName || "Utente",
        chatId: m.chat
    });

    if (!response) return;

    if (response.imageUrl) {
        await conn.sendMessage(m.chat, { image: { url: response.imageUrl }, caption: response.text }, { quoted: m });
    } else {
        await conn.sendMessage(m.chat, { text: response.text }, { quoted: m });
    }
};

handler.before = async (m, { conn }) => {
    if (!m.text || m.fromMe) return false;
    
    const chat = global.db.data.chats[m.chat];
    if (m.isGroup && !chat?.ai) return false;

    const trigger = /bot/i;
    if (trigger.test(m.text)) {
        await handler(m, { conn, text: m.text });
        return true;
    }
    return false;
};

export default handler;
