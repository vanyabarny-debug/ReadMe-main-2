export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

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
  const voice = typeof body?.voice === "string" ? body.voice : "en-US-AriaNeural";

  if (!text) {
    return new Response(JSON.stringify({ error: "Text required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Эндпоинт Edge TTS (не требует ключа)
  const EDGE_TTS_ENDPOINT = "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4";

  const escapeXml = (unsafe) => {
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
  };

  const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${voice.split('-')[0]}-${voice.split('-')[1]}">
  <voice name="${voice}">
    <prosody rate="0%" pitch="0%">
      ${escapeXml(text)}
    </prosody>
  </voice>
</speak>`;

  try {
    const response = await fetch(EDGE_TTS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/ssml+xml",
        "Accept": "audio/webm;codecs=opus", // Edge возвращает Opus в WebM
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
        "Origin": "https://speech.platform.bing.com",
        "Referer": "https://speech.platform.bing.com/",
      },
      body: ssml,
    });

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

    // Получаем аудио (WebM с Opus). Клиент ожидает MP3? В вашем клиенте тип не проверяется, просто blob.
    // Можно оставить как есть, браузер умеет играть WebM. Или можно конвертировать, но сложно.
    // Если нужен именно MP3, можно использовать другой эндпоинт, возвращающий MP3.
    // Для простоты оставим WebM, клиент должен принять.
    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": response.headers.get("Content-Type") || "audio/webm",
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
}
