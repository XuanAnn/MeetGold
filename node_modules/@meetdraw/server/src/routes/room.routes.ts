import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { optionalAuth, requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/user/history', requireAuth, RoomController.getMyRooms);
router.post('/', optionalAuth, RoomController.create);
router.get('/:id', RoomController.getById);
router.post('/:id/join', optionalAuth, RoomController.join);
router.post('/:id/snapshot', RoomController.saveSnapshot);
router.get('/:id/snapshot', RoomController.getSnapshot);

export default router;
