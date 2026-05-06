/**
 * Super Admin - Faturas
 * ============================================
 * URL: /super-admin/billing/invoices
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Filter, Eye, ArrowLeft, Download } from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';

export default function SuperAdminInvoices() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ status: '', church_id: '' });

  useEffect(() => {
    loadInvoices();
  }, [filters]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pagination.page.toString(), limit: '20', ...filters });
      const response = await fetch(buildApiUrl(`/api/admin/billing/invoices?${params}`), {
        headers: { 'x-user-role': 'super_admin' },
      });
      const result = await response.json();
      if (result.success) {
        setInvoices(result.data.invoices);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      toast.error('Erro ao carregar faturas');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      const url = buildApiUrl(`/api/admin/billing/export-pdf/invoices`);
      
      const response = await fetch(url, {
        headers: {
          'x-user-role': 'super_admin',
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = `faturas-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(blobUrl);
        toast.success('PDF gerado com sucesso!');
      } else {
        toast.error('Erro ao gerar PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500',
    paid: 'bg-green-500',
    overdue: 'bg-red-500',
    cancelled: 'bg-gray-500',
    refunded: 'bg-blue-500',
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" onClick={() => navigate('/super-admin/billing')} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Faturas</span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <Button variant="outline" size="sm" onClick={() => handleExportPdf()}>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">Todos Status</option>
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="overdue">Atrasado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Faturas ({pagination.total})</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div></div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhuma fatura encontrada</div>
            ) : (
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="py-3 px-4">Igreja</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Vencimento</th>
                    <th className="py-3 px-4">Pagamento</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv: any) => (
                    <tr key={inv.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold">{inv.church_name}</p>
                          <p className="text-xs text-muted-foreground">{inv.plan_type}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">R$ {parseFloat(inv.amount).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[inv.status as keyof typeof statusColors]}>{inv.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{new Date(inv.due_date).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 px-4 text-sm">{inv.paid_date ? new Date(inv.paid_date).toLocaleDateString('pt-BR') : '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
