/**
 * Componente: Importação de Membros via CSV
 * ============================================
 * Permite importar membros em lote a partir de arquivo CSV.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Download, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { buildApiUrl } from '@/lib/config';

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  churchId: string;
  onImportSuccess: () => void;
}

export default function CSVImportDialog({
  open,
  onOpenChange,
  churchId,
  onImportSuccess
}: CSVImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Baixar template CSV
  const handleDownloadTemplate = () => {
    window.open(buildApiUrl(`/api/members/import-template?church_id=${churchId}`), '_blank');
  };

  // Selecionar arquivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar se é CSV
      if (!file.name.endsWith('.csv')) {
        toast.error('Por favor, selecione um arquivo CSV');
        return;
      }
      
      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB.');
        return;
      }
      
      setSelectedFile(file);
      setResult(null);
    }
  };

  // Remover arquivo selecionado
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setResult(null);
  };

  // Importar CSV
  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo CSV');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(buildApiUrl(`/api/members/import-csv?church_id=${churchId}`), {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data);
        toast.success(data.message || 'Importação concluída!');
        onImportSuccess();
      } else {
        toast.error(data.error || 'Erro ao importar CSV');
        setResult(data.data);
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.error('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  // Fechar e limpar
  const handleClose = () => {
    setSelectedFile(null);
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar Membros (CSV)
          </DialogTitle>
          <DialogDescription>
            Importe membros em lote a partir de um arquivo CSV.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Passo 1: Baixar template */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 p-1 rounded text-sm font-semibold">1</span>
              <Label>Baixe o template</Label>
            </div>
            <p className="text-sm text-muted-foreground pl-8">
              Use nosso template para garantir o formato correto
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="ml-8 gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar Template CSV
            </Button>
          </div>

          {/* Passo 2: Selecionar arquivo */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 p-1 rounded text-sm font-semibold">2</span>
              <Label>Selecione o arquivo CSV</Label>
            </div>
            <p className="text-sm text-muted-foreground pl-8">
              Máximo 5MB
            </p>
            
            {!selectedFile ? (
              <div className="ml-8">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
              </div>
            ) : (
              <div className="ml-8 p-4 border rounded-lg bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Passo 3: Resultado */}
          {result && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 p-1 rounded text-sm font-semibold">3</span>
                <Label>Resultado</Label>
              </div>
              
              {result.imported > 0 ? (
                <div className="ml-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="font-semibold text-green-800 dark:text-green-300">
                      {result.imported} membro(s) importado(s)!
                    </p>
                  </div>
                  {result.warnings && result.warnings.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {result.warnings.length} aviso(s)
                      </p>
                      {result.warnings.slice(0, 3).map((w: any, i: number) => (
                        <p key={i} className="text-xs text-amber-600 dark:text-amber-500 ml-6">
                          • {w.name}: {w.warnings.join(', ')}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="ml-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="font-semibold text-red-800 dark:text-red-300">
                      Erros na importação
                    </p>
                  </div>
                  {result.invalidRecords && result.invalidRecords.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {result.invalidRecords.slice(0, 5).map((r: any, i: number) => (
                        <p key={i} className="text-sm text-red-600 dark:text-red-400 ml-6">
                          • Linha {r.line} ({r.nome}): {r.errors.join(', ')}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {result ? 'Fechar' : 'Cancelar'}
          </Button>
          {selectedFile && !result && (
            <Button
              onClick={handleImport}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                'Importando...'
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Importar Membros
                </>
              )}
            </Button>
          )}
          {result && (
            <Button onClick={handleClose} className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Concluir
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
