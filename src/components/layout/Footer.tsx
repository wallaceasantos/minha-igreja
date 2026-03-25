/**
 * Footer Genérico para Igrejas
 * Componente limpo e dinâmico
 */

import { Link } from 'react-router-dom';
import { useChurch } from '@/hooks/useChurch';
import defaultLogo from '@/assets/church-logo.jpg';

export default function Footer() {
  const { church } = useChurch();

  // Usa dados da igreja ou dados padrão (fallback genérico)
  const churchName = church?.name || 'Minha Igreja';
  const churchLogo = church?.logo_url || defaultLogo;
  const churchDescription = church?.description || 'Um lugar de fé, esperança e amor.';
  const address = church?.address_street 
    ? `${church.address_street}, ${church.address_number || 'S/N'} - ${church.address_neighborhood || ''} - ${church.address_city || ''}/${church.address_state || ''}`
    : 'Endereço não informado';

  return (
    <footer className="bg-divine-shadow text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo e Nome da Igreja */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src={churchLogo}
                alt={churchName}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-heading text-lg font-bold">
                  {churchName}
                </h3>
                <p className="text-sm text-gray-300">Comunidade Cristã</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 text-center md:text-left max-w-xs">
              {churchDescription}
            </p>
          </div>

          {/* Links Rápidos */}
          <div className="text-center md:text-left">
            <h4 className="font-heading text-lg font-semibold mb-4">
              Links Rápidos
            </h4>
            <nav className="flex flex-col space-y-2">
              <Link
                to="/home"
                className="text-gray-300 hover:text-golden-light transition-colors"
              >
                Início
              </Link>
              <Link
                to="/pedidos-oracao"
                className="text-gray-300 hover:text-golden-light transition-colors"
              >
                Pedidos de Oração
              </Link>
              <Link
                to="/contato"
                className="text-gray-300 hover:text-golden-light transition-colors"
              >
                Contato
              </Link>
            </nav>
          </div>

          {/* Endereço */}
          <div className="text-center md:text-left">
            <h4 className="font-heading text-lg font-semibold mb-4">
              Nossa Localização
            </h4>
            <address className="not-italic text-gray-300 space-y-1">
              <p>{address}</p>
              {church?.phone && <p>📞 {church.phone}</p>}
              {church?.email && <p>✉️ {church.email}</p>}
            </address>
          </div>
        </div>

        {/* Direitos Autorais */}
        <div className="border-t border-gray-600 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-400">
            Copyright © {new Date().getFullYear()} {churchName}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
