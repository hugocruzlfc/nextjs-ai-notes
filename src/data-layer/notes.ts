import prisma from "@/lib/prisma";
import "server-only";

export async function createNote(
  title: string,
  userId: string,
  content?: string,
) {
  return prisma.note.create({
    data: {
      title,
      content,
      userId,
    },
  });
}
