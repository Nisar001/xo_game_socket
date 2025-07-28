import { Server, Socket } from 'socket.io';
import { GameRoom } from '../models/gameRoom.model';
import { GameMove } from '../models/gameMove.model';
import User from '../models/user.model';

export const handleGameSocket = (socket: Socket, io: Server) => {
  // Set user online on connect
  (async () => {
    if (socket.user) {
      await User.findByIdAndUpdate(socket.user._id, { status: 'online' });
      io.emit('user-status-changed', { userId: socket.user._id.toString(), status: 'online' });
    }
  })();
  // User status events
  socket.on('set-status', async (data) => {
    try {
      if (!socket.user) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }
      // Accept both { status: 'online' } and direct string for backward compatibility
      let status: string;
      if (typeof data === 'string') {
        status = data;
      } else if (data && typeof data.status === 'string') {
        status = data.status;
      } else {
        socket.emit('error', { message: 'Invalid input. Must provide status.' });
        return;
      }
      const allowed = ['online', 'offline', 'away', 'busy'];
      if (!allowed.includes(status)) {
        socket.emit('error', { message: 'Invalid status. Allowed: online, offline, away, busy.' });
        return;
      }
      await User.findByIdAndUpdate(socket.user._id, { status });
      io.emit('user-status-changed', { userId: socket.user._id.toString(), status });
    } catch (err) {
      socket.emit('error', { message: 'Failed to update status', error: err instanceof Error ? err.message : err });
    }
  });

  socket.on('create-room', async (data) => {
    try {
      const roomId = data?.roomId;
      if (!roomId || typeof roomId !== 'string' || !roomId.trim()) {
        socket.emit('error', { message: 'roomId is required and must be a non-empty string.' });
        return;
      }
      if (!socket.user) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }
      const existing = await GameRoom.findOne({ roomId });
      if (existing) {
        socket.emit('error', { message: 'Room already exists' });
        return;
      }
      const room = await GameRoom.create({
        roomId,
        players: [{ userId: socket.user._id, symbol: 'X' }],
        turn: 'X'
      });
      socket.join(roomId);
      socket.emit('room-created', room);
    } catch (err) {
      socket.emit('error', { message: 'Failed to create room', error: err instanceof Error ? err.message : err });
    }
  });

  socket.on('join-room', async ({ roomId }) => {
    const room = await GameRoom.findOne({ roomId });
    if (!room) return socket.emit('error', 'Room not found');
    if (room.players.length >= 2) return socket.emit('error', 'Room full');
    if (!socket.user) return socket.emit('error', 'Unauthorized');
    const isAlreadyJoined = room.players.some(p => p && p.userId && p.userId.toString() === socket.user!._id.toString());
    if (!isAlreadyJoined) {
      room.players.push({ userId: socket.user._id, symbol: 'O' });
      room.status = 'playing';
      await room.save();
    }
    socket.join(roomId);
    io.to(roomId).emit('room-joined', { room, message: 'Game started. X goes first.' });
  });

  socket.on('make-move', async (data) => {
    try {
      const roomId = data?.roomId;
      const position = data?.position;
      if (!roomId || typeof roomId !== 'string' || !roomId.trim()) {
        socket.emit('error', { message: 'roomId is required and must be a non-empty string.' });
        return;
      }
      if (typeof position !== 'number' || position < 0 || position > 8) {
        socket.emit('error', { message: 'position is required and must be a number between 0 and 8.' });
        return;
      }
      if (!socket.user) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }
      const room = await GameRoom.findOne({ roomId });
      if (!room || room.status !== 'playing') {
        socket.emit('error', { message: 'Game not active' });
        return;
      }
      const player = room.players.find(p => p && p.userId && p.userId.toString() === socket.user!._id.toString());
      if (!player || !player.symbol) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }
      if (room.turn !== player.symbol) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }
      if (room.board[position]) {
        socket.emit('error', { message: 'Cell already filled' });
        return;
      }
      room.board[position] = player.symbol;
      room.turn = player.symbol === 'X' ? 'O' : 'X';
      await GameMove.create({ roomId, userId: player.userId, symbol: player.symbol, position });
      const winner = checkWinner(room.board);
      if (winner || !room.board.includes('')) {
        room.status = 'finished';
        room.winner = winner || 'draw';
      }
      await room.save();
      io.to(roomId).emit('board-updated', { board: room.board, turn: room.turn, winner: room.winner });
    } catch (err) {
      socket.emit('error', { message: 'Failed to make move', error: err instanceof Error ? err.message : err });
    }
  });

  // Set user offline on disconnect
  socket.on('disconnect', async () => {
    if (socket.user) {
      await User.setOffline(socket.user._id.toString());
      io.emit('user-status-changed', { userId: socket.user._id.toString(), status: 'offline' });
    }
  });
};

function checkWinner(board: string[]): string | null {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8], // rows
    [0,3,6], [1,4,7], [2,5,8], // cols
    [0,4,8], [2,4,6]           // diags
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}
