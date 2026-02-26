import { useEffect, useState } from 'react';
import api from '../services/api';

interface Topic {
    ID: number;
    Title: string;
    Description: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function TopicManagerModal({ open, onClose }: Props) {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [newTopic, setNewTopic] = useState('');

    useEffect(() => {
        if (open) fetchTopics();
    }, [open]);

    const fetchTopics = async () => {
        const res = await api.get('/topics');
        setTopics(res.data.topics);
    };

    const handleCreate = async () => {
        if (!newTopic) return;
        const slug = newTopic.toLowerCase().replace(/ /g, '-');
        try {
            await api.post('/topics', 
                { title: newTopic, slug, description: "User Created" }
            );
            setNewTopic('');
            fetchTopics();
        } catch (e) { alert("Failed to create"); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete topic?")) return;
        try {
            await api.delete(`/topics/${id}`);
            fetchTopics();
        } catch (e) { alert("Failed to delete (Topic might have posts attached)"); }
    };

    const handleEdit = async (topic: Topic) => {
        const newTitle = prompt("Edit Topic Title:", topic.Title);
        if (!newTitle) return;
        try {
            await api.put(`/topics/${topic.ID}`, 
                { title: newTitle, description: topic.Description }
            );
            fetchTopics();
        } catch (e) { alert("Failed to edit"); }
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
                        Manage Topics
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
                    {/* Create New */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            placeholder="New topic name"
                            className="flex-1 rounded-sm border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-transparent"
                        />
                        <button
                            type="button"
                            onClick={handleCreate}
                            className="shrink-0 rounded-full bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 text-xs font-semibold shadow-sm transition"
                        >
                            Add
                        </button>
                    </div>

                    {/* List Existing */}
                    <div className="max-h-64 overflow-y-auto space-y-2 pt-1">
                        {topics.map((t) => (
                            <div
                                key={t.ID}
                                className="flex items-start justify-between gap-3 rounded-sm border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/60 px-3 py-2"
                            >
                                <div>
                                    <div className="text-xs font-semibold text-stone-900 dark:text-stone-50">
                                        {t.Title}
                                    </div>
                                    <div className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                                        {t.Description}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(t)}
                                        className="text-[11px] font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(t.ID)}
                                        className="text-[11px] font-medium text-rose-500 hover:text-rose-600 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        {topics.length === 0 && (
                            <p className="text-xs text-stone-500">No topics yet. Create one above.</p>
                        )}
                    </div>
                </div>

                <div className="px-5 py-3 border-t border-stone-200 dark:border-stone-800 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-sm px-4 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}