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

export async function findNoteById(id: string) {
  return prisma.note.findUnique({ where: { id } });
}

export async function updateNote(id: string, title: string, content?: string) {
  return prisma.note.update({
    where: { id },
    data: {
      title,
      content,
    },
  });
}

export async function deleteNote(id: string) {
  return prisma.note.delete({ where: { id } });
}

export async function getNotesByUser(userId: string) {
  return prisma.note.findMany({ where: { userId } });
}
