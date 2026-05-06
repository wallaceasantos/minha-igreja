/**
 * Componente: Verificador de Domínio
 * Verifica formato, disponibilidade e DNS básico
 */

import { useState, useEffect } from 'react';
import { Check, X, Loader, AlertCircle, ExternalLink } from 'lucide-react';
import { buildApiUrl } from '@/lib/config';

interface DomainValidationProps {
  domain: string;
  onValidated?: (isValid: boolean) => void;
}

interface ValidationResult {
  isValid: boolean;
  isRegistered: boolean;
  hasDNS: boolean;
  message: string;
  loading: boolean;
}

export default function DomainValidator({ domain, onValidated }: DomainValidationProps) {
  const [result, setResult] = useState<ValidationResult>({
    isValid: false,
    isRegistered: false,
    hasDNS: false,
    message: '',
    loading: false,
  });

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!domain || domain.length < 10) {
        setResult(prev => ({ ...prev, message: '', loading: false }));
        return;
      }

      setResult(prev => ({ ...prev, loading: true }));

      try {
        // 1. Validar formato
        const formatResponse = await fetch(buildApiUrl('/api/admin/domain/validate'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain }),
        });

        const formatResult = await formatResponse.json();

        if (!formatResult.valid) {
          setResult({
            isValid: false,
            isRegistered: false,
            hasDNS: false,
            message: formatResult.message,
            loading: false,
          });
          onValidated?.(false);
          return;
        }

        // 2. Verificar se já está registrado
        const checkResponse = await fetch(
          buildApiUrl(`/api/admin/domain/check?domain=${encodeURIComponent(domain)}`)
        );

        const checkResult = await checkResponse.json();

        if (checkResult.isRegistered) {
          setResult({
            isValid: false,
            isRegistered: true,
            hasDNS: false,
            message: checkResult.message,
            loading: false,
          });
          onValidated?.(false);
          return;
        }

        // 3. Check básico de DNS
        const dnsResponse = await fetch(
          buildApiUrl(`/api/admin/domain/dns-check?domain=${encodeURIComponent(domain)}`)
        );

        const dnsResult = await dnsResponse.json();

        setResult({
          isValid: true,
          isRegistered: false,
          hasDNS: dnsResult.hasDNS,
          message: '✅ Domínio disponível para configuração!',
          loading: false,
        });
        onValidated?.(true);

      } catch (error) {
        console.error('Error validating domain:', error);
        setResult({
          isValid: false,
          isRegistered: false,
          hasDNS: false,
          message: 'Erro ao validar domínio. Tente novamente.',
          loading: false,
        });
        onValidated?.(false);
      }
    }, 500); // Aguarda 500ms após parar de digitar

    return () => clearTimeout(timer);
  }, [domain, onValidated]);

  return (
    <div className="mt-2 space-y-2">
      {result.loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader className="w-4 h-4 animate-spin" />
          Verificando domínio...
        </div>
      )}

      {!result.loading && result.message && (
        <div className={`flex items-start gap-2 text-sm p-3 rounded-lg ${
          result.isValid 
            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {result.isValid ? (
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ) : (
            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
          )}
          <span>{result.message}</span>
        </div>
      )}

      {!result.loading && result.isValid && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-400 mb-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Próximos passos:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-xs">
                <li>Verifique a disponibilidade real do domínio:</li>
                <li>Configure o DNS após aprovação</li>
                <li>Aguarde a propagação (2-24 horas)</li>
              </ol>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <a
              href="https://registro.br/dominio/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              Verificar no Registro.br
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-blue-300">•</span>
            <a
              href="https://www.hostinger.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              Verificar na Hostinger
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
