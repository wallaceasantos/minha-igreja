/**
 * Admin: Gestão de Ministérios
 * CRUD completo de ministérios da igreja
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Music,
  Users,
  BookOpen,
  Coffee,
  Globe,
  Star,
  Hand,
  Shield,
  Smile,
  Baby,
  Flower,
  Book,
  Mic,
  Video,
  Camera,
  Utensils,
  Home,
  Briefcase,
  Dumbbell,
  Palette,
  Leaf,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Ministry {
  id: number;
  church_id: number;
  name: string;
  description: string | null;
  icon: string;
  display_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// Ícones disponíveis para ministérios
const iconesDisponiveis: Record<string, string> = {
  Heart: '❤️ Coração',
  Music: '🎵 Música',
  Users: '👥 Pessoas',
  BookOpen: '📖 Livro Aberto',
  Coffee: '☕ Café',
  Globe: '🌍 Mundo',
  Star: '⭐ Estrela',
  Smile: '😊 Sorriso',
  Hand: '🤝 Mão',
  Shield: '🛡️ Escudo',
  Baby: '👶 Bebê',
  Flower: '🌸 Flor',
  Book: '📕 Livro',
  Mic: '🎤 Microfone',
  Video: '📹 Vídeo',
  Camera: '📷 Câmera',
  Utensils: '🍴 Utensílios',
  Home: '🏠 Casa',
  Briefcase: '💼 Pasta',
  Dumbbell: '🏋️ Peso',
  Palette: '🎨 Arte',
  Leaf: '🍃 Folha',
};

const ministeriosSugeridos = [
  'Louvor',
  'Crianças',
  'Acolhimento',
  'Missões',
  'Jovens',
  'Mulheres',
  'Homens',
  'Famílias',
  'Idosos',
  'Mídia',
  'Intercessão',
  'Ação Social',
];

// Mapeamento de ícones sugeridos para cada ministério
const iconesPorMinisterio: Record<string, string> = {
  'Louvor': 'Music',
  'Crianças': 'Baby',
  'Acolhimento': 'Coffee',
  'Missões': 'Globe',
  'Jovens': 'Star',
  'Mulheres': 'Flower',
  'Homens': 'Shield',
  'Famílias': 'Home',
  'Idosos': 'Heart',
  'Mídia': 'Video',
  'Intercessão': 'Hand',
  'Ação Social': 'Leaf',
};

export default function Ministerios() {
  const navigate = useNavigate();
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMinistries, setSelectedMinistries] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Heart',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    loadMinistries();
  }, []);

  const loadMinistries = async () => {
    try {
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(`http://localhost:3000/api/ministries?church_id=${churchId}`);
      const result = await response.json();

      if (result.success) {
        setMinistries(result.data);
      }
    } catch (error) {
      console.error('Error loading ministries:', error);
      toast.error('Erro ao carregar ministérios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingMinistry(null);
    setFormData({ 
      name: '',
      description: '',
      icon: 'Heart',
      display_order: ministries.length,
      is_active: true
    });
    setSelectedMinistries([]);
    setDialogOpen(true);
  };

  const handleOpenEdit = (ministry: Ministry) => {
    setEditingMinistry(ministry);
    setFormData({
      name: ministry.name,
      description: ministry.description || '',
      icon: ministry.icon,
      display_order: ministry.display_order,
      is_active: ministry.is_active === 1
    });
    setDialogOpen(true);
  };

  const toggleMinisterioSugerido = (nome: string) => {
    setSelectedMinistries(prev => {
      const isAdding = !prev.includes(nome);
      const newSelection = isAdding
        ? [...prev, nome]
        : prev.filter(m => m !== nome);
      
      // Se estiver adicionando o primeiro ministério sugerido, definir o ícone automaticamente
      if (isAdding && newSelection.length === 1) {
        const iconSugerido = iconesPorMinisterio[nome] || 'Heart';
        setFormData(prev => ({ ...prev, icon: iconSugerido }));
      }
      
      return newSelection;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação: pelo menos um ministério selecionado OU nome preenchido
    if (selectedMinistries.length === 0 && !formData.name.trim()) {
      toast.error('Selecione pelo menos um ministério ou preencha o nome');
      return;
    }
    
    try {
      const churchId = localStorage.getItem('churchId');
      const url = editingMinistry 
        ? `http://localhost:3000/api/ministries/${editingMinistry.id}`
        : `http://localhost:3000/api/ministries`;
      
      const params = new URLSearchParams({ church_id: churchId || '' });
      const method = editingMinistry ? 'PUT' : 'POST';

      // Se for edição, atualiza apenas um ministério
      if (editingMinistry) {
        const response = await fetch(`${url}?${params}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            icon: formData.icon,
            display_order: formData.display_order,
            is_active: formData.is_active
          })
        });

        const result = await response.json();

        if (result.success) {
          toast.success('Ministério atualizado!');
          setDialogOpen(false);
          loadMinistries();
        } else {
          toast.error(result.error || 'Erro ao salvar ministério');
        }
      } else {
        // Se for criação, cria apenas ministérios sugeridos selecionados
        // OU o personalizado (não ambos)
        const promises: Promise<any>[] = [];
        
        if (selectedMinistries.length > 0) {
          // Criar ministérios sugeridos selecionados
          selectedMinistries.forEach((nome, index) => {
            const iconSugerido = iconesPorMinisterio[nome] || 'Heart';
            promises.push(
              fetch(`${url}?${params}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: nome,
                  description: `Ministério de ${nome}`,
                  icon: iconSugerido,
                  display_order: ministries.length + index
                })
              })
            );
          });
        } else if (formData.name.trim()) {
          // Criar apenas o ministério personalizado se não houver selecionados
          promises.push(
            fetch(`${url}?${params}`, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: formData.name,
                description: formData.description,
                icon: formData.icon,
                display_order: ministries.length
              })
            })
          );
        }

        await Promise.all(promises);
        
        toast.success(`${promises.length} ministério(s) cadastrado(s)!`);
        setDialogOpen(false);
        loadMinistries();
      }
    } catch (error) {
      console.error('Error saving ministry:', error);
      toast.error('Erro ao salvar ministério');
    }
  };

  const handleToggleStatus = async (ministry: Ministry) => {
    try {
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(`http://localhost:3000/api/ministries/${ministry.id}?church_id=${churchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ministry.name,
          description: ministry.description,
          icon: ministry.icon,
          display_order: ministry.display_order,
          is_active: !ministry.is_active
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(ministry.is_active ? 'Ministério inativado!' : 'Ministério reativado!');
        loadMinistries();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (ministryId: number) => {
    if (!confirm('Tem certeza que deseja excluir este ministério?')) return;

    try {
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(`http://localhost:3000/api/ministries/${ministryId}?church_id=${churchId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Ministério excluído!');
        loadMinistries();
      } else {
        toast.error(result.error || 'Erro ao excluir ministério');
      }
    } catch (error) {
      console.error('Error deleting ministry:', error);
      toast.error('Erro ao excluir ministério');
    }
  };

  // Renderizar ícone
  const renderIcon = (iconName: string) => {
    const IconComponent = ({
      Heart: Heart,
      Music: Music,
      Users: Users,
      BookOpen: BookOpen,
      Coffee: Coffee,
      Globe: Globe,
      Star: Star,
      Hand: Hand,
      Shield: Shield,
      Smile: Smile,
      Baby: Baby,
      Flower: Flower,
      Book: Book,
      Mic: Mic,
      Video: Video,
      Camera: Camera,
      Utensils: Utensils,
      Home: Home,
      Briefcase: Briefcase,
      Dumbbell: Dumbbell,
      Palette: Palette,
      Leaf: Leaf,
    } as Record<string, any>)[iconName] || Heart;
    
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">🙏 Ministérios</h1>
            <p className="text-muted-foreground">
              Gerencie as áreas de serviço da igreja
            </p>
          </div>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Ministério
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ministérios</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ministries.length}</div>
            <p className="text-xs text-muted-foreground">Ministérios cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ministérios Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {ministries.filter(m => m.is_active === 1).length}
            </div>
            <p className="text-xs text-muted-foreground">Ministérios ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ministérios Inativos</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {ministries.filter(m => m.is_active === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Ministérios inativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Ministries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ministérios da Igreja</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando ministérios...</p>
            </div>
          ) : ministries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum ministério cadastrado</p>
              <p className="text-sm mt-2">
                Comece cadastrando o primeiro ministério
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ícone</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ministries.map((ministry) => (
                  <TableRow key={ministry.id}>
                    <TableCell>
                      {renderIcon(ministry.icon)}
                    </TableCell>
                    <TableCell className="font-medium">{ministry.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {ministry.description || '-'}
                    </TableCell>
                    <TableCell>{ministry.display_order}</TableCell>
                    <TableCell>
                      <Badge variant={ministry.is_active ? 'default' : 'secondary'}>
                        {ministry.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inativo
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(ministry)}
                          title={ministry.is_active ? 'Inativar ministério' : 'Reativar ministério'}
                        >
                          {ministry.is_active ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(ministry)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(ministry.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMinistry ? 'Editar Ministério' : 'Novo Ministério'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingMinistry ? 'Edite as informações do ministério' : 'Cadastre um novo ministério para sua igreja'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingMinistry && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Ou selecione ministérios sugeridos:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {ministeriosSugeridos.map((nome) => (
                    <Button
                      key={nome}
                      type="button"
                      variant={selectedMinistries.includes(nome) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleMinisterioSugerido(nome)}
                      className="justify-start gap-2"
                    >
                      {selectedMinistries.includes(nome) && (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      {!selectedMinistries.includes(nome) && (
                        <span className="text-lg">
                          {(() => {
                            const IconComponent: Record<string, any> = {
                              'Louvor': Music,
                              'Crianças': Baby,
                              'Acolhimento': Coffee,
                              'Missões': Globe,
                              'Jovens': Star,
                              'Mulheres': Flower,
                              'Homens': Shield,
                              'Famílias': Home,
                              'Idosos': Heart,
                              'Mídia': Video,
                              'Intercessão': Hand,
                              'Ação Social': Leaf,
                            };
                            const Icon = IconComponent[nome] || Heart;
                            return <Icon className="w-4 h-4" />;
                          })()}
                        </span>
                      )}
                      <span className="truncate">{nome}</span>
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2 my-4">
                  <div className="h-px bg-flex-1"></div>
                  <span className="text-sm text-muted-foreground">ou</span>
                  <div className="h-px bg-flex-1"></div>
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                {editingMinistry ? 'Nome do Ministério *' : 'Nome personalizado (opcional)'}
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Ministério de Jovens"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Descrição</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Trabalho com jovens de 12 a 18 anos"
                className="min-h-[80px]"
              />
            </div>
            {!editingMinistry && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Ícone</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    {Object.entries(iconesDisponiveis).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Ordem de Exibição</label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="is_active" className="text-sm">
                Ministério ativo
              </label>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingMinistry ? 'Salvar Alterações' : `Cadastrar ${selectedMinistries.length > 0 ? `${selectedMinistries.length} Ministério(s)` : 'Ministério'}`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
