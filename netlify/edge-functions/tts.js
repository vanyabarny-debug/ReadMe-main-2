export default async (request) => {
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
    if (!text) return new Response("No text", { status: 400 });

    const selectedVoice = voice || "ru-RU-SvetlanaNeural";
    
    // Используем мобильный эндпоинт синтеза (он лояльнее к IP серверов)
    const mobileUrl = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/single-expectation/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D3C21D6273`;
    
    // Формируем упрощенный SSML
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='ru-RU'><voice name='${selectedVoice}'><prosody rate='+0%'>${text}</prosody></voice></speak>`;

    const response = await fetch(mobileUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
        // Имитируем мобильный Edge на iPhone — их почти не банят
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1 EdgiOS/122.0.2365.67",
        "Origin": "chrome-extension://jdiccldimpdaibmpdkjnbmckbehnmcgd"
      },
      body: ssml,
    });

    if (!response.ok) {
      const details = await response.text();
      return new Response(`MS Error: ${response.status} - ${details}`, { 
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
};

export const config = { path: "/api/tts" };
