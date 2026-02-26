import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Comment {
    ID: number;
    Body: string;
    User: { Username: string };
    UserID: number; // needed to check ownership
}

interface Post {
    ID: number;
    Title: string;
    Body: string;
    User: { Username: string };
    UserID: number; // needed to check ownership
    Comments: Comment[];
}

export default function PostDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    
    // we get the current user ID from the token (a bit hacky, but fast)
    // in a real app, we'd store the user object in Context
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
        parseUserFromToken();
    }, [id]);

    const parseUserFromToken = () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            // JWT is "header.payload.signature"
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);
            setCurrentUserId(payload.sub); // 'sub' is usually the ID in standard JWTs
        } catch (e) {
            console.error("Failed to parse token");
        }
    };

    const fetchData = async () => {
        try {
            // request both in parallel
            const [postRes, commentsRes] = await Promise.all([
                api.get(`/posts/${id}`),
                api.get(`/posts/${id}/comments`)
            ]);

            setPost(postRes.data.post);
            setComments(commentsRes.data.comments);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load data", err);
            navigate('/');
        }
    };

    // --- POST ACTIONS ---
    const handleDeletePost = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await api.delete(`/posts/${id}`);
            navigate('/');
        } catch (err) { alert("Failed to delete post"); }
    };

    const handleEditPost = async () => {
        if (!post) return;
        const newTitle = prompt("Edit Title:", post.Title);
        const newBody = prompt("Edit Body:", post.Body);
        
        if (newTitle === null || newBody === null) return; // User cancelled

        try {
            await api.put(`/posts/${id}`, 
                { title: newTitle, body: newBody }
            );
            fetchData(); // refresh UI
        } catch (err) { alert("Failed to edit post"); }
    };

    // --- COMMENT ACTIONS ---
    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;
        try {
            await api.post(`/posts/${id}/comments`, 
                { body: newComment }
            );
            setNewComment('');
            fetchData(); 
        } catch (err) { alert("Failed to post comment"); }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!confirm("Delete comment?")) return;
        try {
            await api.delete(`/comments/${commentId}`);
            fetchData();
        } catch (err) { alert("Failed to delete comment"); }
    };

    const handleEditComment = async (comment: Comment) => {
        const newBody = prompt("Edit Comment:", comment.Body);
        if (newBody === null) return;

        try {
            await api.put(`/comments/${comment.ID}`, 
                { body: newBody }
            );
            fetchData();
        } catch (err) { alert("Failed to edit comment"); }
    };

    if (loading || !post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-stone-300 border-t-sky-500 animate-spin" />
            </div>
        );
    }

    const isOwner = currentUserId === post.UserID;

    return (
        <div className="min-h-screen">
            <main className="max-w-3xl mx-auto px-4 py-6">
                <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="mb-4 inline-flex items-center text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition"
                >
                    <span className="mr-1">&larr;</span> Back to Feed
                </button>

                {/* MAIN POST CARD */}
                <article className="mb-6 rounded-sm border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-50">
                                {post.Title}
                            </h1>
                            <p className="mt-1 text-xs text-stone-500">
                                Posted by @{post.User?.Username || 'Unknown'}
                            </p>
                        </div>
                        {isOwner && (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleEditPost}
                                    className="inline-flex items-center rounded-full border border-stone-200 dark:border-stone-700 px-3 py-1 text-xs font-medium text-stone-700 dark:text-stone-200 bg-white/70 dark:bg-stone-900/80 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeletePost}
                                    className="inline-flex items-center rounded-full border border-rose-200/80 bg-rose-50/80 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                        {post.Body}
                    </p>
                </article>

                <div className="h-px w-full bg-stone-200 dark:bg-stone-800 mb-6" />

                {/* COMMENTS SECTION */}
                <section>
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50 mb-3">
                        Discussion
                    </h2>

                    <div className="mb-5 flex flex-col sm:flex-row gap-3">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 min-h-[60px] rounded-sm border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-transparent resize-y"
                        />
                        <button
                            type="button"
                            onClick={handleSubmitComment}
                            className="self-end sm:self-center rounded-full bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 text-xs font-semibold shadow-sm transition"
                        >
                            Post
                        </button>
                    </div>

                    {comments.length === 0 ? (
                        <p className="text-sm text-stone-500">No comments yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {comments.map((comment) => (
                                <div
                                    key={comment.ID}
                                    className="flex items-start justify-between gap-3 rounded-sm border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-3 py-2.5 shadow-sm"
                                >
                                    <div>
                                        <p className="text-xs font-semibold text-sky-700 dark:text-sky-300">
                                            @{comment.User?.Username}
                                        </p>
                                        <p className="mt-1 text-sm text-stone-700 dark:text-stone-200">
                                            {comment.Body}
                                        </p>
                                    </div>
                                    {currentUserId === comment.UserID && (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleEditComment(comment)}
                                                className="text-[11px] font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteComment(comment.ID)}
                                                className="text-[11px] font-medium text-rose-500 hover:text-rose-600 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}