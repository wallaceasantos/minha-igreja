/**
 * Admin: Pedidos de Oração
 * Gerenciamento de pedidos de oração
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, CheckCircle, Clock, Trash2, Eye } from 'lucide-react';

interface Pedido {
  id: number;
  name: string;
  email: string;
  request: string;
  date: string;
  status: 'pending' | 'answered' | 'archived';
}

// Dados mockados (serão substituídos por API)
const mockPedidos: Pedido[] = [];

export default function AdminPedidos() {
  const [pedidos] = useState<Pedido[]>(mockPedidos);
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');

  const filteredPedidos = pedidos.filter(pedido => {
    if (filter === 'all') return true;
    if (filter === 'pending') return pedido.status === 'pending';
    if (filter === 'answered') return pedido.status === 'answered';
    return true;
  });

  return (
    <div className="container px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pedidos de Oração</h1>
          <p className="text-muted-foreground">
            Gerencie os pedidos de oração recebidos
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          Todos ({pedidos.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          size="sm"
        >
          Pendentes
        </Button>
        <Button
          variant={filter === 'answered' ? 'default' : 'outline'}
          onClick={() => setFilter('answered')}
          size="sm"
        >
          Atendidos
        </Button>
      </div>

      {/* Lista de Pedidos */}
      {filteredPedidos.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum pedido de oração encontrado
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPedidos.map((pedido) => (
            <Card key={pedido.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{pedido.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{pedido.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {pedido.status === 'pending' && (
                      <span className="flex items-center gap-1 text-sm text-amber-600">
                        <Clock className="h-4 w-4" />
                        Pendente
                      </span>
                    )}
                    {pedido.status === 'answered' && (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Atendido
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{pedido.request}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Atendido
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
