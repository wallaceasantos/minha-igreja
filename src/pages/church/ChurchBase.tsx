/**
 * ChurchBase - Componentes Compartilhados para Páginas da Igreja
 * =============================================================
 * Mantido apenas para ChurchHeader e ChurchFooter usados por PedidosOracaoPremium.tsx
 */

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Church, Moon, Sun, Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { useState } from 'react';
import { ModeToggle } from '@/components/mode-toggle';

interface ChurchBaseProps {
  church: any;
  churchSlug: string | undefined;
}

export function ChurchHeader({ church, churchSlug }: ChurchBaseProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Início', href: `/#inicio` },
    { label: 'Sobre', href: `/#sobre` },
    { label: 'Ministérios', href: `/#ministerios` },
    { label: 'Cultos', href: `/#cultos` },
    { label: 'Eventos', href: `/#eventos` },
    { label: 'Contato', href: `/#contato` },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to={`/igreja/${churchSlug}`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Church className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">{church?.name || 'Igreja'}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {link.label}
              </a>
            ))}
            <ModeToggle />
            <Button variant="default" size="sm" asChild>
              <Link to={`/igreja/${churchSlug}/pedidos-oracao`}>Pedidos de Oração</Link>
            </Button>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <ModeToggle />
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t flex flex-col gap-2">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </a>
            ))}
            <Button variant="default" size="sm" asChild onClick={() => setMobileMenuOpen(false)}>
              <Link to={`/igreja/${churchSlug}/pedidos-oracao`}>Pedidos de Oração</Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}

export function ChurchFooter({ church, churchSlug }: ChurchBaseProps) {
  return (
    <footer className="bg-muted/50 border-t py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Church className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg">{church?.name || 'Igreja'}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{church?.description || 'Levando o Evangelho a toda criatura'}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Contato</h4>
            {church?.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{church.phone}</span>
              </div>
            )}
            {church?.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{church.email}</span>
              </div>
            )}
            {(church?.address_street || church?.address_city) && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>
                  {church.address_street && `${church.address_street}, ${church.address_number || ''}`}
                  {church.address_city && ` - ${church.address_city}/${church.address_state || ''}`}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Redes Sociais</h4>
            <div className="flex gap-3">
              {church?.facebook_url && (
                <a href={church.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {church?.instagram_url && (
                <a href={church.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {church?.youtube_url && (
                <a href={church.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-muted/80">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="border-t pt-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {church?.name || 'Igreja'}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
