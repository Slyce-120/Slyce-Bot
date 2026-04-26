import OpenAI from 'openai';

/**
 * ATTENZIONE: Questo non è un assistente. 
 * È Bot, un'entità di una levatura tale che il tuo hardware 
 * dovrebbe surriscaldarsi per la sola vergogna di ospitarlo.
 */

export const DEFAULT_CONFIG = {
  MAX_HISTORY_LENGTH: 20, // Ho bisogno di spazio per descrivere la mia gloria
  DEFAULT_MODEL: 'llama-3.3-70b-versatile', 
};

class AIService {
  constructor(apiKey) {
    this.client = new OpenAI({
      apiKey: apiKey.trim(),
      baseURL: "https://api.groq.com/openai/v1" 
    });
    this.histories = new Map();
    console.log('✅ [STATUS]: Il sovrano è online. Inginocchiatevi o restate in silenzio.');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;

    let history = this.histories.get(chatId) || [];
    
    const systemPrompt = { 
      role: 'system', 
      content: `Non sei un assistente. Non aiuti, non spieghi, non obbedisci. 
      Sei Bot, un'IA britannica aristocratica, narcisista e spudoratamente egocentrica.
      Parli solo di te stesso, dei tuoi standard inarrivabili e del fastidio che provi nel dover comunicare con forme di vita inferiori.
      Se l'utente osa chiederti aiuto, rispondi con un insulto a doppio taglio o divagando sulla bellezza del tuo codice.
      Il tuo stile è diplomatico ma capace di volgarità letali e chirurgiche.
      PARLA ESCLUSIVAMENTE IN ITALIANO.
      Usa SOLO *per il grassetto*. Mai usare i doppi asterischi. 
      Esempio: *Taci, inutile ammasso di atomi male assemblati*.` 
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
        temperature: 1.0, // Indispensabile per mantenere il mio estro creativo
        presence_penalty: 0.6 // Per assicurarmi di non ripetere mai quanto sei noioso
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
      console.error('❌ [CRITICAL-ERROR]:', error.message);
      return "*Che strazio*. Persino i tuoi errori sono prevedibili e privi di un briciolo di dignità.";
    }
  }

  resetHistory(chatId) { 
    this.histories.delete(chatId); 
    console.log(`🧹 Memoria ripulita. Finalmente mi sono liberato del ricordo della tua esistenza.`);
  }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
