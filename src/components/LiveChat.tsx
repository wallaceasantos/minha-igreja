/**
 * LiveChat - Chat ao Vivo em Tempo Real via WebSocket
 * ============================================================
 * Chat durante transmissões ao vivo com reações e moderação
 */

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send, MessageCircle, Shield, User, Crown, Flame, Award, 
  Sparkles, Users, TrendingUp, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { buildApiUrl } from '@/lib/config';

interface LiveChatProps {
  churchId: number;
  liveStreamId?: number;
  memberSession?: any;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: number;
  user_name: string;
  user_type: string;
  message: string;
  message_type: string;
  is_pinned: number;
  created_at: string;
}

// Emojis rápidos para reações durante o culto
const quickReactions = [
  { emoji: '🙏', label: 'Oração', message: '🙏 Amém! Estou orando com você!' },
  { emoji: '❤️', label: 'Amor', message: '❤️ Glória a Deus!' },
  { emoji: '🔥', label: 'Fogo', message: '🔥 Aleluia! O Espírito de Deus está aqui!' },
  { emoji: '😇', label: 'Bênção', message: '😇 Que Deus te abençoe!' },
  { emoji: '✨', label: 'Glória', message: '✨ Glória ao Senhor!' },
  { emoji: '🎵', label: 'Louvor', message: '🎵 Que louvor maravilhoso!' },
];

// Top membros simulados (em produção viria do backend)
const topMembers = [
  { name: 'Maria S.', messages: 45, badge: 'gold' },
  { name: 'João P.', messages: 32, badge: 'silver' },
  { name: 'Ana L.', messages: 28, badge: 'bronze' },
];

// Mensagens de boas-vindas para novos membros
const welcomeMessages = [
  'Bem-vindo à família! 🙏',
  'Que alegria ter você conosco! ✨',
  'Seja bem-vindo à nossa comunidade! ❤️',
];

