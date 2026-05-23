/**
 * Admin: Gestão de Membros
 * CRUD completo de membros da igreja
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Filter,
  UserCheck,
  UserX,
  ArrowLeft,
  Globe,
  Copy,
  MessageCircle,
  Gift,
  X,
  Image as ImageIcon,
  Eye,
  Calendar,
  Mail,
  Phone,
  Music,
  Crown,
  FileText,
  Clock,
  User,
  Upload,
  Download,
  Database,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useDashboard } from '@/hooks/useDashboard';
import CSVImportDialog from '@/components/CSVImport';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { buildApiUrl } from '@/lib/config';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Member {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  baptism_date: string | null;
  membership_date: string | null;
  member_status: 'member' | 'visitor' | 'candidate' | 'inactive' | null;
  photo_url: string | null;
  is_active: number;
  created_at: string;
}

interface MemberStats {
  total: number;
  active: number;
  inactive: number;
}

export default function Membros() {
  const navigate = useNavigate();
  const { church } = useDashboard();
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<MemberStats>({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [bulkPinDialogOpen, setBulkPinDialogOpen] = useState(false);
  const [bulkPinLoading, setBulkPinLoading] = useState(false);
  const [bulkPinResults, setBulkPinResults] = useState<any[]>([]);
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [pinMode, setPinMode] = useState<'all' | 'selected'>('all');

  // Obter URL do site público
  const getPublicSiteUrl = () => {
    if (!church?.slug) return '#';
    const isLocalhost = window.location.hostname === 'localhost';
    return isLocalhost 
      ? `http://localhost:5173/church/${church.slug}`
      //: `https://${church.slug}.plataforma.minhaigreja.com.br`;
      : window.location.hostname.includes('railway.app') 
    ? `/church/${church.slug}` 
    : `https://${church.slug}.plataforma.minhaigreja.com.br`;
  };

  // Abrir site público em nova aba
  const handleOpenPublicSite = () => {
    const url = getPublicSiteUrl();
    window.open(url, '_blank');
  };

  // Copiar link do site público
  const handleCopySiteLink = async () => {
    const url = getPublicSiteUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link do site copiado!');
    } catch (error) {
      toast.error('Erro ao copiar link');
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birth_date: '',
    baptism_date: '',
    membership_date: '',
    member_status: 'visitor' as 'member' | 'visitor' | 'candidate' | 'inactive',
    is_active: true,
    photo_url: ''
  });

  // Estados para upload de foto
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para validação de datas
  const [dateErrors, setDateErrors] = useState<{
    birth_date: string;
    baptism_date: string;
    membership_date: string;
  }>({
    birth_date: '',
    baptism_date: '',
    membership_date: ''
  });

  // Converter data do formato brasileiro (DD/MM/AAAA) para Date
  const parseBrazilianDate = (dateString: string | undefined): Date | null => {
    if (!dateString || dateString.length !== 10) return null;
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    
    const [day, month, year] = parts;
    const date = new Date(`${year}-${month}-${day}T00:00:00`);
    
    // Verificar se a data é válida
    if (date.getDate() !== parseInt(day) ||
        date.getMonth() + 1 !== parseInt(month) ||
        date.getFullYear() !== parseInt(year)) {
      return null;
    }
    return date;
  };

  // Validar datas em tempo real
  const validateDates = (field: 'birth_date' | 'baptism_date' | 'membership_date', value: string) => {
    const newValue = value || '';
    const newErrors: {
      birth_date: string;
      baptism_date: string;
      membership_date: string;
    } = {
      birth_date: dateErrors.birth_date,
      baptism_date: dateErrors.baptism_date,
      membership_date: dateErrors.membership_date
    };
    newErrors[field] = '';

    // Se campo vazio, limpar erro (campos opcionais exceto nascimento)
    if (!newValue) {
      if (field === 'birth_date') {
        newErrors.birth_date = 'Data de nascimento é obrigatória';
      }
      setDateErrors(newErrors);
      return newErrors;
    }

    // Validar formato DD/MM/AAAA
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(newValue)) {
      newErrors[field] = 'Formato inválido (use DD/MM/AAAA)';
      setDateErrors(newErrors);
      return newErrors;
    }

    // Validar se a data existe
    const date = parseBrazilianDate(newValue);
    if (!date) {
      newErrors[field] = 'Data inválida';
      setDateErrors(newErrors);
      return newErrors;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Nenhuma data pode ser no futuro
    if (date > today) {
      newErrors[field] = 'Data não pode ser no futuro';
      setDateErrors(newErrors);
      return newErrors;
    }

    // Validações específicas por campo
    if (field === 'birth_date') {
      // Validar idade mínima (0 anos - permite recém-nascidos)
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 0);
      if (date > minAge) {
        newErrors.birth_date = 'Data inválida';
        setDateErrors(newErrors);
        return newErrors;
      }
    }

    if (field === 'baptism_date' && formData.birth_date) {
      const birthDate = parseBrazilianDate(formData.birth_date);
      if (birthDate && date < birthDate) {
        newErrors.baptism_date = 'Batismo deve ser após o nascimento';
        setDateErrors(newErrors);
        return newErrors;
      }
    }

    if (field === 'membership_date' && formData.birth_date) {
      const birthDate = parseBrazilianDate(formData.birth_date);
      if (birthDate && date < birthDate) {
        newErrors.membership_date = 'Membresia deve ser após o nascimento';
        setDateErrors(newErrors);
        return newErrors;
      }
    }

    if (field === 'membership_date' && formData.baptism_date) {
      const baptismDate = parseBrazilianDate(formData.baptism_date);
      if (baptismDate && date < baptismDate) {
        newErrors.membership_date = 'Membresia deve ser após o batismo';
        setDateErrors(newErrors);
        return newErrors;
      }
    }

    setDateErrors(newErrors);
    return newErrors;
  };

  // Lidar com mudança de data (máscara DD/MM/AAAA) com validação em tempo real
  const handleDateChange = (value: string, field: 'birth_date' | 'baptism_date' | 'membership_date') => {
    // Remove caracteres não numéricos
    let digits = value.replace(/\D/g, '');

    // Limita a 8 dígitos (DDMMAAAA)
    digits = digits.slice(0, 8);

    // Adiciona as barras automaticamente
    if (digits.length > 4) {
      digits = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      digits = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    setFormData({ ...formData, [field]: digits });
    
    // Validar apenas se tiver 10 caracteres (data completa)
    if (digits.length === 10) {
      validateDates(field, digits);
    } else {
      // Limpar erro se data incompleta
      setDateErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Lidar com mudança de telefone (máscara (XX) XXXXX-XXXX)
  const handlePhoneChange = (value: string) => {
    // Remove caracteres não numéricos
    let digits = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos (DDD + 9 dígitos)
    digits = digits.slice(0, 11);
    
    // Adiciona a formatação automaticamente
    if (digits.length > 10) {
      digits = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length > 6) {
      digits = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 2) {
      digits = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length > 0) {
      digits = `(${digits}`;
    }
    
    setFormData({ ...formData, phone: digits });
  };

  // Converter telefone para o banco (apenas números)
  const convertPhoneToDatabase = (phoneString: string) => {
    if (!phoneString) return null;
    return phoneString.replace(/\D/g, '');
  };

  // Upload de foto para servidor local
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo inválido', {
        description: 'Por favor, selecione uma imagem (PNG, JPG, GIF, WebP)'
      });
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande', {
        description: 'A imagem deve ter no máximo 5MB'
      });
      return;
    }

    setUploadingPhoto(true);

    try {
      // Upload para Cloudinary
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error('Configuração do Cloudinary ausente. Verifique as variáveis de ambiente.');
      }

      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', uploadPreset);
      formDataUpload.append('folder', 'membros'); // Opcional: organizar em pasta

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formDataUpload
      });

      const data = await response.json();

      if (data.secure_url) {
        setFormData({ ...formData, photo_url: data.secure_url });
        setPhotoPreview(data.secure_url);
        toast.success('Foto carregada com sucesso!', {
          description: 'Não esqueça de salvar o membro'
        });
      } else {
        throw new Error(data.error?.message || 'Erro no upload');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Erro ao carregar foto', {
        description: error instanceof Error ? error.message : 'Tente novamente'
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Remover foto
  const handleRemovePhoto = () => {
    setFormData({ ...formData, photo_url: '' });
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Converter data do formato brasileiro para o banco (AAAA-MM-DD)
  const convertDateToDatabase = (dateString: string) => {
    if (!dateString || dateString.length !== 10) return null;
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    // Validar se é uma data razoável
    if (!year || year.length !== 4) return null;
    const yearNum = parseInt(year);
    if (yearNum < 1900 || yearNum > 2100) return null;
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    loadMembers();
    loadStats();
  }, [statusFilter]);

  const loadMembers = async () => {
    try {
      const churchId = localStorage.getItem('churchId');
      const params = new URLSearchParams({
        church_id: churchId || ''
      });

      // Só adiciona filtro de status se não for 'all'
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      console.log('🔍 Buscando membros com params:', params.toString());

      const response = await fetch(buildApiUrl(`/api/members?${params}`));
      const result = await response.json();

      console.log('📦 Resultado da API:', result);

      if (result.success) {
        setMembers(result.data);
      } else {
        toast.error(result.error || 'Erro ao carregar membros');
      }
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Erro ao carregar membros');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(buildApiUrl(`/api/members/stats/overview?church_id=${churchId}`));
      const result = await response.json();

      if (result.success) {
        setStats({
          total: result.data.total || 0,
          active: result.data.active || 0,
          inactive: result.data.inactive || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = () => {
    loadMembers();
  };

  // Exportar membros em CSV
  const handleExportCSV = () => {
    const churchId = localStorage.getItem('churchId');
    const url = buildApiUrl(`/api/members/export-csv?church_id=${churchId}`);
    
    // Criar link temporário para download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `membros_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Membros exportados com sucesso!');
  };

  // Backup completo dos dados
  const handleBackup = () => {
    const churchId = localStorage.getItem('churchId');
    const url = buildApiUrl(`/api/members/backup?church_id=${churchId}`);
    
    // Criar link temporário para download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `backup_${churchId}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Backup realizado com sucesso!');
  };

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      birth_date: '',
      baptism_date: '',
      membership_date: '',
      member_status: 'visitor',
      is_active: true,
      photo_url: ''
    });
    setPhotoPreview('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (member: Member) => {
    setEditingMember(member);
    // Limpar erros de datas ao abrir edicao
    setDateErrors({ birth_date: '', baptism_date: '', membership_date: '' });
    // Converter data do banco (ISO ou AAAA-MM-DD) para formato brasileiro (DD/MM/AAAA)
    const formatDateToBR = (dateString: string | null): string => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      } catch {
        return '';
      }
    };

    const birthDateBR = formatDateToBR(member.birth_date);
    const baptismDateBR = formatDateToBR(member.baptism_date);
    const membershipDateBR = formatDateToBR(member.membership_date);
    
    // Debug: verificar dados do membro
    console.log('[Editar Membro] Dados do membro:', {
      name: member.name,
      birth_date: member.birth_date,
      baptism_date: member.baptism_date,
      membership_date: member.membership_date,
      birthDateBR,
      baptismDateBR,
      membershipDateBR
    });
    // Converter telefone do banco para formato (XX) XXXXX-XXXX
    let phoneBR = '';
    if (member.phone) {
      const digits = member.phone.replace(/\D/g, '');
      if (digits.length === 11) {
        phoneBR = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      } else if (digits.length === 10) {
        phoneBR = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
      } else {
        phoneBR = member.phone;
      }
    }
    setFormData({
      name: member.name,
      email: member.email || '',
      phone: phoneBR,
      birth_date: birthDateBR,
      baptism_date: baptismDateBR,
      membership_date: membershipDateBR,
      member_status: member.member_status || 'visitor',
      is_active: member.is_active === 1,
      photo_url: member.photo_url || ''
    });
    // Usar URL completa para preview (convertendo localhost para URL de producao)
    setPhotoPreview(member.photo_url ? buildApiUrl(member.photo_url) : '');
    setDialogOpen(true);
    
    // Validar datas carregadas para atualizar estado visual (bordas verdes/vermelhas)
    if (birthDateBR) validateDates('birth_date', birthDateBR);
    if (baptismDateBR) validateDates('baptism_date', baptismDateBR);
    if (membershipDateBR) validateDates('membership_date', membershipDateBR);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todas as datas antes de enviar
    const birthErrors = validateDates('birth_date', formData.birth_date || '');
    const baptismErrors = validateDates('baptism_date', formData.baptism_date || '');
    const membershipErrors = validateDates('membership_date', formData.membership_date || '');
    
    // Verificar se há erros
    const hasErrors = Object.values(birthErrors).some(err => err) || 
                      Object.values(baptismErrors).some(err => err) || 
                      Object.values(membershipErrors).some(err => err);
    
    if (hasErrors) {
      toast.error('Corrija os erros nas datas antes de continuar');
      return;
    }

    try {
      const churchId = localStorage.getItem('churchId');

      // Verificar limite do plano Free antes de cadastrar
      // Permitir se: trial ativo OU plano essencial OU menos de 50 membros
      const trialEndDate = church?.trial_end_date ? new Date(church.trial_end_date) : null;
      const isTrialActive = trialEndDate && trialEndDate > new Date();
      const isEssentialPlan = church?.plan_type === 'essencial';
      const isUnderFreeLimit = stats.total < 50;

      if (!isTrialActive && !isEssentialPlan && !isUnderFreeLimit) {
        toast.error('❌ Limite do plano Free atingido!');
        toast.info('Você pode cadastrar no máximo 50 membros no plano Free. Faça upgrade para o plano Essencial para ter até 200 membros!');
        return;
      }

      // Converter dados para formato do banco
      const formDataToSend = {
        ...formData,
        phone: convertPhoneToDatabase(formData.phone),
        birth_date: convertDateToDatabase(formData.birth_date),
        baptism_date: convertDateToDatabase(formData.baptism_date),
        membership_date: convertDateToDatabase(formData.membership_date),
        photo_url: formData.photo_url || null
      };

      const url = editingMember
        ? buildApiUrl(`/api/members/${editingMember.id}?church_id=${churchId}`)
        : buildApiUrl(`/api/members?church_id=${churchId}`);

      const method = editingMember ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataToSend)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingMember ? 'Membro atualizado!' : 'Membro cadastrado!');
        setDialogOpen(false);
        loadMembers();
        loadStats();
      } else {
        toast.error(result.error || 'Erro ao salvar membro');
      }
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error('Erro ao salvar membro');
    }
  };

  // Enviar PIN de acesso à live via WhatsApp
  const sendPinViaWhatsApp = async (member: Member) => {
    try {
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(buildApiUrl('/api/member/live/regenerate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ church_id: parseInt(churchId || '0'), member_id: member.id }),
      });
      const data = await response.json();
      if (data.success && data.data.whatsapp_url) {
        window.open(data.data.whatsapp_url, '_blank');
        toast.success(`PIN ${data.data.pin} gerado!`);
      }
    } catch (error) {
      toast.error('Erro ao gerar PIN');
    }
  };

  const handleBulkGeneratePins = async () => {
    try {
      setBulkPinLoading(true);
      setBulkPinResults([]);
      const churchId = localStorage.getItem('churchId');
      
      // Define quais membros receberão PINs
      const memberIds = pinMode === 'selected' ? selectedMembers : undefined;

      const r = await fetch(buildApiUrl('/api/member/live/bulk-generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          church_id: parseInt(churchId || '0'),
          member_ids: memberIds
        })
      });
      const d = await r.json();
      if (d.success) {
        setBulkPinResults(d.data.generated);
        toast.success(`${d.data.count} PINs gerados!`);
        setSelectedMembers([]); // Limpa seleção após envio
        setBulkPinDialogOpen(true);
      }
    } catch (e) {
      toast.error('Erro ao gerar PINs');
    } finally {
      setBulkPinLoading(false);
    }
  };

  // Lista filtrada de membros (busca + status)
  const filteredMembersList = members.filter(m => {
    const matchesSearch = !searchTerm || 
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && m.is_active === 1) ||
      (statusFilter === 'inactive' && m.is_active === 0);
    return matchesSearch && matchesStatus;
  });

  // Funções de seleção de membros
  const toggleMemberSelection = (memberId: number) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleAllMembers = () => {
    const filteredIds = filteredMembersList.map(m => m.id);
    if (selectedMembers.length === filteredMembersList.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredIds);
    }
  };

  const isAllSelected = selectedMembers.length > 0 && selectedMembers.length === filteredMembersList.length;
  const isSomeSelected = selectedMembers.length > 0 && selectedMembers.length < filteredMembersList.length;

  const handleDelete = async (memberId: number) => {
    if (!confirm('Tem certeza que deseja excluir este membro?')) return;

    try {
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(buildApiUrl(`/api/members/${memberId}?church_id=${churchId}`), {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Membro excluído!');
        loadMembers();
        loadStats();
      } else {
        toast.error(result.error || 'Erro ao excluir membro');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Erro ao excluir membro');
    }
  };

  // Carregar perfil do membro
  const handleViewProfile = async (memberId: number) => {
    setProfileLoading(true);
    setSelectedMemberProfile(null);
    setProfileDialogOpen(true);

    try {
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(buildApiUrl(`/api/members/${memberId}/profile`), {
        headers: { 'x-church-id': churchId || '' }
      });
      const result = await response.json();

      if (result.success) {
        setSelectedMemberProfile(result.data);
      } else {
        toast.error(result.error || 'Erro ao carregar perfil');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setProfileLoading(false);
    }
  };

  // Ícone para o evento da timeline
  const getTimelineIcon = (eventType: string) => {
    const icons: Record<string, any> = {
      created: User,
      baptism: Calendar,
      membership: UserCheck,
      ministry: Music,
      leader: Crown,
      notes: FileText,
      updated: Clock
    };
    return icons[eventType] || User;
  };

  // Cor para o evento da timeline
  const getTimelineColor = (eventType: string) => {
    const colors: Record<string, string> = {
      created: 'bg-blue-500',
      baptism: 'bg-purple-500',
      membership: 'bg-green-500',
      ministry: 'bg-pink-500',
      leader: 'bg-yellow-500',
      notes: 'bg-gray-500',
      updated: 'bg-blue-400'
    };
    return colors[eventType] || 'bg-gray-500';
  };

  // Enviar mensagem WhatsApp para membro
  const handleWhatsApp = (member: Member) => {
    if (!member.phone) {
      toast.error('Membro não tem telefone cadastrado');
      return;
    }

    const phone = member.phone.replace(/\D/g, '');
    const message = `Olá ${member.name}! Paz do Senhor! 🙏`;
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleToggleStatus = async (member: Member) => {
    try {
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(buildApiUrl(`/api/members/${member.id}?church_id=${churchId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: member.name,
          email: member.email,
          phone: member.phone,
          is_active: !member.is_active
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(member.is_active ? 'Membro inativado!' : 'Membro reativado!');
        loadMembers();
        loadStats();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Erro ao atualizar status');
    }
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
            <h1 className="text-3xl font-bold mb-2">👥 Membros</h1>
            <p className="text-muted-foreground">
              Cadastre e gerencie membros da igreja
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Badge do Site Público */}
          <Badge variant="outline" className="hidden md:flex items-center gap-2 px-3 py-2 bg-primary/5 border-primary/20">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono">{church?.slug || '...'}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenPublicSite}
              className="h-6 px-2 hover:bg-primary/10"
            >
              <Globe className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopySiteLink}
              className="h-6 px-2 hover:bg-primary/10"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </Badge>
          <Button
            variant="outline"
            onClick={handleBackup}
            className="gap-2"
          >
            <Database className="w-4 h-4" />
            Backup JSON
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => setCsvImportOpen(true)}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Importar CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => setBulkPinDialogOpen(true)}
            className="gap-2"
            disabled={selectedMembers.length === 0 && pinMode === 'selected'}
          >
            📩
            {pinMode === 'selected' ? `Enviar PINs (${selectedMembers.length})` : 'Enviar PINs'}
          </Button>
          <Button onClick={handleOpenCreate}>
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Membro
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Membros cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Membros ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Inativos</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Membros inativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Membros</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando membros...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum membro cadastrado</p>
              <p className="text-sm mt-2">
                Comece cadastrando o primeiro membro da igreja
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleAllMembers}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </TableHead>
                  <TableHead>Foto</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Aniversário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembersList.map((member) => (
                  <TableRow key={member.id} className={selectedMembers.includes(member.id) ? 'bg-primary/5' : ''}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => toggleMemberSelection(member.id)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </TableCell>
                    <TableCell>
                      {member.photo_url ? (
                        <img
                          src={buildApiUrl(member.photo_url)}
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Users className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email || '-'}</TableCell>
                    <TableCell>{member.phone || '-'}</TableCell>
                    <TableCell>
                      {member.birth_date ? (
                        <Badge variant="outline" className="text-primary">
                          <Gift className="w-3 h-3 mr-1" />
                          {new Date(member.birth_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.is_active ? 'default' : 'secondary'}>
                        {member.is_active ? (
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
                    <TableCell>
                      {new Date(member.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProfile(member.id)}
                          title="Ver perfil completo"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleWhatsApp(member)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(member)}
                        >
                          {member.is_active ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(member)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(member.id)}
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

      {/* Dialog de Seleção de PINs */}
      <Dialog open={bulkPinDialogOpen} onOpenChange={(open) => { setBulkPinDialogOpen(open); if (!open) setBulkPinResults([]); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📩 Enviar PINs de Acesso à Live</DialogTitle>
          </DialogHeader>
          {bulkPinResults.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✅ {bulkPinResults.length} PINs gerados com sucesso!</p>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {bulkPinResults.map((result: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{result.member_name}</p>
                      <p className="text-sm text-gray-500">{result.member_phone || 'Sem telefone'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-lg">{result.pin}</Badge>
                      {result.whatsapp_url && (
                        <a href={result.whatsapp_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="gap-1">
                            <MessageCircle className="w-3 h-3" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                <button
                  onClick={() => setPinMode('all')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${pinMode === 'all' ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <p className="font-medium">👥 Todos os Membros</p>
                  <p className="text-sm text-gray-500">{stats.active} membros ativos</p>
                </button>
                <button
                  onClick={() => setPinMode('selected')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${pinMode === 'selected' ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'}`}
                  disabled={selectedMembers.length === 0}
                >
                  <p className="font-medium">✅ Membros Selecionados</p>
                  <p className="text-sm text-gray-500">{selectedMembers.length} selecionados</p>
                </button>
              </div>

              {pinMode === 'selected' && selectedMembers.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {members
                    .filter(m => selectedMembers.includes(m.id))
                    .map(m => (
                      <div key={m.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">{m.name}</span>
                      </div>
                    ))}
                </div>
              )}

              <Button
                onClick={handleBulkGeneratePins}
                disabled={bulkPinLoading || (pinMode === 'selected' && selectedMembers.length === 0)}
                className="w-full"
              >
                {bulkPinLoading ? 'Gerando PINs...' : `Gerar PINs para ${pinMode === 'all' ? 'Todos' : `${selectedMembers.length} selecionados`}`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? 'Editar Membro' : 'Novo Membro'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pb-8">
            {/* Upload de Foto */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Foto do membro"
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                      onClick={handleRemovePhoto}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Foto do Membro</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="block w-full text-sm text-muted-foreground
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-primary-foreground
                    hover:file:bg-primary/90
                    disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF ou WebP (máx. 5MB)
                </p>
                {uploadingPhoto && (
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    Carregando foto...
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Nome *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo do membro"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Telefone</label>
              <Input
                type="text"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data de Nascimento *</label>
              <div className="relative">
                <Input
                  type="text"
                  value={formData.birth_date}
                  onChange={(e) => handleDateChange(e.target.value, 'birth_date')}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className={dateErrors.birth_date ? 'border-red-500' : formData.birth_date.length === 10 ? 'border-green-500 focus:border-green-500' : ''}
                />
                {formData.birth_date.length === 10 && !dateErrors.birth_date && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>
              {dateErrors.birth_date && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {dateErrors.birth_date}
                </p>
              )}
              {!dateErrors.birth_date && formData.birth_date.length === 10 && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Data válida
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Formato: DD/MM/AAAA (ex: 16/04/1978)
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data de Batismo</label>
              <Input
                type="text"
                value={formData.baptism_date}
                onChange={(e) => handleDateChange(e.target.value, 'baptism_date')}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className={dateErrors.baptism_date ? 'border-red-500' : formData.baptism_date.length === 10 ? 'border-green-500' : ''}
              />
              {dateErrors.baptism_date && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {dateErrors.baptism_date}
                </p>
              )}
              {!dateErrors.baptism_date && formData.baptism_date.length === 10 && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Data válida
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Data do batismo nas águas (opcional)
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data de Membresia</label>
              <Input
                type="text"
                value={formData.membership_date}
                onChange={(e) => handleDateChange(e.target.value, 'membership_date')}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className={dateErrors.membership_date ? 'border-red-500' : formData.membership_date.length === 10 ? 'border-green-500' : ''}
              />
              {dateErrors.membership_date && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {dateErrors.membership_date}
                </p>
              )}
              {!dateErrors.membership_date && formData.membership_date.length === 10 && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Data válida
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Quando se tornou membro (opcional)
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status do Membro</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={formData.member_status === 'visitor' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, member_status: 'visitor' })}
                  className={formData.member_status === 'visitor' ? 'bg-blue-500' : ''}
                >
                  👋 Visitante
                </Button>
                <Button
                  type="button"
                  variant={formData.member_status === 'candidate' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, member_status: 'candidate' })}
                  className={formData.member_status === 'candidate' ? 'bg-yellow-500' : ''}
                >
                  📋 Candidato
                </Button>
                <Button
                  type="button"
                  variant={formData.member_status === 'member' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, member_status: 'member' })}
                  className={formData.member_status === 'member' ? 'bg-green-500' : ''}
                >
                  ✅ Membro
                </Button>
                <Button
                  type="button"
                  variant={formData.member_status === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, member_status: 'inactive' })}
                  className={formData.member_status === 'inactive' ? 'bg-gray-500' : ''}
                >
                  😴 Inativo
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="is_active" className="text-sm">
                Membro ativo
              </label>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingMember ? 'Salvar Alterações' : 'Cadastrar Membro'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Perfil do Membro */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Perfil do Membro
            </DialogTitle>
          </DialogHeader>

          {profileLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : selectedMemberProfile ? (
            <div className="space-y-6">
              {/* Informações do Membro */}
              <div className="flex items-start gap-4 pb-4 border-b">
                {selectedMemberProfile.member.photo_url ? (
                  <img
                    src={buildApiUrl(selectedMemberProfile.member.photo_url)}
                    alt={selectedMemberProfile.member.name}
                    className="w-20 h-20 rounded-full object-cover border-2"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedMemberProfile.member.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {selectedMemberProfile.member.email || 'Email não informado'}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4" />
                    {selectedMemberProfile.member.phone || 'Telefone não informado'}
                  </p>
                  {selectedMemberProfile.member.ministry && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Music className="w-4 h-4" />
                      {selectedMemberProfile.member.ministry}
                    </p>
                  )}
                  {selectedMemberProfile.member.is_leader === 1 && (
                    <Badge className="mt-2 bg-yellow-500">
                      <Crown className="w-3 h-3 mr-1" />
                      Líder
                    </Badge>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Histórico do Membro
                </h4>
                <div className="space-y-4">
                  {selectedMemberProfile.timeline.length > 0 ? (
                    selectedMemberProfile.timeline.map((event: any) => {
                      const Icon = getTimelineIcon(event.event_type);
                      const colorClass = getTimelineColor(event.event_type);
                      
                      return (
                        <div key={event.id} className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-semibold">{event.event_label}</h5>
                              <span className="text-xs text-muted-foreground">
                                {new Date(event.event_date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum evento no histórico
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Erro ao carregar perfil</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Importação CSV */}
      <CSVImportDialog
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        churchId={localStorage.getItem('churchId') || ''}
        onImportSuccess={() => {
          loadMembers();
          loadStats();
        }}
      />
    </div>
  );
}
