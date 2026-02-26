import { useEffect, useState } from 'react';
import { 
    Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, 
    List, ListItem, ListItemText, IconButton, Box 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Manage Topics</DialogTitle>
            <DialogContent>
                {/* Create New */}
                <Box display="flex" gap={1} mb={2} mt={1}>
                    <TextField 
                        fullWidth size="small" label="New Topic Name" 
                        value={newTopic} onChange={(e) => setNewTopic(e.target.value)}
                    />
                    <Button variant="contained" onClick={handleCreate}>Add</Button>
                </Box>

                {/* List Existing */}
                <List dense>
                    {topics.map((t) => (
                        <ListItem key={t.ID}
                            secondaryAction={
                                <>
                                    <IconButton edge="end" onClick={() => handleEdit(t)}><EditIcon /></IconButton>
                                    <IconButton edge="end" onClick={() => handleDelete(t.ID)} color="error"><DeleteIcon /></IconButton>
                                </>
                            }
                        >
                            <ListItemText primary={t.Title} secondary={t.Description} />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}