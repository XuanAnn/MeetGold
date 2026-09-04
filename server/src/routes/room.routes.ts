import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/', optionalAuth, RoomController.create);
router.get('/:id', RoomController.getById);
router.post('/:id/snapshot', RoomController.saveSnapshot);
router.get('/:id/snapshot', RoomController.getSnapshot);

export default router;
