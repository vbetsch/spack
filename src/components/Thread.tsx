import React, { useEffect, useState } from "react";
import { Tag } from "./Tag.tsx";
import type { ThreadDocument } from "../types/documents/ThreadDocument.ts";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../database/firebase.ts";
import { DatabaseCollectionEnum } from "../types/DatabaseCollectionEnum.ts";
import type { PostDocument } from "../types/documents/PostDocument.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faHeart } from "@fortawesome/free-regular-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";

interface ThreadProperties {
    data: ThreadDocument;
}

export const Thread = ({ data }: ThreadProperties): React.ReactNode => {
    const [post, setPost] = useState<PostDocument | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);

    const getPost = async (): Promise<void> => {
        setLoading(true);
        const postSnap = await getDoc(
            doc(db, DatabaseCollectionEnum.POSTS, data.post.id),
        );
        const postData = postSnap.data() as PostDocument;
        if (postData != null) {
            setPost(postData);
        }
        setLoading(false);
    };

    useEffect(() => {
        getPost().catch(console.error);
    }, []);

    return (
        <div className="thread">
            <div className="thread-left">
                <div className="counter">
                    <span className="text">
                        <span>{post?.nbLikes != null ? post.nbLikes : 0}</span>
                    </span>
                    <div className="icon">
                        <FontAwesomeIcon icon={faHeart as IconProp} />
                    </div>
                </div>
                <div className="counter">
                    <span className="text">
                        {post?.bookmarks != null ? post.bookmarks.length : 0}
                    </span>
                    <div className="icon">
                        <FontAwesomeIcon icon={faBookmark as IconProp} />
                    </div>
                </div>
            </div>
            <div className="thread-right">
                <span className="title">{data.title}</span>
                <p className="content">
                    {loading && "Loading..."}
                    {post?.content}
                </p>
                <div className="tags">
                    {data.tags.length > 0 &&
                        data.tags.map((tag, key) => (
                            <Tag key={key} name={tag} />
                        ))}
                </div>
            </div>
        </div>
    );
};