import { Router } from 'express';
import { authenticateToken } from '../auth/tokens';
import {
  getStadium,
  getStadiumStats,
  createFacility,
  upgradeFacility,
  createUpgrade,
  startUpgrade
} from './handlers';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Stadium routes
router.get('/:teamId', getStadium);
router.get('/:teamId/stats', getStadiumStats);

// Facility routes
router.post('/:teamId/facilities', createFacility);
router.put('/facilities/:facilityId/upgrade', upgradeFacility);

// Upgrade routes
router.post('/:teamId/upgrades', createUpgrade);
router.put('/upgrades/:upgradeId/start', startUpgrade);

export default router;
