/**
 * Admin: Galeria de Imagens da Igreja
 * ============================================
 * Gerenciar fotos da galeria da igreja
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Image,
  Upload,
  Trash2,
  Edit,
  Plus,
  ArrowLeft,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Link as LinkIcon
} from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { buildApiUrl } from '@/lib/config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GalleryImage {
  id: number;
  image_url: string;
  title: string | null;
  description: string | null;
  display_order: number;
  is_active: number;
}

export default function AdminChurchGallery() {
  const navigate = useNavigate();
  useDashboard(); // Hook para manter contexto, mas não usamos os dados diretamente
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  // Novo estado para URL da imagem (Cloudinary)
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      setLoading(true);
      const churchId = localStorage.getItem('churchId') || '';

      // Usar rota de admin que retorna TODAS as imagens (ativas e inativas)
      const response = await fetch(buildApiUrl(`/api/gallery/admin/church/gallery`), {
        headers: {
          'x-church-id': churchId,
        },
      });
      const result = await response.json();
      
      if (result.success) {
        setImages(result.data);
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
      toast.error('Erro ao carregar galeria');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Validar tipos e tamanhos
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`Arquivo inválido: ${file.name}`, {
          description: 'Apenas imagens são permitidas',
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Arquivo muito grande: ${file.name}`, {
          description: 'Máximo 5MB por arquivo',
        });
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);

    // Criar previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    toast.success(`${validFiles.length} imagem(s) selecionada(s)`);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    // Validar baseado no metodo selecionado
    if (uploadMethod === 'file' && !selectedFiles.length) {
      toast.error('Selecione pelo menos uma imagem');
      return;
    }
    if (uploadMethod === 'url' && !imageUrl) {
      toast.error('Cole o link da imagem');
      return;
    }

    try {
      setUploading(true);
      const churchId = localStorage.getItem('churchId') || '';

      // Se metodo for URL
      if (uploadMethod === 'url') {
        const formData = new FormData();
        formData.append('church_id', String(churchId));
        formData.append('image_url', String(imageUrl));
        formData.append('title', String(title || 'Imagem da Galeria'));
        formData.append('description', String(description || ''));

        const response = await fetch(buildApiUrl('/api/gallery/admin/church/gallery/upload'), {
          method: 'POST',
          headers: { 'x-church-id': churchId },
          body: formData,
        });

        const result = await response.json();
        if (result.success) {
          toast.success('Imagem adicionada com sucesso!');
        } else {
          toast.error('Erro ao adicionar imagem', { description: result.error });
          return;
        }
      } 
      // Se metodo for arquivo
      else {
        const totalFiles = selectedFiles.length;
        let uploadedCount = 0;

        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('church_id', String(churchId));
          formData.append('title', String(title || file.name.split('.')[0] || 'Imagem'));
          formData.append('description', String(description || ''));

          const response = await fetch(buildApiUrl('/api/gallery/admin/church/gallery/upload'), {
            method: 'POST',
            headers: { 'x-church-id': churchId },
            body: formData,
          });

          const result = await response.json();
          if (result.success) {
            uploadedCount++;
            setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
          }
        }
        toast.success(`${uploadedCount} de ${totalFiles} imagem(s) enviada(s)!`);
      }

      // Reset form
      setSelectedFiles([]);
      setPreviewUrls([]);
      setImageUrl('');
      setTitle('');
      setDescription('');
      setUploadProgress(0);

      // Reload gallery
      loadGallery();

      // Close dialog
      setTimeout(() => {
        const closeBtn = document.querySelector('[data-state="open"] button[data-state="closed"]') as HTMLButtonElement | null;
        closeBtn?.click();
      }, 100);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Erro ao enviar imagens');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (image: GalleryImage) => {
    setSelectedImage(image);
    setTitle(image.title || '');
    setDescription(image.description || '');
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedImage) return;

    try {
      const churchId = localStorage.getItem('churchId') || '';
      const response = await fetch(buildApiUrl(`/api/gallery/admin/church/gallery/${selectedImage.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-church-id': churchId,
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Imagem atualizada com sucesso!');
        setEditDialogOpen(false);
        loadGallery();
      } else {
        toast.error(result.error || 'Erro ao atualizar imagem');
      }
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Erro ao atualizar imagem');
    }
  };

  const handleDelete = async () => {
    if (!selectedImage) return;

    try {
      const churchId = localStorage.getItem('churchId') || '';
      const response = await fetch(buildApiUrl(`/api/gallery/admin/church/gallery/${selectedImage.id}`), {
        method: 'DELETE',
        headers: {
          'x-church-id': churchId,
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Imagem deletada com sucesso!');
        setDeleteConfirmOpen(false);
        loadGallery();
      } else {
        toast.error(result.error || 'Erro ao deletar imagem');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Erro ao deletar imagem');
    }
  };

  const handleToggleVisibility = async (image: GalleryImage) => {
    try {
      const churchId = localStorage.getItem('churchId') || '';
      const newStatus = image.is_active === 1 ? 0 : 1;

      console.log('🔄 Toggle visibility:', { imageId: image.id, current: image.is_active, new: newStatus });

      const response = await fetch(buildApiUrl(`/api/gallery/admin/church/gallery/${image.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-church-id': churchId,
        },
        body: JSON.stringify({
          is_active: newStatus,
        }),
      });

      const result = await response.json();
      console.log('📤 Toggle response:', result);

      if (result.success) {
        toast.success(`Imagem ${newStatus === 1 ? 'visível' : 'oculta'}!`);
        loadGallery();
      } else {
        toast.error(result.error || 'Erro ao atualizar visibilidade');
      }
    } catch (error) {
      console.error('❌ Toggle error:', error);
      toast.error('Erro ao atualizar visibilidade');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    await reorderImages(index, index - 1);
  };

  const handleMoveDown = async (index: number) => {
    if (index >= images.length - 1) return;
    await reorderImages(index, index + 1);
  };

  const reorderImages = async (fromIndex: number, toIndex: number) => {
    try {
      const churchId = localStorage.getItem('churchId') || '';
      const newImages = [...images];
      const [moved] = newImages.splice(fromIndex, 1);
      if (!moved) {
        toast.error('Erro ao mover imagem');
        return;
      }
      newImages.splice(toIndex, 0, moved);

      // Update display_order for all images
      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i];
        if (!image) continue;
        await fetch(buildApiUrl(`/api/gallery/admin/church/gallery/${image.id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-church-id': churchId,
          },
          body: JSON.stringify({
            display_order: i,
          }),
        });
      }

      setImages(newImages);
      toast.success('Ordem atualizada!');
    } catch (error) {
      toast.error('Erro ao reordenar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando galeria...</p>
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
            <h1 className="text-4xl font-bold mb-2">Galeria de Imagens</h1>
            <p className="text-muted-foreground">
              Gerencie as fotos da sua igreja
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Foto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novas Fotos</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as 'file' | 'url')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Upload de Arquivo
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" /> Colar Link (Cloudinary)
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="file" className="space-y-4">
                    <div>
                      <Label htmlFor="image">Imagens</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Formatos: JPEG, PNG, WebP (Máx 5MB cada)
                      </p>
                    </div>
                    {previewUrls.length > 0 && (
                      <div>
                        <Label>Previews ({previewUrls.length})</Label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          {previewUrls.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                              <button onClick={() => handleRemoveFile(index)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="url" className="space-y-4">
                    <div>
                      <Label htmlFor="image-url">Link da Imagem</Label>
                      <Input
                        id="image-url"
                        type="url"
                        placeholder="https://res.cloudinary.com/..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Cole o link direto da imagem (Cloudinary, AWS S3, etc.)
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Barra de Progresso */}
                {uploading && (
                  <div>
                    <Label>Progresso</Label>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{uploadProgress}% concluído</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="title">Título (opcional)</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Culto de Domingo" />
                </div>

                <div>
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição da foto..." rows={3} />
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={uploading || (uploadMethod === 'file' && !selectedFiles.length) || (uploadMethod === 'url' && !imageUrl)}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando {uploadProgress}%...
                    </>
                  ) : uploadMethod === 'url' ? (
                    <>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Adicionar por Link
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Enviar {selectedFiles.length} Imagem(ns)
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma imagem na galeria ainda.</p>
            <p className="text-sm">Adicione fotos da sua igreja!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <Card key={image.id} className="group relative overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={image.image_url}
                  alt={image.title || 'Igreja'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleMoveDown(index)}
                    disabled={index >= images.length - 1}
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleToggleVisibility(image)}
                  >
                    {image.is_active === 1 ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(image)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedImage(image);
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold truncate flex-1">
                    {image.title || 'Sem título'}
                  </h3>
                  <Badge variant={image.is_active === 1 ? 'default' : 'secondary'}>
                    {image.is_active === 1 ? 'Visível' : 'Oculto'}
                  </Badge>
                </div>
                {image.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {image.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Foto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedImage && (
              <div>
                <Label>Imagem</Label>
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.title || 'Igreja'}
                  className="mt-2 w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <div>
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleUpdate} className="w-full">
              <Edit className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Imagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A imagem será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
