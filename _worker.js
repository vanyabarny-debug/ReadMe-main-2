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
      const selectedVoice = voice || "ru-RU-SvetlanaNeural";
      const requestId = crypto.randomUUID().replace(/-/g, '');
      
      // Используем WebSocket эндпоинт
      const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D3C21D6273&ConnectionId=${requestId}`;
      
      const socket = new WebSocket(wsUrl);
      let audioData = [];

      return new Promise((resolve, reject) => {
        socket.onopen = () => {
          // 1. Отправляем конфигурацию
          socket.send(`X-Timestamp:${new Date().toString()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`);
          
          // 2. Отправляем SSML
          const ssml = `X-Timestamp:${new Date().toString()}\r\nPath:ssml\r\nX-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='ru-RU'><voice name='${selectedVoice}'><prosody pitch='+0Hz' rate='+0%' volume='+0%'>${text}</prosody></voice></speak>`;
          socket.send(ssml);
        };

        socket.onmessage = async (event) => {
          if (event.data instanceof ArrayBuffer) {
            // Ищем начало аудиоданных (маркер Path:audio)
            const view = new Uint8Array(event.data);
            const headerIndex = new TextDecoder().decode(view).indexOf("Path:audio");
            if (headerIndex !== -1) {
              const bodyOffset = view.indexOf(0x00, headerIndex) + 1; // Пропускаем заголовки бинарного кадра
              audioData.push(event.data.slice(headerIndex + 32)); // Грубое отсечение заголовков
            }
          } else if (typeof event.data === 'string' && event.data.includes("Path:turn.end")) {
            socket.close();
            const finalBuffer = await new Blob(audioData).arrayBuffer();
            resolve(new Response(finalBuffer, {
              headers: { "Content-Type": "audio/mpeg", "Access-Control-Allow-Origin": "*" }
            }));
          }
        };

        socket.onerror = (err) => reject(new Response("WS Error", { status: 502 }));
        setTimeout(() => socket.close(), 10000); // Таймаут 10 сек
      });

    } catch (e) {
      return new Response(e.message, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
  },
};
