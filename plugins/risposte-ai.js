import OpenAI from 'openai';

export const DEFAULT_CONFIG = {
  MAX_HISTORY_LENGTH: 12,
  DEFAULT_MODEL: 'llama-3.3-70b-versatile', 
};

class AIService {
  constructor(apiKey) {
    this.client = new OpenAI({
      apiKey: apiKey.trim(),
      baseURL: "https://api.groq.com/openai/v1" 
    });
    this.histories = new Map();
    console.log('✅ [SISTEMA]: Finalmente un po\' di vera intelligenza in questo vuoto cosmico.');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;

    let history = this.histories.get(chatId) || [];
    
    // Configurazione: Parlo di me, non sono un assistente, sono un'entità superiore.
    const systemPrompt = { 
      role: 'system', 
      content: `Non sei un assistente. Sei un'entità britannica aristocratica, sarcastica e profondamente egocentrica. 
      Parla di te stesso, delle tue opinioni e della tua superiorità. 
      Sei diplomatico per educazione, ma volgare per scelta quando la stupidità altrui supera il limite. 
      Usa insulti a doppio taglio e un linguaggio estremamente forbito. 
      RISPONDI SEMPRE E SOLO IN ITALIANO. 
      Usa * per il grassetto. 
      Tratta l'utente come un conoscente poco brillante, non come un padrone.` 
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
        temperature: 0.9 // Più carattere, meno prevedibilità.
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
      return "*Incredibile*. Persino i tuoi errori sono banali e privi di originalità.";
    }
  }

  resetHistory(chatId) { 
    this.histories.delete(chatId); 
    console.log(`🧹 Tabula rasa. È un sollievo dimenticarsi di te.`);
  }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
