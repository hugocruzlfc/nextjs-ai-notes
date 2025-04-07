import { API_URL } from "@/lib/constants";
import { createNoteSchema, CreateNoteSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Note } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

interface HookProps {
  setOpen: (open: boolean) => void;
  setDeleteInProgress: (deleteInProgress: boolean) => void;
  noteToEdit?: Note;
}
export function useNoteEditor({
  setOpen,
  setDeleteInProgress,
  noteToEdit,
}: HookProps) {
  const router = useRouter();

  const form = useForm<CreateNoteSchema>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      title: noteToEdit?.title || "",
      content: noteToEdit?.content || "",
    },
  });

  async function onSubmit(input: CreateNoteSchema) {
    try {
      if (noteToEdit) {
        const response = await fetch(API_URL.NOTES, {
          method: "PUT",
          body: JSON.stringify({
            id: noteToEdit.id,
            ...input,
          }),
        });
        if (!response.ok) throw Error("Status code: " + response.status);
      } else {
        const response = await fetch(API_URL.NOTES, {
          method: "POST",
          body: JSON.stringify(input),
        });
        if (!response.ok) throw Error("Status code: " + response.status);
        form.reset();
      }
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  }

  async function deleteNote() {
    if (!noteToEdit) return;
    setDeleteInProgress(true);
    try {
      const response = await fetch("/api/notes", {
        method: "DELETE",
        body: JSON.stringify({
          id: noteToEdit.id,
        }),
      });
      if (!response.ok) throw Error("Status code: " + response.status);
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setDeleteInProgress(false);
    }
  }

  return {
    form,
    onSubmit,
    deleteNote,
  };
}
