/**
 * Integrations API Routes
 */

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { loadIntegrations, getIntegrationById } from '../services/integrationLoader';
import type { IntegrationsListResponse, ErrorResponse } from '../types/integration';

const router = Router();

/**
 * GET /api/integrations
 * Returns list of all available integrations
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const integrations = await loadIntegrations();

    const response: IntegrationsListResponse = {
      version: '1.0.0',
      count: integrations.length,
      integrations
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/integrations/:id
 * Returns a specific integration by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const integration = await getIntegrationById(id);

    if (!integration) {
      const errorResponse: ErrorResponse = {
        error: 'Integration not found',
        message: `No integration with id '${id}' exists`
      };
      res.status(404).json(errorResponse);
      return;
    }

    res.json(integration);
  } catch (error) {
    next(error);
  }
});

export default router;
