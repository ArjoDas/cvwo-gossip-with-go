import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface CreatePostModalProps {
    open: boolean;
    onClose: () => void;
    onPostCreated: () => void;
}

interface Topic {
    ID: number;
    Title: string;
}

export default function CreatePostModal({ open, onClose, onPostCreated }: CreatePostModalProps) {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [topicId, setTopicId] = useState(''); // State for selected topic
    const [topics, setTopics] = useState<Topic[]>([]); // State for list of topics
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState(false);

    // Fetch topics when modal opens
    useEffect(() => {
        if (open) {
            setAuthError(false);
            api.get('/topics')
                .then(res => setTopics(res.data.topics))
                .catch(err => console.error("Failed to load topics", err));
        }
    }, [open]);

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setAuthError(true);
            return;
        }

        setLoading(true);
        try {
            await api.post('/posts', 
                { 
                    title, 
                    body, 
                    TopicID: Number(topicId) // Send the chosen TopicID
                }
            );
            
            setTitle('');
            setBody('');
            setTopicId('');
            onPostCreated();
            onClose();
        } catch (err) {
            console.error("Failed to create post", err);
            alert("Failed to create post.");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm">
            <div
                className="max-w-lg w-full mx-4 rounded-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                        Create New Post
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition"
                    >
                        ✕
                    </button>
                </div>

                <div className="px-5 py-4 space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-sm border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-transparent"
                            placeholder="What's on your mind?"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
                            Topic
                        </label>
                        <select
                            value={topicId}
                            onChange={(e) => setTopicId(e.target.value)}
                            className="w-full rounded-sm border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-transparent"
                        >
                            <option value="" disabled>
                                Select a topic
                            </option>
                            {topics.map((topic) => (
                                <option key={topic.ID} value={topic.ID}>
                                    {topic.Title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
                            Body
                        </label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={4}
                            className="w-full rounded-sm border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-transparent resize-y"
                            placeholder="Share the details..."
                        />
                    </div>

                    {authError && (
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-sm border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800/50 px-3 py-2 text-[11px] font-medium text-stone-600 dark:text-stone-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                            <span>You must be logged in to share a post.</span>
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    navigate('/login');
                                }}
                                className="underline underline-offset-4 hover:text-sky-600"
                            >
                                Login
                            </button>
                        </div>
                    )}
                </div>

                <div className="px-5 py-3 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-sm px-4 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-full px-4 py-1.5 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition"
                    >
                        {loading ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </div>
        </div>
    );
}