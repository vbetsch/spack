import React, { useEffect, useState } from "react";
import { Title } from "../Title.tsx";
import type { ThreadDocument } from "../../types/documents/ThreadDocument.ts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../database/firebase.ts";
import { DatabaseCollectionEnum } from "../../types/DatabaseCollectionEnum.ts";
import { Thread } from "../Thread.tsx";

export const ThreadsPage = (): React.ReactNode => {
    const [threads, setThreads] = useState<ThreadDocument[] | undefined>(
        undefined,
    );

    const getAllThreads = async (): Promise<void> => {
        const querySnapshot = await getDocs(
            collection(db, DatabaseCollectionEnum.THREADS),
        );
        const threads: ThreadDocument[] = [];
        querySnapshot.forEach((doc) => {
            threads.push(doc.data() as ThreadDocument);
        });
        if (threads.length > 0) {
            setThreads(threads);
        }
    };

    useEffect(() => {
        getAllThreads().catch(console.error);
    }, []);

    return (
        <div className="container">
            <Title text={"All posts"} />
            <div className="threads">
                {threads?.map((thread, key) => (
                    <Thread key={key} data={thread} />
                ))}
            </div>
        </div>
    );
};
