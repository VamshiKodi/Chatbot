import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { requireAuth } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

const MODEL = 'gemini-2.0-flash';

const SYSTEM_PROMPT =
  'You are a helpful AI assistant in a chat application. Be concise, friendly, and helpful.';

const MOCK_RESPONSE =
  'This is a mock AI response. Add GEMINI_API_KEY to the backend .env to get real AI responses.';

// Map stored messages to the Gemini API format
const toApiMessages = (messages) =>
  messages.map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

// Streaming chat endpoint (Server-Sent Events).
// Emits `data: {"delta": "..."}` chunks and a final `data: {"done": true}` line.
router.post('/chat', requireAuth, async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // Set up the SSE stream
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

  // No API key configured: stream the mock response so the UI behaves identically
  if (!genAI) {
    send({ delta: MOCK_RESPONSE });
    send({ done: true });
    return res.end();
  }

  // If the client disconnects mid-response, stop generating
  const controller = new AbortController();
  req.on('close', () => controller.abort());

  // Open the stream, retrying a couple of times on transient overload (503/429)
  const openStream = async () => {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await genAI.models.generateContentStream({
          model: MODEL,
          contents: toApiMessages(messages),
          config: {
            systemInstruction: SYSTEM_PROMPT,
            maxOutputTokens: 16000,
            abortSignal: controller.signal,
          },
        });
      } catch (error) {
        const transient = error?.status === 503 || error?.status === 429;
        if (!transient || attempt === maxAttempts || controller.signal.aborted) {
          throw error;
        }
        // Exponential backoff: 1s, 2s
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }
  };

  try {
    const stream = await openStream();

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) send({ delta: text });
    }

    send({ done: true });
    res.end();
  } catch (error) {
    // Aborting on client disconnect is expected; nothing to report
    if (controller.signal.aborted) return;

    // Headers are already sent, so surface the error inside the SSE stream
    if (error?.status === 429) {
      send({ error: 'AI service is rate limited, please try again shortly' });
    } else if (error?.status === 503) {
      send({ error: 'AI service is busy right now, please try again in a moment' });
    } else {
      console.error('Error in chat stream:', error);
      send({ error: 'AI service error, please try again' });
    }
    res.end();
  }
});

export default router;
