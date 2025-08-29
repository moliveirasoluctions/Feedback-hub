import express from 'express';
import cors from 'cors';
import path from 'path';
import userRoutes from './routes/users';
import teamRoutes from './routes/teams';
import feedbackRoutes from './routes/api/feedback.routes';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/feedbacks', feedbackRoutes);

// Serve static files from the React build directory
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'dist')));

// The "catchall" handler for client-side routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
