import request from 'supertest';
import { app } from '../src/server';
import mongoose from 'mongoose';
import { GameMove } from '../src/models/gameMove.model';

describe('GameMove API', () => {
  let server: any;
  beforeAll((done) => {
    server = app.listen(0, done);
  });
  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  it('should get all moves', async () => {
    const res = await request(server).get('/api/xogame/moves');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(true);
  });
  it('should get moves by user', async () => {
    const move = await GameMove.create({ roomId: 'room1', userId: new mongoose.Types.ObjectId(), symbol: 'X', position: 0 });
    const res = await request(server).get(`/api/xogame/moves/user/${move.userId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it('should get moves by match', async () => {
    const move = await GameMove.create({ roomId: 'room2', userId: new mongoose.Types.ObjectId(), symbol: 'O', position: 1 });
    const res = await request(server).get(`/api/xogame/moves/match/${move.roomId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it('should get moves by user in a match', async () => {
    const userId = new mongoose.Types.ObjectId();
    const move = await GameMove.create({ roomId: 'room3', userId, symbol: 'X', position: 2 });
    const res = await request(server).get(`/api/xogame/moves/user/${userId}/match/${move.roomId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get moves by user', async () => {
    const move = await GameMove.create({ roomId: 'room1', userId: new mongoose.Types.ObjectId(), symbol: 'X', position: 0 });
    const res = await request(server).get(`/api/xogame/moves/user/${move.userId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get moves by match', async () => {
    const move = await GameMove.create({ roomId: 'room2', userId: new mongoose.Types.ObjectId(), symbol: 'O', position: 1 });
    const res = await request(server).get(`/api/xogame/moves/match/${move.roomId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get moves by user in a match', async () => {
    const userId = new mongoose.Types.ObjectId();
    const move = await GameMove.create({ roomId: 'room3', userId, symbol: 'X', position: 2 });
    const res = await request(server).get(`/api/xogame/moves/user/${userId}/match/${move.roomId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
