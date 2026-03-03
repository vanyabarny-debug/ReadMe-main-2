export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.endsWith('/tts')) {
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
        const selectedVoice = voice || "ru-RU-SvetlanaNeural";
        
        // Новый токен и URL, который сложнее забанить
        const edgeUrl = 'https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/single-expectation/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D3C21D6273';
        
        const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='ru-RU'><voice name='${selectedVoice}'><prosody pitch='+0Hz' rate='+0%' volume='+0%'>${text}</prosody></voice></speak>`;

        const response = await fetch(edgeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
            // Имитируем запрос от официального расширения
            "Origin": "chrome-extension://jdiccldimpdaibmpdkjnbmckbehnmcgd",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edge/120.0.0.0"
          },
          body: ssml,
        });

        if (!response.ok) {
          const errText = await response.text();
          // Пробрасываем ошибку для отладки
          return new Response(`MS Error: ${response.status} - ${errText}`, { 
            status: 502, 
            headers: { "Access-Control-Allow-Origin": "*" } 
          });
        }

        const audioData = await response.arrayBuffer();
        return new Response(audioData, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Access-Control-Allow-Origin": "*",
          },
        });

      } catch (e) {
        return new Response(e.message, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
