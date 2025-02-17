// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// Importa el método serve del estándar de Deno para HTTP
import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
// Importa la librería de ElevenLabs desde esm.sh (asegúrate de usar la versión correcta)
import { ElevenLabsClient } from "https://esm.sh/elevenlabs@latest";

// Obtén la API key desde las variables de entorno de Supabase Edge (configuradas como secrets)
const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
if (!ELEVENLABS_API_KEY) {
  throw new Error("Missing ELEVENLABS_API_KEY in environment variables");
}
// Crea la instancia del cliente
const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});
// Función que genera el audio a partir del texto y la voz solicitada
export async function createAudioStreamFromText(
  text: string,
  voice: string
): Promise<Uint8Array> {
  // Llama al método generate del cliente
  const audioStream = await client.generate({
    voice: voice ?? "Matilda",
    model_id: "eleven_turbo_v2_5",
    text: text ?? "Hola texto para pruebas en eleven labs",
  });
  const chunks: Uint8Array[] = [];
  // Acumula los chunks del stream
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }
  // Calcula el tamaño total
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}
// Handler del Edge Function
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  // Solo aceptar método POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }
  // Extrae el JSON de la solicitud
  let body: { text?: string; voice?: string };
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { text, voice } = body;
  if (!text || !voice) {
    return new Response(JSON.stringify({ error: "Missing parameters" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    // Genera el audio
    const audioData = await createAudioStreamFromText(text, voice);
    // Retorna la respuesta con el audio generado (Content-Type audio/mpeg)
    return new Response(audioData, {
      headers: { ...corsHeaders, "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    console.error("Error generando audio:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});


