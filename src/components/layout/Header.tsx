/**
 * Header Genérico para Igrejas
 * Componente limpo e dinâmico
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { useChurch } from '@/hooks/useChurch';
import defaultLogo from '@/assets/church-logo.jpg';

const navigation = [
  { name: 'Início', href: '/home' },
  { name: 'Pedidos de Oração', href: '/pedidos-oracao' },
  { name: 'Contato', href: '/contato' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { church, loading } = useChurch();

  // Usa dados da igreja ou dados padrão (fallback genérico)
  const churchName = church?.name || 'Minha Igreja';
  const churchLogo = church?.logo_url || defaultLogo;

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-3">
            {loading ? (
              <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
            ) : (
              <img
                src={churchLogo}
                alt={churchName}
                className="h-12 w-12 rounded-full object-cover"
              />
            )}
            <div className="hidden sm:block">
              <h1 className="font-heading text-xl font-bold text-primary">
                {loading ? (
                  <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                ) : (
                  churchName
                )}
              </h1>
              <p className="text-sm text-muted-foreground">Comunidade Cristã</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.href
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-primary"
            >
              <Link to="/login">
                <User className="h-4 w-4" />
                Login
              </Link>
            </Button>
            <ModeToggle />
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ModeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium py-2 px-3 rounded-md transition-colors ${
                    location.pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/login"
                className="text-sm font-medium py-2 px-3 rounded-md transition-colors text-foreground hover:bg-muted flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Área Administrativa
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
