"use client";
import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import { APP_URL } from "@/constants";
import Editor from '@monaco-editor/react'; 

interface Props {
    initialNote? : string,
    dynamic_id? : string
} 


export default function ClientPage({ initialNote, dynamic_id } : Props) {
    const [note, setNote] = useState<string>(initialNote || "");
    useEffect(() => {
        if (!dynamic_id || initialNote) return;

        async function fetchNote() {
            try {
                const res = await fetch(`${APP_URL}/notes/${dynamic_id}`);
                if (!res.ok) throw new Error("Failed to fetch note");

                const data = await res.json();
                setNote(data?.note || "");
            } catch (error) {
                console.error("Error fetching note:", error);
            }
        }

        fetchNote();
    }, [dynamic_id, initialNote]);

    const onChange  = (value: string | undefined) => {
        setNote(value || "")
    }

    const handleSubmit = async (event:React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const payload = { note, author: "string", identifier: dynamic_id };

            const res = await fetch(`${APP_URL}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save note");

            console.log("Note saved successfully");
        } catch (error) {
            console.error("Error saving note:", error);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Share Anywhere</h1>
            </header>
            <form onSubmit={handleSubmit}>
                {/* <TextArea note={note} setNote={setNote} /> */}
                <Editor height="500px" defaultLanguage="python" defaultValue={note} onChange={onChange} theme="vs-dark" />
                <button type="submit">Save Note</button>
            </form>
        </div>
    );
}
