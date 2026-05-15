/**
 * Admin: Versículos Curados
 * ============================================
 * Gerenciar versículos que aparecem na live da igreja
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';
import { BookOpen, Plus, Trash2, Save, ArrowUpDown, Eye, EyeOff, Loader2 } from 'lucide-react';

interface Verse {
  id: number;
  church_id: number;
  text: string;
  reference: string;
  is_active: number;
  sort_order: number;
  created_at: string;
}

export default function AdminVerses() {
  const navigate = useNavigate();
  const [churchId, setChurchId] = useState<number | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ text: '', reference: '', sort_order: 0 });

  useEffect(() => {
    loadChurchId();
  }, []);

  useEffect(() => {
    if (churchId) loadVerses();
  }, [churchId]);

  const loadChurchId = () => {
    const stored = localStorage.getItem('churchId');
    if (stored) setChurchId(parseInt(stored));
  };

  const loadVerses = async () => {
    if (!churchId) return;
    try {
      const res = await fetch(buildApiUrl(`/api/church/${churchId}/verses/all`));
      const data = await res.json();
      if (data.success) setVerses(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.text.trim() || !formData.reference.trim()) {
      toast.error('Preencha o versículo e a referência');
      return;
    }
    try {
      setSaving(true);
      const url = editingId
        ? buildApiUrl(`/api/church/admin/verses/${editingId}`)
        : buildApiUrl('/api/church/admin/verses');

      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? { ...formData, church_id: churchId }
        : { ...formData, church_id: churchId };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? 'Versículo atualizado!' : 'Versículo adicionado!');
        setFormData({ text: '', reference: '', sort_order: verses.length });
        setEditingId(null);
        setShowForm(false);
        loadVerses();
      } else {
        toast.error(data.error || 'Erro ao salvar');
      }
    } catch (error) {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (verse: Verse) => {
    setFormData({ text: verse.text, reference: verse.reference, sort_order: verse.sort_order });
    setEditingId(verse.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este versículo?')) return;
    try {
      const res = await fetch(buildApiUrl(`/api/church/admin/verses/${id}`), { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Versículo excluído');
        loadVerses();
      }
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const handleToggleActive = async (verse: Verse) => {
    try {
      const res = await fetch(buildApiUrl(`/api/church/admin/verses/${verse.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...verse, is_active: verse.is_active ? 0 : 1 }),
      });
      if ((await res.json()).success) loadVerses();
    } catch (error) {
      toast.error('Erro ao atualizar');
    }
  };

  if (!churchId) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-600" /> Versículos da Live
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os versículos que aparecem no modal durante a transmissão ao vivo.
          </p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ text: '', reference: '', sort_order: verses.length }); }}>
          <Plus className="w-4 h-4 mr-2" /> Novo Versículo
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Versículo' : 'Adicionar Versículo'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Texto do Versículo *</Label>
              <Textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Porque sou eu que conheço os planos que tenho para vocês..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Referência *</Label>
                <Input
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="Jeremias 29:11"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Ordem de Exibição</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Salvando...</> : <><Save className="w-4 h-4 mr-2" /> Salvar</>}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Versículos */}
      <Card>
        <CardHeader>
          <CardTitle>Versículos Cadastrados ({verses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Carregando...</p>
          ) : verses.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhum versículo cadastrado. Clique em "Novo Versículo" para começar.</p>
          ) : (
            <div className="space-y-3">
              {verses.map((verse) => (
                <div key={verse.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={verse.is_active ? 'default' : 'secondary'} className="bg-purple-600">
                        {verse.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Ordem: {verse.sort_order}</span>
                    </div>
                    <p className="text-sm italic text-gray-700 dark:text-gray-300">"{verse.text}"</p>
                    <p className="text-sm text-purple-600 font-medium mt-1">{verse.reference}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => handleToggleActive(verse)}>
                      {verse.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(verse)}>
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(verse.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
