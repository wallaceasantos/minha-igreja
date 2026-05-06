/**
 * Card: Domínio Próprio
 * Exibido na página de Configurações
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/hooks/useDashboard';
import { Globe, Crown, CheckCircle, Clock, AlertCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function DomainCard() {
  const navigate = useNavigate();
  const { church } = useDashboard();
  const [domainRequest, setDomainRequest] = useState<any>(null);

  // Verificar se está no plano Essencial ou superior
  const isEssentialOrHigher = church?.plan_type === 'essencial' || 
                               church?.plan_type === 'premium' || 
                               church?.plan_type === 'enterprise';

  // Status do domínio
  const hasDomain = false; // TODO: Buscar do banco
  const domainStatus = 'pending'; // pending, active, configured

  return (
    <Card className={`${!isEssentialOrHigher ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">🌐 Domínio Próprio</CardTitle>
              <CardDescription className="text-xs">
                Configure um domínio personalizado
              </CardDescription>
            </div>
          </div>
          {isEssentialOrHigher ? (
            <Badge className="bg-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Incluído
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              <Crown className="w-3 h-3 mr-1" />
              Upgrade
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEssentialOrHigher ? (
          <div className="space-y-4">
            {/* Status Atual */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Status:</span>
                {hasDomain ? (
                  <Badge className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ativo
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    Não configurado
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Seu site atual:</p>
                <p className="font-mono text-xs mt-1">
                  {church?.slug}.plataforma.minhaigreja.com.br
                </p>
              </div>
            </div>

            {/* Botão de Ação */}
            <Button 
              className="w-full gap-2"
              onClick={() => navigate('/admin/configuracoes?tab=domain')}
            >
              {hasDomain ? (
                <>
                  <Globe className="w-4 h-4" />
                  Gerenciar Domínio
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Configurar Domínio Próprio
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            {/* Informações Rápidas */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Domínio grátis no 1º ano (Hostinger)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Configuração em 5 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-blue-600" />
                <span>Propagação: 2-24 horas</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mensagem de Upgrade */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    Disponível no plano Essencial
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Tenha domínio próprio, upload de logo e muito mais!
                  </p>
                </div>
              </div>
            </div>

            <Button 
              className="w-full gap-2"
              variant="outline"
              onClick={() => navigate('/admin/plans')}
            >
              <Crown className="w-4 h-4" />
              Ver Planos e Fazer Upgrade
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
