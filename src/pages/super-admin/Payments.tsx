/**
 * Super Admin - Pagamentos
 * ============================================
 * URL: /super-admin/billing/payments
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Filter, ArrowLeft, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminPayments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ status: 'paid', payment_method: '' });

  useEffect(() => {
    loadPayments();
  }, [filters]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pagination.page.toString(), limit: '20', ...filters });
      const response = await fetch(`http://localhost:3000/api/admin/billing/payments?${params}`, {
        headers: { 'x-user-role': 'super_admin' },
      });
      const result = await response.json();
      if (result.success) {
        setPayments(result.data.payments);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      toast.error('Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      const url = `http://localhost:3000/api/admin/billing/export-pdf/payments`;
      
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
        downloadLink.download = `pagamentos-${new Date().toISOString().split('T')[0]}.pdf`;
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

  const methodColors: Record<string, string> = {
    credit_card: 'bg-blue-500',
    pix: 'bg-green-500',
    boleto: 'bg-orange-500',
    bank_transfer: 'bg-purple-500',
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
            <CreditCard className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Pagamentos</span>
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
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filters.payment_method}
                  onChange={(e) => setFilters({ ...filters, payment_method: e.target.value })}
                >
                  <option value="">Todos Métodos</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="pix">PIX</option>
                  <option value="boleto">Boleto</option>
                  <option value="bank_transfer">Transferência</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pagamentos ({pagination.total})</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div></div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum pagamento encontrado</div>
            ) : (
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="py-3 px-4">Igreja</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4">Método</th>
                    <th className="py-3 px-4">Data Pagamento</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((pay: any) => (
                    <tr key={pay.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold">{pay.church_name}</p>
                          <p className="text-xs text-muted-foreground">{pay.church_email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">R$ {parseFloat(pay.amount).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <Badge className={methodColors[pay.payment_method as keyof typeof methodColors]}>
                          {pay.payment_method}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{pay.paid_date ? new Date(pay.paid_date).toLocaleDateString('pt-BR') : '-'}</td>
                      <td className="py-3 px-4"><Badge className="bg-green-500">{pay.status}</Badge></td>
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
