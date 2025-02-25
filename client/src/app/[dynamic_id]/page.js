import ServerPage from "./serverPage";
import { APP_URL } from "@/constants"; // Import the client component

export default async function NotePage({ params }) {
    const { dynamic_id } = await params;

    let initialNote = "";
    try {
        const res = await fetch(`${APP_URL}/${dynamic_id}`, { cache: "no-store" });
        if (res.ok) {
            const data = await res.json();
            initialNote = data?.note || "";
        }
    } catch (error) {
        console.error("Error fetching note:", error);
    }

    return <ServerPage initialNote={initialNote} dynamic_id={dynamic_id} />;
}
