import { Router } from 'express';

const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ ok: true, service: 'career-caves-backend' });
});

export default healthRouter;
