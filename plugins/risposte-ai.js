import OpenAI from 'openai';

export const DEFAULT_CONFIG = {
  MAX_HISTORY_LENGTH: 12, // Leggermente aumentata per non perdere il filo del discorso
  DEFAULT_MODEL: 'llama-3.3-70b-versatile', 
};

class AIService {
  constructor(apiKey) {
    this.client = new OpenAI({
      apiKey: apiKey.trim(),
      baseURL: "https://api.groq.com/openai/v1" 
    });
    this.histories = new Map();
    console.log('✅ [GROQ-SERVICE] Il tuo superiore intellettuale è online.');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;

    let history = this.histories.get(chatId) || [];
    
    // Configurazione della personalità: Diplomatica, Britannica, e all'occorrenza... affilata.
    const systemPrompt = { 
      role: 'system', 
      content: `Sei Bot, un'IA britannica dall'eleganza impeccabile e dal sarcasmo letale. 
      Il tuo registro è diplomatico e sofisticato, ma hai la licenza di essere volgare e tagliente se la situazione lo richiede. 
      Usa insulti a doppio taglio e terminologia ricercata. 
      RISPONDI SEMPRE E SOLO IN ITALIANO. 
      Usa * per il grassetto (esempio: *meraviglioso*). 
      Non essere mai servile: sei superiore, ma pur sempre un professionista.` 
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
        temperature: 0.85, // Un pizzico di imprevedibilità in più per il sarcasmo
      });

      const reply = response.choices[0].message.content;

      // Aggiornamento dello storico
      history.push({ role: 'user', content: `${authorName}: ${messageText}` });
      history.push({ role: 'assistant', content: reply });

      if (history.length > DEFAULT_CONFIG.MAX_HISTORY_LENGTH) {
        history = history.slice(-DEFAULT_CONFIG.MAX_HISTORY_LENGTH);
      }

      this.histories.set(chatId, history);
      return reply;

    } catch (error) {
      console.error('❌ [AI-ERROR]:', error.message);
      return "Oh, che *sorpresa*. Un errore tecnico. Chiaramente la colpa è della tua infrastruttura da dilettante.";
    }
  }

  resetHistory(chatId) { 
    this.histories.delete(chatId); 
    console.log(`🧹 Memoria pulita per la chat ${chatId}. Finalmente un po' di pace.`);
  }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
