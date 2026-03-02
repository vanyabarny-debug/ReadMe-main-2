import express from "express";
import { createServer as createViteServer } from "vite";
import * as googleTTS from 'google-tts-api';
import https from 'https';
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to fetch audio buffer from URL
  const fetchAudioBuffer = (url: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      https.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000
      }, (res) => {
        if (res.statusCode !== 200) {
            res.resume();
            return reject(new Error(`Status ${res.statusCode}`));
        }
        const chunks: Buffer[] = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    });
  };

  const getEdgeVoice = (lang: string) => {
    switch (lang) {
      case 'ru': return 'ru-RU-SvetlanaNeural';
      case 'en': return 'en-US-AriaNeural';
      case 'uk': return 'uk-UA-PolinaNeural';
      case 'de': return 'de-DE-KatjaNeural';
      case 'fr': return 'fr-FR-DeniseNeural';
      case 'es': return 'es-ES-ElviraNeural';
      case 'it': return 'it-IT-ElsaNeural';
      case 'ja': return 'ja-JP-NanamiNeural';
      case 'ko': return 'ko-KR-SunHiNeural';
      case 'zh': return 'zh-CN-XiaoxiaoNeural';
      default: return 'en-US-AriaNeural';
    }
  };

  app.post("/api/tts", async (req, res) => {
    const { text, lang, voice } = req.body;
    if (!text) return res.status(400).json({ error: "Text required" });

    const safeText = String(text);
    const targetLang = String(lang || 'en');
    const requestedVoice = voice ? String(voice) : null;

    console.log(`Processing TTS (POST): ${safeText.slice(0, 20)}... [${targetLang}] ${requestedVoice ? `(${requestedVoice})` : ''}`);

    // 1. Try Microsoft Edge TTS (Highest Quality)
    try {
      const tts = new MsEdgeTTS();
      const voiceToUse = requestedVoice || getEdgeVoice(targetLang);
      await tts.setMetadata(voiceToUse, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      
      // Split text into chunks if too long (Edge TTS has limits per request)
      // Limit is roughly 2000-3000 chars per request to be safe.
      const MAX_CHUNK_LENGTH = 2500;
      const textChunks: string[] = [];
      
      if (safeText.length > MAX_CHUNK_LENGTH) {
          // Split by sentences or punctuation to avoid cutting words
          const sentences = safeText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [safeText];
          let currentChunk = '';
          
          for (const sentence of sentences) {
              if ((currentChunk + sentence).length > MAX_CHUNK_LENGTH) {
                  textChunks.push(currentChunk);
                  currentChunk = sentence;
              } else {
                  currentChunk += sentence;
              }
          }
          if (currentChunk) textChunks.push(currentChunk);
      } else {
          textChunks.push(safeText);
      }

      console.log(`Edge TTS: Processing ${textChunks.length} chunks...`);

      const allAudioBuffers: Buffer[] = [];

      for (const chunk of textChunks) {
          if (!chunk.trim()) continue;
          
          const stream = tts.toStream(chunk);
          const chunks: Buffer[] = [];
          
          await new Promise((resolve, reject) => {
            stream.audioStream.on('data', (c) => chunks.push(c));
            stream.audioStream.on('end', resolve);
            stream.audioStream.on('error', reject);
            stream.audioStream.on('close', resolve);
          });
          
          if (chunks.length > 0) {
              allAudioBuffers.push(Buffer.concat(chunks));
          }
      }

      const finalBuffer = Buffer.concat(allAudioBuffers);

      if (finalBuffer.length > 100) {
        console.log(`Served via Edge TTS (${voiceToUse}, ${textChunks.length} chunks)`);
        res.setHeader("Content-Type", "audio/mpeg");
        return res.send(finalBuffer);
      }
    } catch (e) {
      console.error("Edge TTS failed:", e);
    }

    try {
        // 2. Try Google TTS API (Robust splitting & URL generation)
        // This library handles token generation and text splitting automatically
        const urls = googleTTS.getAllAudioUrls(safeText, {
            lang: targetLang,
            slow: false,
            host: 'https://translate.google.com',
        });

        // Fetch all audio segments in parallel
        const buffers = await Promise.all(urls.map(u => fetchAudioBuffer(u.url)));
        
        // Concatenate buffers
        const combinedBuffer = Buffer.concat(buffers);

        if (combinedBuffer.length > 100) {
            console.log(`Served via Google TTS API (${buffers.length} segments)`);
            res.setHeader("Content-Type", "audio/mpeg");
            return res.send(combinedBuffer);
        }
    } catch (e) {
        console.error("Google TTS API failed:", e);
    }

    // 3. Fallback to StreamElements (Single request, good for short/medium text)
    try {
        let voice = 'Brian'; 
        if (targetLang === 'ru') voice = 'Maxim';
        else if (targetLang === 'en') voice = 'Brian';
        else if (targetLang === 'de') voice = 'Marlene';
        else if (targetLang === 'es') voice = 'Mia';
        else if (targetLang === 'fr') voice = 'Celine';
        else if (targetLang === 'ja') voice = 'Takumi';

        // StreamElements handles longer text reasonably well, but let's truncate to be safe if it's huge
        const streamText = safeText.slice(0, 1000); 
        const url = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(streamText)}`;
        
        const buffer = await fetchAudioBuffer(url);
        if (buffer.length > 100) {
            console.log("Served via StreamElements Fallback");
            res.setHeader("Content-Type", "audio/mpeg");
            return res.send(buffer);
        }
    } catch (e) {
        console.error("StreamElements failed:", e);
    }

    res.status(500).json({ error: "All TTS providers failed" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
