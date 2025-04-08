import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

export async function getEmbedding(text: string) {
  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: text,
  });

  if (!embedding) throw Error("Error generating embedding.");

  console.log(embedding);

  return embedding;
}
