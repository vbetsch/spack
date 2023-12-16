import React, { useContext, useEffect, useState } from "react";
import { Tag } from "./Tag.tsx";
import type { ThreadDocument } from "../types/documents/ThreadDocument.ts";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../database/firebase.ts";
import { DatabaseCollectionEnum } from "../types/DatabaseCollectionEnum.ts";
import type { PostDocument } from "../types/documents/PostDocument.ts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBookmark as faBookmarkRegular,
    faHeart as faHeartRegular,
} from "@fortawesome/free-regular-svg-icons";
import {
    faBookmark as faBookmarkSolid,
    faHeart as faHeartSolid,
} from "@fortawesome/free-solid-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { AuthContext } from "../providers/AuthProvider.tsx";
import { AuthActionEnum } from "../reducers/AuthReducer.ts";
import { useNavigate } from "react-router";
import type { AuthUser } from "../types/AuthUserType.ts";

interface ThreadProperties {
    data: ThreadDocument;
}

export const Thread = ({ data }: ThreadProperties): React.ReactNode => {
    const userData = localStorage.getItem("@user");
    const { state, dispatch } = useContext(AuthContext);
    const [post, setPost] = useState<PostDocument | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [likeType, setLikeType] = useState<IconProp>(faHeartRegular);
    const [bookmarkType, setBookmarkType] =
        useState<IconProp>(faBookmarkRegular);
    const navigate = useNavigate();

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

    const setNbLikes = async (newValue: number): Promise<void> => {
        if (post != null) {
            await setDoc(doc(db, DatabaseCollectionEnum.POSTS, data.post.id), {
                ...post,
                nbLikes: newValue,
            });
        }
        if (state.currentUser != null) {
            if (userData != null) {
                const user: AuthUser = JSON.parse(userData);
                if (state.currentUser.likedPosts == null) {
                    await setDoc(
                        doc(
                            db,
                            DatabaseCollectionEnum.USERS,
                            user.uid.toString(),
                        ),
                        {
                            ...state.currentUser,
                            likedPosts: [post],
                        },
                    );
                } else {
                    await setDoc(
                        doc(
                            db,
                            DatabaseCollectionEnum.USERS,
                            user.uid.toString(),
                        ),
                        {
                            ...state.currentUser,
                            likedPosts: [...state.currentUser.likedPosts, post],
                        },
                    );
                }
            }
        }
    };

    const toggleLike = (): void => {
        if (state.currentUser == null) {
            navigate("/login");
        } else {
            if (post == null) {
                return;
            }
            setLoading(true);
            if (likeType === faHeartRegular) {
                setLikeType(faHeartSolid);
                setNbLikes(post.nbLikes + 1).catch(console.error);
                dispatch({
                    type: AuthActionEnum.LIKE,
                    payload: post,
                });
            } else {
                setLikeType(faHeartRegular);
                setNbLikes(post.nbLikes - 1).catch(console.error);
            }
            setLoading(false);
        }
    };

    const toggleSave = (): void => {
        if (state.currentUser == null) {
            navigate("/login");
        } else {
            if (bookmarkType === faBookmarkRegular) {
                setBookmarkType(faBookmarkSolid);
            } else {
                setBookmarkType(faBookmarkRegular);
            }
        }
    };

    useEffect(() => {
        getPost()
            .finally(() => {
                if (post != null && state.currentUser?.likedPosts != null) {
                    state.currentUser.likedPosts.forEach((postDoc) => {
                        if (postDoc.id === post.id) {
                            setLikeType(faHeartSolid);
                        }
                    });
                }
            })
            .catch(console.error);
    }, [likeType, bookmarkType]);

    return (
        <div className="thread">
            <div className="thread-left">
                <div onClick={toggleLike} className="counter">
                    <span className="text">
                        <span>{post?.nbLikes != null ? post.nbLikes : 0}</span>
                    </span>
                    <div className="icon">
                        <FontAwesomeIcon icon={likeType} />
                    </div>
                </div>
                <div onClick={toggleSave} className="counter">
                    <span className="text">
                        {post?.bookmarks != null ? post.bookmarks.length : 0}
                    </span>
                    <div className="icon">
                        <FontAwesomeIcon icon={bookmarkType} />
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
