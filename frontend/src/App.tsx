import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';

import LoginPage from './pages/LoginPage';
import FeedPage from './pages/FeedPage';
import SignupPage from './pages/SignupPage';
import PostDetailPage from './pages/PostDetailPage';

function App() {
  return (
    <BrowserRouter>
      {/* CssBaseline kicks out browser default styles */}
      <CssBaseline />
      <Container maxWidth="md" sx={{ marginTop: 4 }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<FeedPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;