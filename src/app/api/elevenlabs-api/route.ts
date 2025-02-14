// app/api/elevenlabs-api/route.ts
import { NextResponse } from "next/server";
import { createAudioStreamFromText } from "../../../lib/text-voice";

export async function POST(request: Request) {
  try {
    const { text, voice } = await request.json();
    if (!text) {
      return NextResponse.json(
        { error: 'El parámetro "text" es requerido' },
        { status: 400 }
      );
    }

    // Llamamos a la función que genera el audio y nos devuelve un Buffer
    const audioBuffer = await createAudioStreamFromText(text, voice);

    // Convertimos el Buffer a una cadena en base64
    const base64Audio = audioBuffer.toString("base64");

    // Creamos una data URL que puede ser usada directamente en el elemento <audio>
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    return NextResponse.json({ audioDataUrl });
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Error interno del servidor";
    console.error("Error generando audio:", error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
