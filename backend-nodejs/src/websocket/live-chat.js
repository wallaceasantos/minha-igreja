/**
 * WebSocket: Live Chat
 * ============================================================
 * Gerencia chat em tempo real durante transmissões ao vivo
 */

import { Server } from 'socket.io';
import { getPool } from '../config/database.js';

let io;

export function setupWebSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Chat client connected: ${socket.id}`);

    // Entrar na sala do chat de uma igreja/live
    socket.on('join_chat', async ({ churchId, liveStreamId, userName, userType }) => {
      const room = `church_${churchId}_live_${liveStreamId || 'general'}`;
      socket.join(room);
      socket.data = { churchId, liveStreamId, userName, userType, room };

      console.log(`💬 ${userName} entrou no chat: ${room}`);

      // Carregar mensagens recentes do banco - APENAS da live atual
      try {
        const pool = getPool();
        
        // Se não houver liveStreamId, não carregar mensagens antigas
        if (!liveStreamId) {
          socket.emit('chat_history', []);
          return;
        }
        
        const [messages] = await pool.query(
          'SELECT id, user_name, user_type, message, message_type, is_pinned, created_at, live_stream_id ' +
          'FROM live_chat_messages ' +
          'WHERE church_id = ? AND live_stream_id = ? AND is_removed = 0 ' +
          'ORDER BY created_at DESC LIMIT 50',
          [churchId, liveStreamId]
        );

        socket.emit('chat_history', messages.reverse());
      } catch (error) {
        console.error('Erro ao carregar histórico do chat:', error);
        socket.emit('chat_history', []);
      }
    });

    // Enviar mensagem
    socket.on('send_message', async ({ churchId, liveStreamId, userName, userType, message, messageType }) => {
      const room = `church_${churchId}_live_${liveStreamId || 'general'}`;

      if (!message?.trim()) return;

      try {
        const pool = getPool();
        const [result] = await pool.execute(
          'INSERT INTO live_chat_messages (church_id, live_stream_id, user_name, user_type, message, message_type) VALUES (?, ?, ?, ?, ?, ?)',
          [churchId, liveStreamId, userName, userType, message.trim(), messageType || 'chat']
        );

        const msgData = {
          id: result.insertId,
          churchId,
          liveStreamId,
          user_name: userName,
          user_type: userType,
          message: message.trim(),
          message_type: messageType || 'chat',
          is_pinned: 0,
          created_at: new Date().toISOString(),
        };

        // Broadcast para todos na sala
        io.to(room).emit('new_message', msgData);
      } catch (error) {
        console.error('Erro ao salvar mensagem:', error);
        socket.emit('error', { message: 'Erro ao enviar mensagem' });
      }
    });

    // Pin/Unpin mensagem (admin)
    socket.on('pin_message', async ({ messageId, churchId, pinned }) => {
      try {
        const pool = getPool();
        await pool.execute(
          'UPDATE live_chat_messages SET is_pinned = ? WHERE id = ? AND church_id = ?',
          [pinned ? 1 : 0, messageId, churchId]
        );

        const room = socket.data?.room;
        if (room) {
          io.to(room).emit('message_pinned', { messageId, pinned });
        }
      } catch (error) {
        console.error('Erro ao fixar mensagem:', error);
      }
    });

    // Remover mensagem (admin)
    socket.on('remove_message', async ({ messageId, churchId }) => {
      try {
        const pool = getPool();
        await pool.execute(
          'UPDATE live_chat_messages SET is_removed = 1 WHERE id = ? AND church_id = ?',
          [messageId, churchId]
        );

        const room = socket.data?.room;
        if (room) {
          io.to(room).emit('message_removed', { messageId });
        }
      } catch (error) {
        console.error('Erro ao remover mensagem:', error);
      }
    });

    // Reação rápida (Amém 🙏)
    socket.on('send_reaction', ({ messageId, churchId, reaction }) => {
      const room = socket.data?.room;
      if (room) {
        io.to(room).emit('new_reaction', { messageId, reaction });
      }
    });

    // Contar usuários online
    socket.on('get_online_count', async ({ churchId, liveStreamId }) => {
      const room = `church_${churchId}_live_${liveStreamId || 'general'}`;
      const sockets = await io.in(room).fetchSockets();
      io.to(room).emit('online_count', sockets.length);
    });

    // Desconectar
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  console.log('✅ WebSocket server configurado');
  return io;
}

export { io };
