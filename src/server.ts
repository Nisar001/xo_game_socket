import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import appRoutes from './app.routes';
import { authenticateSocket } from './middlewares/jwtVerify.middleware';
import { handleGameSocket } from './socket/game.socket';
import { connectDB } from './config/database';

dotenv.config();

export const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
export { server };

connectDB()

app.use(cors());
app.use(express.json());
app.use('/api', appRoutes);


io.use(authenticateSocket);
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.user ? socket.user.username : 'unknown user'}`);
  handleGameSocket(socket, io);

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.user ? socket.user.username : 'unknown user'} | Reason: ${reason}`);
    // Optionally, update user status in DB or notify others
  });

  socket.on('error', (err) => {
    console.error(`Socket error: ${err}`);
  });
});

if (process.env.NODE_ENV !== 'development') {
  server.listen(process.env.PORT || 5000, () => {
    console.log(`Server listening on port ${process.env.PORT || 5000}`.bgMagenta.white);
  });
}
