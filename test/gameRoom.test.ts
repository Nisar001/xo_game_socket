import request from 'supertest';
import { app } from '../src/server';
import mongoose from 'mongoose';
import { GameRoom } from '../src/models/gameRoom.model';


describe('GameRoom API', () => {
  let server: any;
  beforeAll((done) => {
    server = app.listen(0, done);
  });
  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });
  beforeEach(async () => {
    await GameRoom.deleteMany({});
  });

  it('should create a new game room', async () => {
    const res = await request(server)
      .post('/api/xogame/games')
      .send({ roomId: 'testroom1' });
    expect(res.statusCode).toBe(201);
    expect(res.body.roomId).toBe('testroom1');
  });

  it('should not create a duplicate game room', async () => {
    await GameRoom.create({ roomId: 'testroom2', players: [], turn: 'X' });
    const res = await request(server)
      .post('/api/xogame/games')
      .send({ roomId: 'testroom2' });
    expect(res.statusCode).toBe(400);
  });

  it('should get all game rooms', async () => {
    const res = await request(server).get('/api/xogame/games');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(true);
  });
  it('should get a game room by ID', async () => {
    const room = await GameRoom.create({ roomId: 'testroom3', players: [], turn: 'X' });
    const res = await request(server)
      .get(`/api/xogame/games/${room._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.roomId).toBe('testroom3');
  });

  it('should get a game room by id', async () => {
    const room = await GameRoom.create({ roomId: 'testroom3', players: [], turn: 'X' });
    const res = await request(server).get(`/api/xogame/games/${room._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.roomId).toBe('testroom3');
  });
});
