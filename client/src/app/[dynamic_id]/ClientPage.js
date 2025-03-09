"use client";
import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import { APP_URL } from "@/constants";
import Editor from '@monaco-editor/react';

console.log("APP_URL", APP_URL)
export default function ClientPage({ initialNote, dynamic_id }) {
    const [note, setNote] = useState(initialNote || "");
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

    const onChange  = (e) => {
        setNote(e)
    }

    const handleSubmit = async (event) => {
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
