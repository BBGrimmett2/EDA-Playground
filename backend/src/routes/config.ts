/**
 * Configuration endpoint
 * Provides runtime configuration to the frontend
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/config
 * Returns public configuration for the frontend
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    aapBaseUrl: process.env.AAP_BASE_URL || null,
  });
});

export default router;
