import { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem } from '@mui/material'; // Added MenuItem
import axios from 'axios';

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
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [topicId, setTopicId] = useState(''); // State for selected topic
    const [topics, setTopics] = useState<Topic[]>([]); // State for list of topics
    const [loading, setLoading] = useState(false);

    // Fetch topics when modal opens
    useEffect(() => {
        if (open) {
            axios.get('/api/topics')
                .then(res => setTopics(res.data.topics))
                .catch(err => console.error("Failed to load topics", err));
        }
    }, [open]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/posts', 
                { 
                    title, 
                    body, 
                    TopicID: Number(topicId) // Send the chosen TopicID
                },
                { headers: { Authorization: `Bearer ${token}` } }
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

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Create New Post</DialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    label="Title"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                
                {/* Topic Selector */}
                <TextField
                    select
                    margin="dense"
                    label="Topic"
                    fullWidth
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                >
                    {topics.map((topic) => (
                        <MenuItem key={topic.ID} value={topic.ID}>
                            {topic.Title}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    margin="dense"
                    label="Body"
                    fullWidth
                    multiline
                    rows={4}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? 'Posting...' : 'Post'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}