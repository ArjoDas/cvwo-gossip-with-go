import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Container, Typography, Card, CardContent, Box, CircularProgress, 
    TextField, Button, Divider, Paper, IconButton 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

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
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // request both in parallel
        const [postRes, commentsRes] = await Promise.all([
        axios.get(`/api/posts/${id}`, { headers }),
        axios.get(`/api/posts/${id}/comments`, { headers })
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
            const token = localStorage.getItem('token');
            await axios.delete(`/api/posts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            navigate('/');
        } catch (err) { alert("Failed to delete post"); }
    };

    const handleEditPost = async () => {
        if (!post) return;
        const newTitle = prompt("Edit Title:", post.Title);
        const newBody = prompt("Edit Body:", post.Body);
        
        if (newTitle === null || newBody === null) return; // User cancelled

        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/posts/${id}`, 
                { title: newTitle, body: newBody },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData(); // refresh UI
        } catch (err) { alert("Failed to edit post"); }
    };

    // --- COMMENT ACTIONS ---
    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/posts/${id}/comments`, 
                { body: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewComment('');
            fetchData(); 
        } catch (err) { alert("Failed to post comment"); }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!confirm("Delete comment?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/comments/${commentId}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchData();
        } catch (err) { alert("Failed to delete comment"); }
    };

    const handleEditComment = async (comment: Comment) => {
        const newBody = prompt("Edit Comment:", comment.Body);
        if (newBody === null) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/comments/${comment.ID}`, 
                { body: newBody },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (err) { alert("Failed to edit comment"); }
    };

    if (loading || !post) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

    const isOwner = currentUserId === post.UserID;

    return (
        <Container maxWidth="md">
            <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>&larr; Back to Feed</Button>

            {/* MAIN POST CARD */}
            <Card sx={{ mb: 4, bgcolor: '#fafafa' }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                            <Typography variant="h4" gutterBottom>{post.Title}</Typography>
                            <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                                Posted by @{post.User?.Username || 'Unknown'}
                            </Typography>
                        </Box>
                        {/* Only show actions if user owns the post */}
                        {isOwner && (
                            <Box>
                                <IconButton onClick={handleEditPost} color="primary"><EditIcon /></IconButton>
                                <IconButton onClick={handleDeletePost} color="error"><DeleteIcon /></IconButton>
                            </Box>
                        )}
                    </Box>
                    <Typography variant="body1" sx={{ mt: 2 }}>{post.Body}</Typography>
                </CardContent>
            </Card>

            <Divider sx={{ mb: 4 }} />

            {/* COMMENTS SECTION */}
            <Typography variant="h5" gutterBottom>Discussion</Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <TextField 
                    fullWidth label="Write a comment..." variant="outlined"
                    value={newComment} onChange={(e) => setNewComment(e.target.value)}
                />
                <Button variant="contained" onClick={handleSubmitComment}>Post</Button>
            </Box>

            {comments.length === 0 ? (
                <Typography color="text.secondary">No comments yet.</Typography>
            ) : (
                comments.map((comment) => (
                    <Paper key={comment.ID} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} elevation={1}>
                        <Box>
                            <Typography variant="subtitle2" color="primary">@{comment.User?.Username}</Typography>
                            <Typography variant="body2">{comment.Body}</Typography>
                        </Box>
                        {/* Only show actions if user owns the comment */}
                        {currentUserId === comment.UserID && (
                            <Box>
                                <IconButton size="small" onClick={() => handleEditComment(comment)}><EditIcon fontSize="small" /></IconButton>
                                <IconButton size="small" onClick={() => handleDeleteComment(comment.ID)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                            </Box>
                        )}
                    </Paper>
                ))
            )}
        </Container>
    );
}