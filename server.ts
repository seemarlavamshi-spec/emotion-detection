import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy initialization helper for Gemini
let genAI: GoogleGenerativeAI | null = null;
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!genAI) {
    // Check for missing key or placeholder
    const isPlaceholder = !apiKey || ['MY_GEMINI_API_KEY', 'YOUR_GEMINI_API_KEY', 'ENTER_API_KEY_HERE'].includes(apiKey.trim());
    
    if (isPlaceholder) {
      console.warn('Warning: GEMINI_API_KEY is missing or a placeholder. Running in MOCK mode.');
      return null;
    }

    if (apiKey.length < 20) {
      console.warn('Warning: GEMINI_API_KEY appears invalid. Running in MOCK mode.');
      return null;
    }

    genAI = new GoogleGenerativeAI(apiKey.trim());
  }
  return genAI;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      const ai = getGenAI();
      
      if (!ai) {
        // Mock response
        return res.json({ 
          text: `[DEMO MODE] This is a mock response because GEMINI_API_KEY is not configured. To enable real AI support, add your API key in the Secrets panel.\n\nYou said: "${message}"`,
          isMock: true
        });
      }

      const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      const chat = model.startChat({
        history: history || [],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      res.json({ text: response.text() });
    } catch (error) {
      console.error('Gemini Chat Error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate response' });
    }
  });

  app.post('/api/analyze-emotion', async (req, res) => {
    try {
      const { text } = req.body;
      const ai = getGenAI();
      
      if (!ai) {
        // Mock analysis based on keywords
        const lower = text.toLowerCase();
        let emotion = 'neutral';
        if (lower.includes('happy') || lower.includes('good') || lower.includes('great') || lower.includes('joy')) emotion = 'happy';
        else if (lower.includes('sad') || lower.includes('lonely') || lower.includes('cry') || lower.includes('unhappy')) emotion = 'sad';
        else if (lower.includes('angry') || lower.includes('mad') || lower.includes('hate') || lower.includes('annoyed')) emotion = 'angry';
        else if (lower.includes('depress') || lower.includes('hopeless') || lower.includes('gloomy')) emotion = 'depression';
        else if (lower.includes('anxiety') || lower.includes('anxious') || lower.includes('worry') || lower.includes('fear') || lower.includes('panic')) emotion = 'anxiety';
        else if (lower.includes('tire') || lower.includes('exhaust') || lower.includes('sleepy') || lower.includes('fatigue')) emotion = 'tiredness';
        else if (lower.includes('hungr') || lower.includes('food') || lower.includes('starv')) emotion = 'hungry';
        else if (lower.includes('stress') || lower.includes('work') || lower.includes('deadline')) emotion = 'stressed';

        return res.json({ emotion, confidence: 0.7, explanation: "Detected via local keyword analysis (Mock Mode)", isMock: true });
      }

      const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      const prompt = `Analyze the following text for emotional content and return a JSON object with "emotion" (one of: happy, sad, angry, depression, anxiety, tiredness, hungry, stressed, neutral), "confidence" (0-1), and "explanation".
      
      Text: "${text}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let resultText = response.text();
      
      // Basic JSON extraction
      const jsonMatch = resultText.match(/\{.*\}/s);
      if (jsonMatch) {
        res.json(JSON.parse(jsonMatch[0]));
      } else {
        res.json({ emotion: 'neutral', confidence: 0.5, explanation: 'Could not detect specific emotion' });
      }
    } catch (error) {
      console.error('Emotion Analysis Error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to analyze emotion' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
