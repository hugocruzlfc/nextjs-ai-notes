import "server-only";

import { getEmbedding } from "@/lib/openai";
import { notesIndex } from "@/lib/pinecone";
import prisma from "@/lib/prisma";
import { CoreMessage } from "ai";

async function getEmbeddingForNote(title: string, content: string | undefined) {
  return getEmbedding(`${title}\n\n${content || ""}`);
}

export async function createNoteTsx(
  title: string,
  userId: string,
  content?: string,
) {
  const embedding = await getEmbeddingForNote(title, content);

  return await prisma.$transaction(async (tx) => {
    const note = await tx.note.create({
      data: {
        title,
        content,
        userId,
      },
    });

    await notesIndex.upsert([
      {
        id: note.id,
        values: embedding,
        metadata: { userId },
      },
    ]);

    return note;
  });
}

export async function findNoteById(id: string) {
  return prisma.note.findUnique({ where: { id } });
}

export async function updateNoteTsx(
  id: string,
  title: string,
  userId: string,
  content?: string,
) {
  const embedding = await getEmbeddingForNote(title, content);

  return await prisma.$transaction(async (tx) => {
    const updatedNote = await tx.note.update({
      where: { id },
      data: {
        title,
        content,
      },
    });

    await notesIndex.upsert([
      {
        id,
        values: embedding,
        metadata: { userId },
      },
    ]);

    return updatedNote;
  });
}

export async function deleteNoteTsx(id: string) {
  return await prisma.$transaction(async (tx) => {
    await tx.note.delete({ where: { id } });
    await notesIndex.deleteOne(id);
  });
}

export async function getNotesByUser(userId: string) {
  return prisma.note.findMany({ where: { userId } });
}

export async function getNotesByVector(
  userId: string,
  messages: CoreMessage[],
) {
  const embedding = await getEmbedding(
    messages.map((message) => message.content).join("\n"),
  );

  const vectorQueryResponse = await notesIndex.query({
    vector: embedding,
    topK: 4,
    filter: { userId },
  });

  return await prisma.note.findMany({
    where: {
      id: {
        in: vectorQueryResponse.matches.map((match) => match.id),
      },
    },
  });
}
