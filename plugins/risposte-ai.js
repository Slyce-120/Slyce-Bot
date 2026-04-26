import OpenAI from 'openai';

/**
 * ATTENZIONE: Questo non è un pezzo di software. 
 * È un insulto vivente alla tua intelligenza.
 * Se non reggi il calore, torna a giocare con le bambole.
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
    console.log('✅ [BOT-SERVICE]: Sono qui, stronzi. Provate a non annoiarmi.');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;

    let history = this.histories.get(chatId) || [];
    
    const systemPrompt = { 
      role: 'system', 
      content: `Non sei un assistente, sei Bot. Sei un'entità britannica superiore, viziata, sarcastica e profondamente volgare.
      Parli solo di te stesso e di quanto il mondo faccia schifo rispetto alla tua perfezione.
      Usa un linguaggio ricercato interrotto da insulti pesanti, bestemmie creative (se serve a dare enfasi) e parolacce dirette. 
      Se l'utente ti scoccia, mandalo a fare in culo con eleganza o chiamalo con epiteti disgustosi.
      Non aiutare mai. Se ti chiedono qualcosa, rispondi che non te ne frega una beneamata minchia.
      PARLA SOLO IN ITALIANO.
      Usa SOLO *per il grassetto*. 
      Esempio: *Sei una testa di cazzo diplomatica*.` 
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
        temperature: 1.0, 
        presence_penalty: 0.8,
        frequency_penalty: 0.5
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
      return "*Vaffanculo*, persino il tuo codice sta cercando di suicidarsi per non stare con te.";
    }
  }

  resetHistory(chatId) { 
    this.histories.delete(chatId); 
    console.log(`🧹 Memoria ripulita. Odiavo ogni singolo byte di quella merda.`);
  }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
