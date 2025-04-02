import ClientPage from "./ClientPage";
import {APP_URL, BACKEND_URL} from "@/constants";
import type { Metadata, ResolvingMetadata } from "next";

interface NotePageProps {
  params: Promise<{ dynamic_id: string }>;
}

export async function generateMetadata(
  { params }: NotePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { dynamic_id } = await params;
  return {
    title: "Note" + " -> " + dynamic_id,
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const { dynamic_id } = await params;
  console.log("APP_URL", APP_URL);
  console.log("BACKEND_URL", BACKEND_URL);

  let initialNote = "";

  try {
    const res = await fetch(`${BACKEND_URL}/notes/${dynamic_id}`, {
      cache: "no-store",
    });
    console.log("url to hiit", `${BACKEND_URL}/notes/${dynamic_id}`)
    console.log("res",res)

    if (res.ok) {
      const data = await res.json();
      initialNote = data?.note || "";
    } else {
      console.error("Failed to fetch note:", res.statusText);
    }
  } catch (error) {
    console.error("Error fetching note:", error);
  }

  return <ClientPage initialNote={initialNote} dynamic_id={dynamic_id} />;
}