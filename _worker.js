export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Обрабатываем только запросы на /api/tts
    if (url.pathname === "/api/tts") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }

      try {
        const { text, voice } = await request.json();
        
        // Прямой запрос к API Microsoft Edge TTS
        const edgeUrl = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/single-expectation/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D3C21D6273`;
        
        const ssml = `<speak version='1.0' xml:lang='en-US'><voice name='${voice}'><prosody pitch='+0Hz' rate='+0%' volume='+0%'>${text}</prosody></voice></speak>`;

        const response = await fetch(edgeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
          },
          body: ssml,
        });

        if (!response.ok) {
          return new Response(`Edge TTS Error: ${response.status}`, { status: response.status });
        }

        const audioData = await response.arrayBuffer();
        return new Response(audioData, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Access-Control-Allow-Origin": "*",
          },
        });

      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { 
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
    }

    // Если это не API, отдаем статику (сам сайт)
    return env.ASSETS.fetch(request);
  },
};
