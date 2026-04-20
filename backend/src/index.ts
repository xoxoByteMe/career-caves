import cors from 'cors';
import express from 'express';
import { env } from './lib/env';
import healthRouter from './routes/health';
import listingsRouter from './routes/listings';
import conversationsRouter from './routes/conversations';
import messagesRouter from './routes/messages';

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
  }),
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ service: 'career-caves-backend', status: 'running' });
});

app.use('/api/health', healthRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/messages', messagesRouter);

app.listen(env.port, () => {
  console.log(`Backend listening on http://localhost:${env.port}`);
});
