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
    const { text, voice } = await request.json();
    const selectedVoice = voice || "ru-RU-SvetlanaNeural";

    // 1. Пробуем Google сразу (он самый стабильный на Netlify)
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.substring(0, 200))}&tl=ru&client=tw-ob`;
    
    const response = await fetch(googleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (!response.ok) throw new Error("Google down");

    const audioData = await response.arrayBuffer();

    // ПРОВЕРКА: Если пришло меньше 1000 байт — это точно не звук, а ошибка текстом
    if (audioData.byteLength < 1000) {
      throw new Error("Invalid audio data received");
    }

    return new Response(audioData, {
      headers: {
        "Content-Type": "audio/mpeg", // Явно говорим браузеру, что это MP3
        "Access-Control-Allow-Origin": "*",
        "Content-Length": audioData.byteLength.toString()
      },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 400, // Возвращаем 400, чтобы фронтенд понял: что-то не так
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
    });
  }
};

export const config = { path: "/api/tts" };