export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle TTS API for POST /api/tts
    if (url.pathname === "/api/tts") {
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" },
        });
      }

      try {
        const { text, lang, voice } = await request.json();

        if (!text || typeof text !== "string" || !text.trim()) {
          return new Response(JSON.stringify({ error: "Text required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const safeText = text.trim();
        const targetLang = (lang || "en").toString();

        // Map language to StreamElements voice
        let seVoice = "Brian";
        if (targetLang === "ru") seVoice = "Maxim";
        else if (targetLang === "en") seVoice = "Brian";
        else if (targetLang === "de") seVoice = "Marlene";
        else if (targetLang === "es") seVoice = "Mia";
        else if (targetLang === "fr") seVoice = "Celine";
        else if (targetLang === "ja") seVoice = "Takumi";

        const streamText = safeText.slice(0, 1000);
        const seUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(
          seVoice
        )}&text=${encodeURIComponent(streamText)}`;

        const seRes = await fetch(seUrl);

        if (!seRes.ok) {
          return new Response(
            JSON.stringify({ error: `StreamElements error: ${seRes.status}` }),
            {
              status: 502,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const audioArrayBuffer = await seRes.arrayBuffer();

        if (audioArrayBuffer.byteLength < 100) {
          return new Response(JSON.stringify({ error: "Audio too short" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(audioArrayBuffer, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
          },
        });
      } catch (e) {
        return new Response(
          JSON.stringify({
            error: "TTS failed",
            details: e && e.message,
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // For everything else, serve static assets as before
    if (env.ASSETS && typeof env.ASSETS.fetch === "function") {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not found", { status: 404 });
  },
};

