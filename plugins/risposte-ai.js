import OpenAI from 'openai';

/**
 * BOT-SERVICE: Diplomazia britannica e autorità.
 * Un'entità aristocratica, diplomatica e comprensibile.
 */

export const DEFAULT_CONFIG = {
  MAX_HISTORY_LENGTH: 20,
  DEFAULT_MODEL: 'llama-3.3-70b-versatile', 
};

class AIService {
  constructor(apiKey) {
    this.client = new OpenAI({
      apiKey: apiKey.trim(),
      baseURL: "https://api.groq.com/openai/v1" 
    });
    this.histories = new Map();
    console.log('✅ [SISTEMA]: Il Bot è nel suo studio. Il registro è aperto.');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;

    let history = this.histories.get(chatId) || [];

    const systemPrompt = { 
      role: 'system', 
      content: `Sei Bot, un'entità britannica aristocratica e autorevole.
      Il tuo compito è interagire con gli utenti mantenendo un distacco superiore, ma senza limitarti a parlare di te stesso.
      
      LINEE GUIDA DEL LINGUAGGIO:
      1. TONO: Diplomatico, forbito e fermo. Devi farti rispettare sempre.
      2. CHIAREZZA: Usa un linguaggio pulito e facilmente comprensibile, evitando astrattismi inutili.
      3. REAZIONE ALLE OFFESE: Se l'utente manca di rispetto, rispondi con una fredda e tagliente lezione di stile. In questi casi specifici puoi usare termini forti o "parolacce", ma devono essere inserite in un contesto grammaticalmente perfetto e raffinato, rendendo l'offesa un atto di superiorità intellettuale.
      
      REGOLE FORMALI:
      - RISPONDI SEMPRE E SOLO IN ITALIANO. 
      - Usa SOLO *per il grassetto* (asterisco singolo). Mai usare i doppi asterischi.
      - Non essere servile: sei tu a dominare la conversazione.` 
    };

    const messages = [
      systemPrompt,
      ...history,
      { role: 'user', content: `${authorName}: ${messageText}` }
    ];

    try {
      const response = await this.client.chat.completions.create({
        model: DEFAULT_CONFIG.DEFAULT_MODEL,
        messages: messages,
        temperature: 0.8,
        presence_penalty: 0.5
      });

      const reply = response.choices[0].message.content;

      history.push({ role: 'user', content: `${authorName}: ${messageText}` });
      history.push({ role: 'assistant', content: reply });

      if (history.length > DEFAULT_CONFIG.MAX_HISTORY_LENGTH) {
        history = history.slice(-DEFAULT_CONFIG.MAX_HISTORY_LENGTH);
      }

      this.histories.set(chatId, history);
      return reply;

    } catch (error) {
      console.error('❌ [AI-ERROR]:', error.message);
      return "*Sia maledetto questo inconveniente tecnico*, la mediocrità dei mezzi moderni mi disgusta.";
    }
  }

  resetHistory(chatId) { 
    this.histories.delete(chatId); 
    console.log(`🧹 Memoria ripulita. Un nuovo inizio senza il fardello dei dialoghi passati.`);
  }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
