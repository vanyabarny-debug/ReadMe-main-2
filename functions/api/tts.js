// Cloudflare Worker для Microsoft Edge TTS
// Адаптировано из проекта: https://github.com/wzk2025/tts-voice-magic

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Настройки CORS
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Обработка preflight-запросов OPTIONS
    if (request.method === "OPTIONS") {
      return new Response(null, { 
        status: 204, 
        headers: corsHeaders 
      });
    }

    // Проверяем путь
    if (url.pathname !== "/api/tts") {
      return new Response("Not found", { status: 404 });
    }

    // Проверяем метод
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Парсим тело запроса
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text = typeof body?.text === "string" ? body.text.trim() : "";
    // Используем voice из запроса (тот самый SvetlanaNeural, AriaNeural и т.д.)
    const voice = typeof body?.voice === "string" ? body.voice : "en-US-AriaNeural";

    if (!text) {
      return new Response(JSON.stringify({ error: "Text required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      // Формируем SSML для Edge TTS
      const ssml = `\
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${voice.split('-')[0]}-${voice.split('-')[1]}">
  <voice name="${voice}">
    <prosody rate="0%" pitch="0%">
      ${escapeXml(text)}
    </prosody>
  </voice>
</speak>`;

      // Отправляем запрос к Microsoft Edge TTS
      const response = await fetch(
        "https://eastus.tts.speech.microsoft.com/cognitiveservices/v1",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Origin": "https://azure.microsoft.com",
          },
          body: ssml,
        }
      );

      if (!response.ok) {
        console.error(`Edge TTS error: ${response.status}`);
        return new Response(
          JSON.stringify({ error: `Edge TTS failed: ${response.status}` }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Получаем аудио и возвращаем клиенту
      const audioBuffer = await response.arrayBuffer();
      
      return new Response(audioBuffer, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "audio/mpeg",
          "Content-Length": audioBuffer.byteLength.toString(),
        },
      });

    } catch (error) {
      console.error("TTS error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  },
};

// Экранирование XML-спецсимволов
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}
