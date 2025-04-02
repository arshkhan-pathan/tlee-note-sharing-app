"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "../styles/Home.module.css";
import { APP_URL, CURRENT_HOST } from "@/constants";
import Editor from "@monaco-editor/react";
import spinner from "@/components/spinner.gif";
import Image from "next/image";

interface Props {
    initialNote?: string;
    dynamic_id?: string;
}

export default function ClientPage({ initialNote = "", dynamic_id }: Props) {
    const [note, setNote] = useState<string>(initialNote);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);



    const handleSubmit = useCallback(async (newNote:string) => {
        try {
            const payload = { note: newNote, author: "string", identifier: dynamic_id };

            const res = await fetch(`${APP_URL}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save note");
            console.log("Note saved successfully");
        } catch (error) {
            console.error("Error saving note:", error);
        } finally {
            setIsSyncing(false);
        }
    }, [dynamic_id]);

    const onChange = useCallback((value: string | undefined) => {
        setNote(value || "");
        setIsSyncing(true);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            handleSubmit(value || "" );
        }, 2000);
    }, [handleSubmit, note]);

    // Cleanup debounce timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>{`${CURRENT_HOST}/${dynamic_id}`}</h1>
                {isSyncing && <Image src={spinner} alt="Saving..." width={50} height={50} style={{position: "absolute", left : "70px"}} />}
            </header>
            <Editor 
                height="500px" 
                defaultLanguage="python" 
                value={note} 
                onChange={onChange}
                theme="vs-dark" 
            />
        </div>
    );
}