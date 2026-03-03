export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.endsWith('/tts')) return env.ASSETS.fetch(request);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    try {
      const { text, voice } = await request.json();
      
      // Используем другой API эндпоинт (Cognitive Services), он стабильнее
      const ttsUrl = `https://eastus.tts.speech.microsoft.com/cognitiveservices/v1`;
      
      // Токен для этого метода не нужен, если имитировать заголовки Edge правильно
      // Но мы используем проверенный публичный ключ Edge
      const tokenUrl = "https://edge.microsoft.com/compute/ms-tts/token";
      const tokenRes = await fetch(tokenUrl);
      const token = await tokenRes.text();

      const ssml = `<speak version='1.0' xml:lang='ru-RU'><voice name='${voice || "ru-RU-SvetlanaNeural"}'><prosody rate='0%'>${text}</prosody></voice></speak>`;

      const response = await fetch(ttsUrl, {
        method: "POST",
        headers: {
          "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
          "Content-Type": "application/ssml+xml",
          "Authorization": `Bearer ${token}`,
          "User-Agent": "Mozilla/5.0"
        },
        body: ssml
      });

      if (!response.ok) {
        throw new Error(`MS API Status: ${response.status}`);
      }

      const audio = await response.arrayBuffer();
      return new Response(audio, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Access-Control-Allow-Origin": "*"
        }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { 
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  }
};
