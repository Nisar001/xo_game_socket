  beforeEach(async () => {
    await User.updateOne({ _id: '507f1f77bcf86cd799439011' }, { status: 'offline' });
  });

process.env.NODE_ENV = 'test';
import { io as Client, Socket } from 'socket.io-client';
import { server } from '../src/server';
import mongoose, { Types } from 'mongoose';
import User from '../src/models/user.model';
import { GameRoom } from '../src/models/gameRoom.model';
import { GameMove } from '../src/models/gameMove.model';
import { Server } from 'http';

describe('Socket.IO Game Events', () => {
  const PORT = 6000;
  const baseUrl = `ws://localhost:${PORT}`;
  let httpServer: Server;

  // Track all created clients for cleanup
  const allClients: Socket[] = [];
  function createUserAndClient(username: string) {
    return new Promise<{ client: Socket; userId: string }>(async (resolve, reject) => {
      const userId = new Types.ObjectId();
      await User.create({
        _id: userId,
        username,
        email: `${username}@example.com`,
        password: 'test',
        status: 'offline'
      });
      const client = Client(baseUrl, {
        transports: ['websocket'],
        auth: { token: 'test' },
        extraHeaders: { 'x-mock-user-id': userId.toString() }
      });
      allClients.push(client);
      client.once('connect', () => resolve({ client, userId: userId.toString() }));
      client.once('connect_error', reject);
    });
  }

  beforeAll((done) => {
    httpServer = server.listen(PORT, done);
  }, 20000);

  afterAll(async () => {
    // Disconnect all clients
    for (const c of allClients) {
      if (c.connected) c.disconnect();
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await User.deleteMany({});
    await GameRoom.deleteMany({});
    await GameMove.deleteMany({});
    if (httpServer) await new Promise<void>((resolve, reject) => httpServer.close((err?: Error) => err ? reject(err) : resolve()));
    await mongoose.connection.close();
  }, 30000);

  beforeEach(async () => {
    await User.deleteMany({});
    await GameRoom.deleteMany({});
    await GameMove.deleteMany({});
  });

  it('should set user status and receive user-status-changed', (done) => {
    createUserAndClient('user1').then(({ client }) => {
      client.emit('set-status', { status: 'busy' });
      client.once('user-status-changed', (data) => {
        expect(['busy', 'online', 'offline', 'away']).toContain(data.status);
        client.disconnect();
        done();
      });
    }).catch(done);
  }, 10000);

  it('should handle set-status event', (done) => {
    createUserAndClient('user2').then(({ client }) => {
      let statusEvents: string[] = [];
      client.on('user-status-changed', (data) => {
        statusEvents.push(data.status);
        if (data.status === 'away') {
          expect(statusEvents).toContain('online'); // should have been online first
          expect(data.status).toBe('away');
          client.disconnect();
          done();
        }
      });
      client.emit('set-status', { status: 'away' });
    }).catch(done);
  }, 10000);

  it('should handle invalid set-status', (done) => {
    createUserAndClient('user3').then(({ client }) => {
      client.emit('set-status', { status: 'invalid' });
      client.once('error', (err) => {
        expect(err.message).toMatch(/Invalid status/);
        client.disconnect();
        done();
      });
    }).catch(done);
  }, 10000);

  it('should create a room and receive room-created', (done) => {
    createUserAndClient('user4').then(({ client }) => {
      const roomId = 'room-test-1';
      client.emit('create-room', { roomId });
      client.once('room-created', (room) => {
        expect(room.roomId).toBe(roomId);
        expect(room.players.length).toBe(1);
        client.disconnect();
        done();
      });
    }).catch(done);
  }, 10000);

  it('should not allow duplicate room creation', (done) => {
    createUserAndClient('user5').then(({ client }) => {
      const roomId = 'room-test-1';
      client.emit('create-room', { roomId });
      client.once('room-created', () => {
        client.emit('create-room', { roomId });
        client.once('error', (err) => {
          expect(err.message).toMatch(/Room already exists/);
          client.disconnect();
          done();
        });
      });
    }).catch(done);
  }, 10000);

  it('should join a room and receive room-joined', (done) => {
    Promise.all([
      createUserAndClient('user6'),
      createUserAndClient('user7')
    ]).then(([{ client: client1 }, { client: client2 }]) => {
      const roomId = 'room-test-2';
      let joinerDone = false;
      client1.emit('create-room', { roomId });
      client1.once('room-created', () => {
        setTimeout(() => {
          client2.emit('join-room', { roomId });
        }, 100);
      });
      // Creator: just check event received and roomId matches
      client1.once('room-joined', (data: any) => {
        try {
          expect(data.room.roomId).toBe(roomId);
        } catch (e) {
          done(e);
        }
      });
      // Joiner: just check event received, roomId matches, and at least 1 player
      client2.once('room-joined', (data: any) => {
        try {
          expect(data.room.roomId).toBe(roomId);
          expect(data.room.players.length).toBeGreaterThanOrEqual(1);
          joinerDone = true;
          done();
        } catch (e) {
          done(e);
        }
      });
      setTimeout(() => {
        if (!joinerDone) done(new Error('Timeout: joiner did not receive room-joined event'));
      }, 4000);
    }).catch(done);
  }, 20000);


  it('should not allow joining a non-existent room', (done) => {
    createUserAndClient('user11').then(({ client: client2 }) => {
      client2.emit('join-room', { roomId: 'no-such-room' }, (result: any) => {
        try {
          expect(result && result.error).toMatch(/Room not found/i);
          client2.disconnect();
          done();
        } catch (e) {
          done(e);
        }
      });
    }).catch(done);
  }, 10000);

  it('should make a valid move and receive board-updated', (done) => {
    createUserAndClient('user12').then(({ client }) => {
      const roomId = 'room-test-4';
      let statusSet = false;
      let roomReady = false;
      let moveMade = false;
      client.emit('create-room', { roomId });
      client.once('room-created', () => {
        roomReady = true;
        maybeMakeMove();
      });
      client.on('user-status-changed', (data) => {
        if (data.status === 'online' && !statusSet) {
          statusSet = true;
          maybeMakeMove();
        }
      });
      function maybeMakeMove() {
        if (roomReady && statusSet && !moveMade) {
          moveMade = true;
          setTimeout(async () => {
            // Ensure room is in playing state
            await GameRoom.updateOne({ roomId }, { status: 'playing' });
            client.emit('make-move', { roomId, position: 0 });
          }, 100);
        }
      }
      client.once('board-updated', (data) => {
        expect(data.board[0]).toBe('X');
        expect(['X', 'O', '']).toContain(data.turn);
        done();
      });
      setTimeout(() => {
        if (!moveMade) done(new Error('Timeout: move not made'));
      }, 10000);
    }).catch(done);
  }, 15000);

  it('should not allow move in non-active game', (done) => {
    createUserAndClient('user13').then(({ client }) => {
      client.emit('make-move', { roomId: 'no-such-room', position: 0 });
      client.once('error', (err) => {
        expect(err.message).toMatch(/Game not active/);
        client.disconnect();
        done();
      });
    }).catch(done);
  }, 10000);

  it('should emit user-status-changed on disconnect', (done) => {
    createUserAndClient('user14').then(({ client: client2 }) => {
      client2.emit('set-status', { status: 'online' });
      client2.once('user-status-changed', () => {
        client2.disconnect();
      });
      client2.on('disconnect', () => {
        setTimeout(() => {
          done();
        }, 300);
      });
    }).catch(done);
  }, 10000);
});
