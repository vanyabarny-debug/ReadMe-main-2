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
    const body = await request.json();
    const { text, voice } = body;
    const selectedVoice = voice || "ru-RU-SvetlanaNeural";

    // Пробуем Microsoft через мобильный API
    const msUrl = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/single-expectation/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D3C21D6273`;
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='ru-RU'><voice name='${selectedVoice}'><prosody rate='+0%'>${text}</prosody></voice></speak>`;

    const msRes = await fetch(msUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/117.0.2045.65"
      },
      body: ssml
    });

    if (msRes.ok) {
      const data = await msRes.arrayBuffer();
      return new Response(data, { headers: { "Content-Type": "audio/mpeg", "Access-Control-Allow-Origin": "*" } });
    }

    // ЕСЛИ MICROSOFT СДОХ — ГУГЛ СПАСАЕТ (чтобы не было 500 ошибки)
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ru&client=tw-ob`;
    const gRes = await fetch(googleUrl);
    const gData = await gRes.arrayBuffer();
    
    return new Response(gData, {
      headers: { "Content-Type": "audio/mpeg", "Access-Control-Allow-Origin": "*" }
    });

  } catch (e) {
    // Крайний случай — возвращаем ошибку текстом, чтобы видеть в консоли
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 200, // Возвращаем 200, но с ошибкой в JSON, чтобы не ломать фронт
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
    });
  }
};

export const config = { path: "/api/tts" };