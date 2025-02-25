import React from "react";

export default function TextArea({ note, setNote }) {
    return (
        <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write your note here..."
            rows={6}
            style={{
                width: "100%",
                padding: "10px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                resize: "none",
            }}
        />
    );
}