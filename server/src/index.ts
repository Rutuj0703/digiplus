import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import incidentRoutes from './routes/incidents';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

import knowledgeRoutes from './routes/knowledge';

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/incidents', incidentRoutes);
app.use('/api/knowledge', knowledgeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

export default app;
