export interface Room {
    id: string;
    name: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
}
export interface RoomMember {
    id: string;
    roomId: string;
    userId: string;
    joinedAt: string;
}
export interface CreateRoomDto {
    name: string;
}
export interface RoomDetails {
    id: string;
    name: string;
    ownerId: string;
    ownerName?: string;
    createdAt: string;
    memberCount: number;
}
//# sourceMappingURL=room.d.ts.map