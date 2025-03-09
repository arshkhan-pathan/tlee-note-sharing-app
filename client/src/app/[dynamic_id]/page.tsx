import ClientPage from "./ClientPage";
import { APP_URL } from "@/constants";

export default async function NotePage({
  params,
}: {
  params: Promise<{ dynamic_id: string }>;
}) {
  const { dynamic_id } = await params;

  let initialNote : string = "";
  try {
    const res = await fetch(`${APP_URL}/notes/${dynamic_id}`, {
      cache: "no-store",
    });
    const note = await res?.json() || {};
    initialNote = note?.note || "";
  } catch (error) {
    console.error("Error fetching note:", error);
  }

  return <ClientPage initialNote={initialNote} dynamic_id={dynamic_id} />;
}
