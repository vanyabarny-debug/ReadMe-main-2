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
        
        const edgeUrl = 'https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/single-expectation/v1?TrustedClientToken=5A2E9ADD-CD31-4B9F-8461-AD672199F920';
        
        // Самый простой формат SSML без лишних оберток
        const ssml = `<speak version='1.0' xml:lang='ru-RU'><voice name='${selectedVoice}'><prosody pitch='+0Hz' rate='+0%' volume='+0%'>${text}</prosody></voice></speak>`;

        const response = await fetch(edgeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
          },
          body: ssml,
        });

        if (!response.ok) {
          const err = await response.text();
          return new Response(`MS Error: ${response.status} - ${err}`, { 
            status: 502, 
            headers: { "Access-Control-Allow-Origin": "*" } 
          });
        }

        return new Response(await response.arrayBuffer(), {
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
