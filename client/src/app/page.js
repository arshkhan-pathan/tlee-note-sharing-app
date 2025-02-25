'use client';
import styles from './styles/Home.module.css';
import TextArea from "@/components/TextArea";

export default function Home() {
    return (<div className={styles.container}>
        <header className={styles.header}>
            <h1>Share Anywhere</h1>
        </header>

        <TextArea/>
    </div>);
}
