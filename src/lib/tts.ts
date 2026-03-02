import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { getAllAudioUrls } from 'google-tts-api';
import https from 'https';

// --- Edge TTS ---

const EDGE_WS_URL = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const EDGE_HEADERS = {
    'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36 Edg/103.0.1264.62'
};

const EDGE_VOICES: Record<string, string> = {
    'ru': 'ru-RU-DmitryNeural',
    'en': 'en-US-GuyNeural',
    'de': 'de-DE-ConradNeural',
    'es': 'es-ES-AlvaroNeural',
    'fr': 'fr-FR-HenriNeural',
    'ja': 'ja-JP-KeitaNeural'
};

export async function getEdgeTTS(text: string, lang: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(EDGE_WS_URL, { headers: EDGE_HEADERS });
        const requestId = uuidv4().replace(/-/g, '');
        const chunks: Buffer[] = [];

        const voice = EDGE_VOICES[lang] || EDGE_VOICES['en'];
        const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${lang}'><voice name='Microsoft Server Speech Text to Speech Voice (${voice})'>${text}</voice></speak>`;

        ws.on('open', () => {
            // Send Config
            const config = {
                context: {
                    synthesis: {
                        audio: {
                            metadataoptions: {
                                sentenceBoundaryEnabled: "false",
                                wordBoundaryEnabled: "false"
                            },
                            outputFormat: "audio-24khz-48kbitrate-mono-mp3"
                        }
                    }
                }
            };
            ws.send(`X-Timestamp:${new Date().toString()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n${JSON.stringify(config)}`);

            // Send SSML
            ws.send(`X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${new Date().toString()}\r\nPath:ssml\r\n\r\n${ssml}`);
        });

        ws.on('message', (data, isBinary) => {
            if (!isBinary) {
                const textData = data.toString();
                if (textData.includes('Path:turn.end')) {
                    ws.close();
                }
                return;
            }

            const buffer = data as Buffer;
            const headerSize = buffer.readUInt16BE(0);
            const headers = buffer.slice(2, 2 + headerSize).toString();

            if (headers.includes('Path:audio')) {
                const audioData = buffer.slice(2 + headerSize);
                chunks.push(audioData);
            }
        });

        ws.on('close', () => {
            if (chunks.length > 0) {
                resolve(Buffer.concat(chunks));
            } else {
                reject(new Error('Edge TTS closed without audio'));
            }
        });

        ws.on('error', (err) => {
            reject(err);
        });
    });
}

// --- Google TTS (Improved) ---

const fetchAudioBuffer = (url: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://translate.google.com/'
            },
            timeout: 10000
        }, (res) => {
            if (res.statusCode !== 200) {
                res.resume();
                return reject(new Error(`Status ${res.statusCode}`));
            }
            const chunks: Buffer[] = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
};

export async function getGoogleTTS(text: string, lang: string): Promise<Buffer> {
    const urls = getAllAudioUrls(text, {
        lang: lang,
        slow: false,
        host: 'https://translate.google.com',
    });

    // Sequential fetch to be polite
    const buffers: Buffer[] = [];
    for (const u of urls) {
        try {
            const buffer = await fetchAudioBuffer(u.url);
            buffers.push(buffer);
            // Small delay
            await new Promise(r => setTimeout(r, 100));
        } catch (err) {
            console.error(`Failed to fetch segment from Google: ${u.url}`, err);
            // Continue? Or fail? Let's try to continue if possible, but usually one failure ruins the file.
            // Let's throw to trigger fallback.
            throw err;
        }
    }
    
    return Buffer.concat(buffers);
}

// --- StreamElements TTS ---

export async function getStreamElementsTTS(text: string, lang: string): Promise<Buffer> {
    let voice = 'Brian'; 
    if (lang === 'ru') voice = 'Maxim';
    else if (lang === 'en') voice = 'Brian';
    else if (lang === 'de') voice = 'Marlene';
    else if (lang === 'es') voice = 'Mia';
    else if (lang === 'fr') voice = 'Celine';
    else if (lang === 'ja') voice = 'Takumi';

    const streamText = text.slice(0, 2000); // Limit
    const url = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(streamText)}`;
    
    return fetchAudioBuffer(url);
}
