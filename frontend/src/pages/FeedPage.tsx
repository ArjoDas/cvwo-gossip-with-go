import { useEffect, useState } from 'react';
import { 
    Container, Typography, Card, CardContent, CardActions, Button, Fab, Box, CircularProgress, 
    AppBar, Toolbar, IconButton, TextField, InputAdornment 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'; // Icon for Topics
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CreatePostModal from '../components/CreatePostModal';
import TopicManagerModal from '../components/TopicManagerModal';

interface Post {
    ID: number;
    Title: string;
    Body: string;
    Topic: { Title: string };
    User: { Username: string };
}

export default function FeedPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    // fetch posts on load
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async (query = '') => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // if query exists, append ?search=... (Using the new search feature)
            const url = query ? `/api/posts?search=${query}` : '/api/posts';

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(res.data.posts);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch posts", err);
            navigate('/login');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // destroy token
        navigate('/login'); // redirect
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        fetchPosts(searchQuery);
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    }

    return (
        <>
            {/* NAVIGATION BAR */}
            <AppBar position="static" sx={{ mb: 4 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Gossip (CVWO)
                    </Typography>
                    
                    {/* SEARCH BAR */}
                    <Box component="form" onSubmit={handleSearch} sx={{ mr: 2, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1 }}>
                        <TextField
                        variant="standard"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        
                        // listen for the "Enter" key
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                            handleSearch(e);
                            }
                        }}

                        InputProps={{
                            disableUnderline: true,
                            sx: { color: 'white', px: 2, py: 0.5 },
                            endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleSearch}>
                                <SearchIcon sx={{ color: 'white' }} />
                                </IconButton>
                            </InputAdornment>
                            )
                        }}
                        />
                    </Box>

                    {/* ACTION BUTTONS */}
                    <Button color="inherit" startIcon={<LibraryBooksIcon />} onClick={() => setIsTopicModalOpen(true)}>
                        Topics
                    </Button>
                    <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md">
                {posts.length === 0 ? (
                    <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                        {searchQuery ? 'No results found matching your vibes.' : 'No posts yet. Be the first to say something!'}
                    </Typography>
                ) : (
                    posts.map((post) => (
                        <Card key={post.ID} sx={{ mb: 2, bgcolor: '#fafafa' }}>
                            <CardContent>
                                <Typography variant="overline" color="primary" sx={{ fontWeight: 'bold' }}>
                                    {post.Topic?.Title || 'General'}
                                </Typography>
                                <Typography variant="h6" component="div">
                                    {post.Title}
                                </Typography>
                                <Typography sx={{ mb: 1.5 }} color="text.secondary" variant="subtitle2">
                                    Posted by @{post.User?.Username || 'Unknown'}
                                </Typography>
                                <Typography variant="body2">
                                    {post.Body}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => navigate(`/posts/${post.ID}`)}>
                                    View Discussion
                                </Button>
                            </CardActions>
                        </Card>
                    ))
                )}

                {/* ADD POST FLOATING BUTTON */}
                <Fab 
                    color="primary" 
                    aria-label="add" 
                    sx={{ position: 'fixed', bottom: 32, right: 32 }}
                    onClick={() => setIsModalOpen(true)}
                >
                    <AddIcon />
                </Fab>

                {/* MODALS */}
                <CreatePostModal 
                    open={isModalOpen} 
                    onClose={() => setIsModalOpen(false)}
                    onPostCreated={() => fetchPosts('')} // reset search on new post
                />
                
                <TopicManagerModal 
                    open={isTopicModalOpen} 
                    onClose={() => setIsTopicModalOpen(false)} 
                />
            </Container>
        </>
    );
}