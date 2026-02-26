import { useEffect, useState, type FormEvent } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import CreatePostModal from '../components/CreatePostModal';
import TopicManagerModal from '../components/TopicManagerModal';
import Navbar from '../components/Navbar';

interface Post {
    ID: number;
    Title: string;
    Body: string;
    Topic: { Title: string };
    User: { Username: string };
}

interface Topic {
    ID: number;
    Title: string;
}

export default function FeedPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
        fetchTopics();
    }, []);

    const fetchPosts = async (query = '', topicId: string | null = selectedTopicId) => {
        try {
            const params = new URLSearchParams();
            if (query) {
                params.set('search', query);
            }
            if (topicId) {
                params.set('topic', topicId);
            }

            const queryString = params.toString() ? `?${params.toString()}` : '';
            const url = `/posts${queryString}`;

            const res = await api.get(url);
            setPosts(res.data.posts);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch posts", err);
            navigate('/login');
        }
    };

    const fetchTopics = async () => {
        try {
            const res = await api.get('/topics');
            setTopics(res.data.topics);
        } catch (err) {
            console.error("Failed to fetch topics", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // destroy token
        navigate('/login'); // redirect
    };

    const handleSearch = (e?: FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        setLoading(true);
        fetchPosts(searchQuery, selectedTopicId);
    };

    const handleSelectTopic = (topicId: string | null) => {
        setSelectedTopicId(topicId);
        setLoading(true);
        fetchPosts(searchQuery, topicId);
    };

    return (
        <div className="min-h-screen">
            <Navbar
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onSearchSubmit={() => handleSearch()}
                onLogout={handleLogout}
                onOpenTopics={() => setIsTopicModalOpen(true)}
            />

            <main className="max-w-4xl mx-auto px-4 py-6">
                {/* Topic filter pills */}
                <div className="mb-4 overflow-x-auto">
                    <div className="flex gap-2 pb-1 min-w-max">
                        <button
                            type="button"
                            onClick={() => handleSelectTopic(null)}
                            className={`rounded-full px-4 py-1 text-sm transition-colors ${
                                selectedTopicId === null
                                    ? 'bg-sky-500 text-white'
                                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600'
                            }`}
                        >
                            All
                        </button>
                        {topics.map((topic) => {
                            const isSelected = selectedTopicId === String(topic.ID);
                            return (
                                <button
                                    key={topic.ID}
                                    type="button"
                                    onClick={() => handleSelectTopic(String(topic.ID))}
                                    className={`rounded-full px-4 py-1 text-sm transition-colors ${
                                        isSelected
                                            ? 'bg-sky-500 text-white'
                                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600'
                                    }`}
                                >
                                    {topic.Title}
                                </button>
                            );
                        })}
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="h-8 w-8 rounded-full border-2 border-stone-300 border-t-sky-500 animate-spin" />
                    </div>
                ) : posts.length === 0 ? (
                    <p className="mt-8 text-center text-sm text-stone-500">
                        {searchQuery
                            ? 'No results found matching your vibes.'
                            : 'No posts yet. Be the first to say something!'}
                    </p>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <article
                                key={post.ID}
                                className="rounded-sm border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5"
                            >
                                <div className="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
                                    {post.Topic?.Title || 'General'}
                                </div>
                                <h2 className="mt-1 text-base sm:text-lg font-semibold text-stone-900 dark:text-stone-50">
                                    {post.Title}
                                </h2>
                                <p className="mt-1 text-xs text-stone-500">
                                    Posted by @{post.User?.Username || 'Unknown'}
                                </p>
                                <p className="mt-3 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                                    {post.Body}
                                </p>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/posts/${post.ID}`)}
                                        className="rounded-full px-4 py-1.5 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition"
                                    >
                                        View Discussion
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {/* Floating Add Post button */}
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 right-6 inline-flex items-center justify-center rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/30 px-5 py-3 text-sm font-semibold transition"
                aria-label="Create post"
            >
                <span className="mr-1 text-lg leading-none">+</span>
                <span className="hidden sm:inline">New Post</span>
            </button>

            {/* MODALS */}
            <CreatePostModal 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onPostCreated={() => fetchPosts('', selectedTopicId)} // respect current topic filter
            />
            
            <TopicManagerModal 
                open={isTopicModalOpen} 
                onClose={() => setIsTopicModalOpen(false)} 
            />
        </div>
    );
}