export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  if (url.pathname !== "/api/tts") {
    return new Response("Not found", { status: 404 });
  }

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
  const lang = typeof body?.lang === "string" ? body.lang : "en";

  if (!text) {
    return new Response(JSON.stringify({ error: "Text required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Map language to StreamElements voice (simple + works on Cloudflare runtime)
  let seVoice = "Brian";
  if (lang === "ru") seVoice = "Maxim";
  else if (lang === "en") seVoice = "Brian";
  else if (lang === "de") seVoice = "Marlene";
  else if (lang === "es") seVoice = "Mia";
  else if (lang === "fr") seVoice = "Celine";
  else if (lang === "ja") seVoice = "Takumi";

  const streamText = text.slice(0, 1000);
  const seUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(
    seVoice
  )}&text=${encodeURIComponent(streamText)}`;

  const seRes = await fetch(seUrl);
  if (!seRes.ok) {
    return new Response(JSON.stringify({ error: `StreamElements error: ${seRes.status}` }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const audio = await seRes.arrayBuffer();
  if (audio.byteLength < 100) {
    return new Response(JSON.stringify({ error: "Audio too short" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(audio, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}

