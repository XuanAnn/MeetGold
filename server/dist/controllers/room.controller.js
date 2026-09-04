"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomController = void 0;
const room_service_1 = require("../services/room.service");
const uuid_1 = require("uuid");
class RoomController {
    static async create(req, res) {
        try {
            const { name } = req.body;
            const ownerId = req.user?.id || (0, uuid_1.v4)();
            const room = await room_service_1.RoomService.createRoom({ name }, ownerId);
            return res.status(201).json(room);
        }
        catch (err) {
            return res.status(500).json({ message: err.message || 'Failed to create room' });
        }
    }
    static async getById(req, res) {
        try {
            const id = req.params.id;
            const room = await room_service_1.RoomService.getRoomDetails(id);
            if (!room) {
                return res.status(404).json({ message: 'Room not found' });
            }
            return res.status(200).json(room);
        }
        catch (err) {
            return res.status(500).json({ message: err.message || 'Failed to get room details' });
        }
    }
    static async saveSnapshot(req, res) {
        try {
            const id = req.params.id;
            const { data } = req.body;
            if (!data) {
                return res.status(400).json({ message: 'Snapshot data is required' });
            }
            await room_service_1.RoomService.saveWhiteboardSnapshot(id, typeof data === 'string' ? data : JSON.stringify(data));
            return res.status(200).json({ success: true });
        }
        catch (err) {
            return res.status(500).json({ message: err.message || 'Failed to save snapshot' });
        }
    }
    static async getSnapshot(req, res) {
        try {
            const id = req.params.id;
            const snapshot = await room_service_1.RoomService.getWhiteboardSnapshot(id);
            return res.status(200).json({ data: snapshot });
        }
        catch (err) {
            return res.status(500).json({ message: err.message || 'Failed to get snapshot' });
        }
    }
}
exports.RoomController = RoomController;
