export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  }

  try {
    const { text, voice } = await request.json();
    const selectedVoice = voice || "ru-RU-SvetlanaNeural";
    
    // Прямой вызов мобильного API через GET (его сложнее забанить)
    const ttsUrl = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/single-expectation/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D3C21D6273`;
    
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='ru-RU'><voice name='${selectedVoice}'><prosody rate='+0%'>${text}</prosody></voice></speak>`;

    const response = await fetch(ttsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
        // Имитируем запрос от Edge на Android — это самая "слабая" зона их защиты
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36 EdgA/122.0.2365.62",
      },
      body: ssml,
    });

    if (!response.ok) {
       // Если опять бан — переключаемся на Google "на лету"
       const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ru&client=tw-ob`;
       const gRes = await fetch(googleUrl);
       return new Response(await gRes.arrayBuffer(), {
         headers: { "Content-Type": "audio/mpeg", "Access-Control-Allow-Origin": "*" }
       });
    }

    return new Response(await response.arrayBuffer(), {
      headers: { "Content-Type": "audio/mpeg", "Access-Control-Allow-Origin": "*" }
    });

  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
};
