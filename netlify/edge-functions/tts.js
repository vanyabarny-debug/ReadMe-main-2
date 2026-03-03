export default async (request) => {
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
    const endpoint = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/single-expectation/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D3C21D6273`;
    
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='ru-RU'><voice name='${voice || "ru-RU-SvetlanaNeural"}'><prosody rate='+0%'>${text}</prosody></voice></speak>`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0",
      },
      body: ssml,
    });

    if (!response.ok) throw new Error("Microsoft rejected");

    const data = await response.arrayBuffer();
    return new Response(data, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
};

export const config = { path: "/api/tts" };