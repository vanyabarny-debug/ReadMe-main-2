export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.endsWith('/tts')) {
      // Обработка CORS
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
        
        const edgeUrl = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/single-expectation/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D3C21D6273`;
        
        // Обязательно передаем корректный SSML
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
          const errorText = await response.text();
          return new Response(JSON.stringify({ error: "Microsoft API error", details: errorText }), { 
            status: 502, 
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
          });
        }

        const audioData = await response.arrayBuffer();

        // Если данных слишком мало, значит пришла не музыка/голос, а ошибка
        if (audioData.byteLength < 100) {
          return new Response(JSON.stringify({ error: "Audio data is too small" }), { status: 500 });
        }

        return new Response(audioData, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Access-Control-Allow-Origin": "*",
            "Content-Length": audioData.byteLength.toString()
          },
        });

      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { 
          status: 500,
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
