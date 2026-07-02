import {Router} from 'express';
import { computeStatsReport } from '../services/statsService';
import { Request, Response } from 'express';

const router = Router();

router.get('/health', (req:Request, res:Response) => {
    res.json({ status: 'ok', service: 'stats-api' });
});

router.post('/api/stats', (req:Request, res:Response) => {
    console.log('BODY RECIBIDO:', JSON.stringify(req.body));
  const { q, r } = req.body || {};

  if (!q || !r) {
    return res.status(400).json({
      error: 'el body debe tener la forma { "q": number[][], "r": number[][] }',
    });
  }

  try {
    const report = computeStatsReport({ q, r });
    return res.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return res.status(422).json({ error: message });
  }
});

export default router;