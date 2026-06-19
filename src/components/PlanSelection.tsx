/**
 * Componente: Seleção de Planos
 * Usado no formulário de criação de igreja
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface PlanSelectionProps {
  selectedPlan: 'essencial';
  onSelectPlan: (plan: 'essencial') => void;
  onContinue: () => void;
}

export default function PlanSelection({ selectedPlan, onSelectPlan, onContinue }: PlanSelectionProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Escolha Seu Plano</h1>
        <p className="text-muted-foreground">
          Selecione o plano que melhor se adequa para sua igreja
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Plano Essencial */}
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all ${
            selectedPlan === 'essencial' ? 'border-2 border-primary ring-2 ring-primary' : ''
          }`}
          onClick={() => onSelectPlan('essencial')}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Essencial</CardTitle>
              <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-1 rounded-full">
                
              </span>
            </div>
            <CardDescription>Para igrejas em crescimento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">
              R$ 79,90
              <span className="text-sm font-normal text-muted-foreground">/mês</span>
            </div>
            <ul className="space-y-2 text-left">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Até 200 membros</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Pedidos ILIMITADOS</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>3 administradores</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Domínio próprio</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Upload de logo</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Google Maps</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Analytics</span>
              </li>
            </ul>
            <Button 
              className="w-full" 
              size="lg"
              variant={selectedPlan === 'essencial' ? 'default' : 'outline'}
              onClick={(e) => {
                e.stopPropagation();
                onContinue();
              }}
            >
              {selectedPlan === 'essencial' ? 'Selecionado' : 'Selecionar Essencial'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              60 dias de teste grátis
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
