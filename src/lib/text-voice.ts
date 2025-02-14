import * as dotenv from "dotenv";
import { ElevenLabsClient } from "elevenlabs";
dotenv.config();
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
  throw new Error("Missing ELEVENLABS_API_KEY in environment variables");
}
const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});
export const createAudioStreamFromText = async (
  text: string,
  voice: string
): Promise<Buffer> => {
  const audioStream = await client.generate({
    voice: voice,
    model_id: "eleven_turbo_v2_5",
    text,
  });
  const chunks: Buffer[] = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }
  const content = Buffer.concat(chunks);
  return content;
};
