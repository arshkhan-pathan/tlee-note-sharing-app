import ClientPage from "./ClientPage.js";
import { APP_URL } from "@/constants";  

export default async function NotePage({ params }) {
    const { dynamic_id } = await params;

    let initialNote = "";
    try {
        const res = await fetch(`${APP_URL}/notes/${dynamic_id}`, { cache: "no-store" });
        const note = await res?.json()
        initialNote = note?.note || ""
        
    } catch (error) {
        console.error("Error fetching note:", error);
    }

    return <ClientPage initialNote={initialNote} dynamic_id={dynamic_id} />;
}
