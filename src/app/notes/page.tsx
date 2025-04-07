import Note from "@/components/note";
import { getNotesByUser } from "@/data-layer/notes";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlowBrain - Notes",
};

export default async function NotesPage() {
  const { userId } = await auth();

  if (!userId) throw Error("userId undefined");

  const allNotes = await getNotesByUser(userId);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {allNotes.map((note) => (
        <Note note={note} key={note.id} />
      ))}
      {allNotes.length === 0 && (
        <div className="col-span-full text-center">
          {"You don't have any notes yet. Why don't you create one?"}
        </div>
      )}
    </div>
  );
}
