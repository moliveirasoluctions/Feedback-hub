import express from 'express';
import cors from 'cors';
import { userRoutes } from './routes/users';
import { teamRoutes } from './routes/teams';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
