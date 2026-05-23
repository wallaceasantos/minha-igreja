/**
 * Admin: Transmissões Ao Vivo
 * ============================================
 * Gerenciar lives do YouTube
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Video,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  Youtube,
  Calendar,
  Clock,
  Users,
  Play,
  StopCircle
} from 'lucide-react';
import ReactPlayer from 'react-player/youtube';
import { buildApiUrl } from '@/lib/config';

interface LiveStream {
  id: number;
  title: string;
  description: string | null;
  youtube_url: string | null;
  youtube_video_id: string | null;
  scheduled_start: string | null;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  is_active: number;
  view_count: number;
}

export default function AdminLiveStreams() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [twitchUrl, setTwitchUrl] = useState('');
  const [primaryPlatform, setPrimaryPlatform] = useState('youtube');
  const [scheduledStart, setScheduledStart] = useState('');

  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    try {
      setLoading(true);
      const churchId = localStorage.getItem('churchId');
      
      const response = await fetch(buildApiUrl(`/api/church/${churchId}/live-streams`));
      const result = await response.json();
      
      if (result.success) {
        setStreams(result.data);
      }
    } catch (error) {
      console.error('Error loading streams:', error);
      toast.error('Erro ao carregar transmissões');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const churchId = localStorage.getItem('churchId');
      
      if (!title || (!youtubeUrl && !facebookUrl && !instagramUrl && !twitchUrl)) {
        toast.error('Preencha pelo menos uma URL de plataforma');
        return;
      }

      // Extrair video ID do YouTube se tiver URL
      const videoId = youtubeUrl ? extractVideoId(youtubeUrl) : null;

      const response = await fetch(buildApiUrl(`/api/church/admin/live-streams`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-church-id': churchId || '',
        },
        body: JSON.stringify({
          title,
          description,
          youtube_url: youtubeUrl || null,
          youtube_video_id: videoId,
          facebook_url: facebookUrl || null,
          instagram_url: instagramUrl || null,
          twitch_url: twitchUrl || null,
          primary_platform: primaryPlatform,
          scheduled_start: scheduledStart || null,
          status: 'scheduled',
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Transmissão cadastrada!');
        setDialogOpen(false);
        resetForm();
        loadStreams();
      } else {
        toast.error(result.error || 'Erro ao salvar');
      }
    } catch (error) {
      console.error('Error saving stream:', error);
      toast.error('Erro ao salvar transmissão');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta transmissão?')) return;

    try {
      const response = await fetch(buildApiUrl(`/api/church/admin/live-streams/${id}`), {
        method: 'DELETE',
        headers: {
          'x-church-id': localStorage.getItem('churchId') || '',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Transmissão excluída');
        loadStreams();
      }
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const extractVideoId = (url: string): string | null => {
    if (!url) return null;

    // Remove parâmetros de query primeiro
    const cleanUrl = url.split('?')[0].split('&')[0];

    const patterns = [
      // youtube.com/watch?v=VIDEO_ID
      /[?&]v=([a-zA-Z0-9_-]{11})/,
      // youtu.be/VIDEO_ID
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      // youtube.com/embed/VIDEO_ID
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      // youtube.com/live/VIDEO_ID
      /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
      // youtube.com/shorts/VIDEO_ID
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }

    // Fallback: último segmento da URL limpa
    const parts = cleanUrl.split('/').filter(p => p.length > 0);
    const lastPart = parts[parts.length - 1];
    if (lastPart && /^[a-zA-Z0-9_-]{11}$/.test(lastPart)) {
      return lastPart;
    }

    return null;
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setYoutubeUrl('');
    setFacebookUrl('');
    setInstagramUrl('');
    setTwitchUrl('');
    setPrimaryPlatform('youtube');
    setScheduledStart('');
    setSelectedStream(null);
  };

  // Abrir modal para editar
  const openEditDialog = (stream: LiveStream) => {
    setSelectedStream(stream);
    setTitle(stream.title);
    setDescription(stream.description || '');
    setYoutubeUrl(stream.youtube_url || '');
    setScheduledStart(stream.scheduled_start ? stream.scheduled_start.slice(0, 16) : ''); // Formato datetime-local
    setDialogOpen(true);
  };

  // Atualizar transmissão
  const handleUpdate = async () => {
    if (!selectedStream) return;

    try {
      const churchId = localStorage.getItem('churchId');

      if (!title) {
        toast.error('Preencha o título');
        return;
      }

      const videoId = youtubeUrl ? extractVideoId(youtubeUrl) : selectedStream.youtube_video_id;

      const response = await fetch(buildApiUrl(`/api/church/admin/live-streams/${selectedStream.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-church-id': churchId || '',
        },
        body: JSON.stringify({
          title,
          description,
          youtube_url: youtubeUrl || null,
          youtube_video_id: videoId,
          scheduled_start: scheduledStart || null,
          status: selectedStream.status,
          is_active: selectedStream.is_active,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Transmissão atualizada!');
        setDialogOpen(false);
        resetForm();
        loadStreams();
      } else {
        toast.error(result.error || 'Erro ao atualizar');
      }
    } catch (error) {
      console.error('Error updating stream:', error);
      toast.error('Erro ao atualizar transmissão');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      scheduled: { label: 'Agendada', className: 'bg-blue-500' },
      live: { label: 'AO VIVO', className: 'bg-red-500 animate-pulse' },
      ended: { label: 'Encerrada', className: 'bg-gray-500' },
      cancelled: { label: 'Cancelada', className: 'bg-orange-500' },
    };
    const configItem = config[status as keyof typeof config];
    return (
      <Badge className={configItem?.className}>
        {configItem?.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/dashboard')}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Transmissões Ao Vivo</h1>
            <p className="text-muted-foreground">
              Gerencie as lives do YouTube da sua igreja
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => { resetForm(); setDialogOpen(true); }}>
                <Plus className="w-4 h-4" />
                Nova Transmissão
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedStream ? 'Editar Transmissão' : 'Nova Transmissão Ao Vivo'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Culto de Domingo"
                  />
                </div>

                <div>
                  <Label htmlFor="youtube">URL do YouTube {selectedStream ? '' : '*'}</Label>
                  <Input
                    id="youtube"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cole o link do vídeo ou live do YouTube
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descrição da transmissão..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="scheduled">Agendar para</Label>
                  <Input
                    id="scheduled"
                    type="datetime-local"
                    value={scheduledStart}
                    onChange={(e) => setScheduledStart(e.target.value)}
                  />
                </div>

                <Button onClick={selectedStream ? handleUpdate : handleSave} className="w-full">
                  <Youtube className="w-4 h-4 mr-2" />
                  Salvar Transmissão
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de Transmissões */}
      {streams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma transmissão cadastrada</p>
            <p className="text-sm">Cadastre sua primeira live do YouTube!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <Card key={stream.id} className="overflow-hidden">
              {/* Thumbnail */}
              <div className="aspect-video relative bg-gray-900">
                {stream.youtube_video_id ? (
                  <>
                    <img
                      src={`https://img.youtube.com/vi/${stream.youtube_video_id}/hqdefault.jpg`}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                    {stream.status === 'live' && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-red-600 animate-pulse">
                          <Play className="w-3 h-3 mr-1" />
                          AO VIVO
                        </Badge>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Youtube className="w-12 h-12 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold truncate flex-1">{stream.title}</h3>
                  {getStatusBadge(stream.status)}
                </div>

                {stream.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {stream.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  {stream.scheduled_start && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {(() => {
                        try {
                          const input = stream.scheduled_start!;
                          let date: Date;
                          if (input instanceof Date) {
                            date = input;
                          } else {
                            const isoString = input.replace(' ', 'T') + 'Z';
                            date = new Date(isoString);
                          }
                          return date.toLocaleString('pt-BR', {
                            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                            timeZone: 'America/Manaus'
                          });
                        } catch (e) {
                          return String(stream.scheduled_start);
                        }
                      })()}
                    </div>
                  )}
                  {stream.view_count > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {stream.view_count}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => window.open(stream.youtube_url || '', '_blank')}
                  >
                    <Youtube className="w-3 h-3 mr-1" />
                    Assistir
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(stream)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(stream.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
