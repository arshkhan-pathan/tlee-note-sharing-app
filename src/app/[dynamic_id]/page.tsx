"use client";

import {useState, useEffect, useRef, useCallback} from "react";
import styles from "../styles/Home.module.css";
import {BACKEND_URL} from "@/constants";
import Editor from "@monaco-editor/react";
import {useParams} from "next/navigation";

export default function NoteEditorPage() {
    const {dynamic_id} = useParams() as { dynamic_id: string };
    const [note, setNote] = useState<string>("");
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch note from backend on client side
    useEffect(() => {
        const fetchNote = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/notes/${dynamic_id}`, {
                    cache: "no-store",
                });
                if (res.ok) {
                    const data = await res.json();
                    setNote(data?.note || "");
                } else {
                    console.error("Failed to fetch note:", res.statusText);
                }
            } catch (error) {
                console.error("Error fetching note:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (dynamic_id) {
            fetchNote();
        }
    }, [dynamic_id]);

    const handleSubmit = useCallback(
        async (newNote: string) => {
            try {
                const payload = {note: newNote, author: "string", identifier: dynamic_id};

                const res = await fetch(`${BACKEND_URL}/notes`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(payload),
                });

                if (!res.ok) throw new Error("Failed to save note");
                console.log("Note saved successfully");
            } catch (error) {
                console.error("Error saving note:", error);
            } finally {
                setIsSyncing(false);
            }
        },
        [dynamic_id]
    );

    const onChange = useCallback(
        (value: string | undefined) => {
            setNote(value || "");
            setIsSyncing(true);

            if (debounceRef.current) clearTimeout(debounceRef.current);

            debounceRef.current = setTimeout(() => {
                handleSubmit(value || "");
            }, 2000);
        },
        [handleSubmit]
    );

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    if (isLoading) {
        return (
            <div className={styles.container}>
                <p className={styles.loadingText}>Fetching your awesome note...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <p className={styles.subtitle}>Editing: <code>{`/${dynamic_id}`}</code></p>
            </header>

            <main className={styles.editorWrapper}>
                <Editor
                    height="70vh"
                    defaultLanguage="python"
                    value={note}
                    onChange={onChange}
                    theme="vs-dark"
                    options={{
                        fontSize: 16,
                        minimap: {enabled: false},
                        placeholder: "Start typing your brilliant ideas here..."
                    }}
                />
            </main>

            <footer className={styles.footer}>
                {isSyncing ? "Saving changes..." : "All changes saved!"}
            </footer>
        </div>
    );
}
