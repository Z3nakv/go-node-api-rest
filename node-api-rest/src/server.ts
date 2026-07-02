import express from 'express';
import cors from 'cors';
import statsRoutes from './routes/statsRoutes';
import jwtProtect from './middleware/auth';

const app = express();

export const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || '';

app.use(express.json());
app.use(cors());

app.use(jwtProtect(JWT_SECRET));

app.use(statsRoutes);

export default app;