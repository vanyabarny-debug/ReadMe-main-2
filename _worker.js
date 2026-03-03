export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle TTS API for POST /api/tts
    if (url.pathname === "/api/tts") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      try {
        const { text, voice } = await request.json();

        if (!text || typeof text !== "string" || !text.trim()) {
          return new Response(JSON.stringify({ error: "Text required" }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }

        const safeText = text.trim();
        // Используем voice из запроса (например, "ru-RU-SvetlanaNeural")
        const voiceName = voice || "en-US-AriaNeural";

        // Формируем SSML для Edge TTS
        const ssml = `\
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${voiceName.split('-')[0]}-${voiceName.split('-')[1]}">
  <voice name="${voiceName}">
    <prosody rate="0%" pitch="0%">
      ${escapeXml(safeText)}
    </prosody>
  </voice>
</speak>`;

        const EDGE_TTS_URL = 'https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4';

        const resp = await fetch(EDGE_TTS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/ssml+xml',
            'Accept': 'audio/webm;codecs=opus',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            'Origin': 'https://speech.platform.bing.com',
            'Referer': 'https://speech.platform.bing.com/',
          },
          body: ssml,
        });

        if (!resp.ok) {
          // Попробуем прочитать текст ошибки для диагностики
          let errorText = '';
          try {
            errorText = await resp.text();
          } catch (e) {}
          return new Response(
            JSON.stringify({ error: `Edge TTS error: ${resp.status}`, details: errorText }),
            {
              status: 502,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }

        const audioData = await resp.arrayBuffer();
        return new Response(audioData, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store",
          },
        });
      } catch (e) {
        return new Response(
          JSON.stringify({
            error: "TTS failed",
            details: e && e.message,
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    }

    // For everything else, serve static assets
    if (env.ASSETS && typeof env.ASSETS.fetch === "function") {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  },
};

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