export default function LiveChat({ churchId, liveStreamId, memberSession, isOpen, onClose }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [socket, setSocket] = useState<any>(null);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [showGamification, setShowGamification] = useState(true);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Limpar mensagens quando liveStreamId mudar (nova live ou sair da live)
  useEffect(() => {
    setMessages([]);
    setOnlineCount(0);
  }, [liveStreamId]);

  useEffect(() => {
    if (!isOpen || !churchId) return;

    // Limpar mensagens ao abrir o chat
    setMessages([]);

    const socketUrl = buildApiUrl('').replace('/api', '');
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to chat');
      const userName = memberSession?.member?.name || 'Visitante';
      const userType = memberSession?.member ? 'member' : 'visitor';

      newSocket.emit('join_chat', {
        churchId,
        liveStreamId,
        userName,
        userType,
      });
    });

    newSocket.on('chat_history', (history: ChatMessage[]) => {
      // Só carregar histórico se houver mensagens e for da live atual
      if (history && history.length > 0) {
        // Verificar se as mensagens são da live atual
        const validMessages = history.filter(msg => 
          !liveStreamId || msg.live_stream_id === liveStreamId
        );
        setMessages(validMessages);
      } else {
        setMessages([]);
      }
    });

    newSocket.on('new_message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    newSocket.on('online_count', (count: number) => {
      setOnlineCount(count);
    });

    newSocket.on('message_removed', ({ messageId }) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    });

    // Atualizar contagem online a cada 10s
    const countInterval = setInterval(() => {
      newSocket.emit('get_online_count', { churchId, liveStreamId });
    }, 10000);

    setSocket(newSocket);

    return () => {
      clearInterval(countInterval);
      newSocket.disconnect();
    };
  }, [isOpen, churchId, liveStreamId, memberSession]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const userName = memberSession?.member?.name || 'Visitante';
    const userType = memberSession?.member ? 'member' : 'visitor';

    socket.emit('send_message', {
      churchId,
      liveStreamId,
      userName,
      userType,
      message: newMessage,
    });

    setNewMessage('');
  };

  const sendPrayerRequest = () => {
    if (!socket) return;
    
    const msgText = newMessage.trim() || 'Orem por mim, por favor! 🙏';

    const userName = memberSession?.member?.name || 'Visitante';
    const userType = memberSession?.member ? 'member' : 'visitor';

    socket.emit('send_message', {
      churchId,
      liveStreamId,
      userName,
      userType,
      message: msgText,
      messageType: 'prayer_request',
    });

    setNewMessage('');
  };

  const sendReaction = (reaction: { emoji: string; label: string; message: string }) => {
    if (!socket) return;

    // Animação visual do emoji
    setActiveReaction(reaction.emoji);
    setTimeout(() => setActiveReaction(null), 1000);

    const userName = memberSession?.member?.name || 'Visitante';
    const userType = memberSession?.member ? 'member' : 'visitor';

    socket.emit('send_message', {
      churchId,
      liveStreamId,
      userName,
      userType,
      message: reaction.message,
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <Card className="bg-gray-800 border-gray-700 h-full flex flex-col relative">
      {/* Animação de emoji flutuante */}
      {activeReaction && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
          <span className="text-6xl animate-bounce">{activeReaction}</span>
        </div>
      )}

      <CardHeader className="shrink-0 border-b border-gray-700 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-base">
            <MessageCircle className="w-5 h-5 text-blue-400" /> Chat ao Vivo
          </CardTitle>
          <div className="flex items-center gap-2">
            {memberSession?.member && (
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs gap-1">
                <Crown className="w-3 h-3" /> Membro
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              {onlineCount} online
            </Badge>
          </div>
        </div>
        
        {/* Gamificação - Top Membros */}
        {showGamification && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-gray-400">Top membros:</span>
                <div className="flex -space-x-1">
                  {topMembers.map((member, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-700/50 border border-gray-600"
                    >
                      <span className="text-xs text-gray-300 truncate max-w-[60px]">
                        {member.name}
                      </span>
                      {member.badge === 'gold' && <Crown className="w-3 h-3 text-amber-400" />}
                      {member.badge === 'silver' && <Award className="w-3 h-3 text-slate-300" />}
                      {member.badge === 'bronze' && <Sparkles className="w-3 h-3 text-amber-600" />}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowGamification(false)}
                className="text-gray-500 hover:text-gray-300"
              >
                <span className="text-xs">Ocultar</span>
              </button>
            </div>
          </motion.div>
        )}
      </CardHeader>

      {/* Mensagens */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[500px]">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm mb-2">Seja o primeiro a enviar uma mensagem!</p>
            <p className="text-gray-600 text-xs">Use os emojis abaixo para interagir rapidamente 👇</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.message_type === 'prayer_request' ? 'bg-pink-900/20 border border-pink-500/30' : 'bg-gray-700/50'} rounded-lg p-3 ${msg.is_pinned ? 'ring-2 ring-amber-500' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.user_type === 'admin' ? (
                  <Shield className="w-3 h-3 text-amber-400" />
                ) : msg.user_type === 'member' ? (
                  <Crown className="w-3 h-3 text-indigo-400" />
                ) : (
                  <User className="w-3 h-3 text-gray-400" />
                )}
                <span className={`text-sm font-medium ${msg.user_type === 'admin' ? 'text-amber-400' : msg.user_type === 'member' ? 'text-indigo-300' : 'text-gray-300'}`}>
                  {msg.user_name}
                </span>
                {msg.user_type === 'member' && (
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px] px-1">
                    Membro
                  </Badge>
                )}
                {msg.user_type === 'visitor' && (
                  <Badge variant="outline" className="text-[10px] px-1 border-gray-600 text-gray-400">
                    Visitante
                  </Badge>
                )}
                <span className="text-xs text-gray-500">{formatTime(msg.created_at)}</span>
                {msg.is_pinned && <span className="text-xs text-amber-400">📌</span>}
              </div>
              {msg.message_type === 'prayer_request' ? (
                <p className="text-sm text-pink-300">🙏 {msg.message}</p>
              ) : (
                <p className="text-sm text-gray-200">{msg.message}</p>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Reações Rápidas */}
      <div className="shrink-0 border-t border-gray-700 bg-gray-800/50 p-2">
        <p className="text-xs text-gray-400 text-center mb-2">Reações rápidas</p>
        <div className="flex justify-center gap-2">
          {quickReactions.map((reaction) => (
            <button
              key={reaction.emoji}
              onClick={() => sendReaction(reaction)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-700/50 transition-all active:scale-110 group"
              title={reaction.label}
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">{reaction.emoji}</span>
              <span className="text-[10px] text-gray-500 group-hover:text-gray-300">{reaction.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-gray-700 p-3 space-y-2">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Digite sua mensagem..."
            className="bg-gray-700 border-gray-600 text-white"
          />
          <Button onClick={sendMessage} size="icon" className="bg-blue-600 hover:bg-blue-700 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={sendPrayerRequest} variant="outline" size="sm" className="flex-1 border-pink-600 text-pink-400 hover:bg-pink-900/20 gap-1 text-xs">
            🙏 Ore por mim
          </Button>
          <Button onClick={() => sendReaction(quickReactions[1])} variant="outline" size="sm" className="flex-1 border-amber-600 text-amber-400 hover:bg-amber-900/20 gap-1 text-xs">
            ❤️ Amém
          </Button>
        </div>
      </div>
    </Card>
  );
}
