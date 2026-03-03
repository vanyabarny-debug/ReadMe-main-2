export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.endsWith('/tts')) return env.ASSETS.fetch(request);

    try {
      // Пытаемся вытащить текст из POST или из параметров строки
      let text, voice;
      if (request.method === "POST") {
        const body = await request.json();
        text = body.text;
        voice = body.voice;
      } else {
        text = url.searchParams.get("text");
        voice = url.searchParams.get("voice");
      }

      const selectedVoice = voice || "ru-RU-SvetlanaNeural";
      
      // Используем альтернативный эндпоинт, который иногда проглатывает запросы от Cloudflare
      const edgeUrl = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/single-expectation/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D3C21D6273`;
      
      const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='ru-RU'><voice name='${selectedVoice}'><prosody rate='+0%'>${text}</prosody></voice></speak>`;

      const response = await fetch(edgeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 EdgiOS/117.0.2045.65"
        },
        body: ssml
      });

      if (!response.ok) throw new Error(`Status: ${response.status}`);

      return new Response(await response.arrayBuffer(), {
        headers: { "Content-Type": "audio/mpeg", "Access-Control-Allow-Origin": "*" }
      });
    } catch (e) {
      return new Response(e.message, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
  }
};
