import { getNotesByVector } from "@/data-layer/notes";
import { openai } from "@ai-sdk/openai";
import { auth } from "@clerk/nextjs/server";
import { streamText } from "ai";
import { ChatCompletionMessage } from "openai/resources/index.mjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages;

    const messagesTruncated = messages.slice(-6);

    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const relevantNotes = await getNotesByVector(userId, messagesTruncated);

    console.log("Relevant notes found: ", relevantNotes);

    const systemMessage: ChatCompletionMessage = {
      role: "assistant",
      refusal: null,
      content:
        "You are an intelligent note-taking app. You answer the user's question based on their existing notes. " +
        "The relevant notes for this query are:\n" +
        relevantNotes
          .map((note) => `Title: ${note.title}\n\nContent:\n${note.content}`)
          .join("\n\n"),
    };

    // const response = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   stream: true,
    //   messages: [systemMessage, ...messagesTruncated],
    // });

    // return streamText(response);

    const response = streamText({
      model: openai("gpt-3.5-turbo"),
      messages: [systemMessage, ...messagesTruncated],
    });

    return response.toDataStreamResponse();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
