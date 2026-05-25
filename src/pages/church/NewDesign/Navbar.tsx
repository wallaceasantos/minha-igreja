import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import MyIcon from "./MyIcon";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  onOpenPrayer: () => void;
  onOpenAdmin: () => void;
  churchName?: string;
  churchSlug?: string;
  churchLogo?: string | null;
}

export default function Navbar({ isDarkMode, toggleTheme, onOpenPrayer, onOpenAdmin, churchName, churchSlug, churchLogo }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Detectar se estamos na página de live
  const isLivePage = location.pathname.includes("/ao-vivo");

  // Monitor screen scroll to add backdrop border shadows
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Se estiver na página de live, os links apontam para a página principal
  // Caso contrário, apontam para as seções da página atual
  const navLinks = [
    { label: "Início", href: isLivePage ? `/igreja/${churchSlug}` : "#inicio" },
    { label: "Sobre", href: isLivePage ? `/igreja/${churchSlug}#sobre` : "#sobre" },
    { label: "Ministérios", href: isLivePage ? `/igreja/${churchSlug}#ministerios` : "#ministerios" },
    { label: "Cultos", href: isLivePage ? `/igreja/${churchSlug}#cultos` : "#cultos" },
    { label: "Eventos", href: isLivePage ? `/igreja/${churchSlug}#eventos` : "#eventos" },
    { label: "Depoimentos", href: isLivePage ? `/igreja/${churchSlug}/depoimento` : `/igreja/${churchSlug}/depoimento` },
    { label: "Contato", href: isLivePage ? `/igreja/${churchSlug}#contato` : "#contato" },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileMenuOpen(false);

    // Se for link externo (página principal + âncora), navega normalmente
    if (href.startsWith("/igreja/")) {
      window.location.href = href;
      return;
    }

    // Scroll suave para seções da página atual
    const id = href.replace('#', '');
    const targetElement = document.getElementById(id);

    if (targetElement) {
      // Pequeno delay para garantir que o React finalize o render antes de rolar
      setTimeout(() => {
        const headerOffset = 100;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
        console.log(`✅ Scroll realizado para: #${id}`);
      }, 100);
    } else {
      console.warn(`⚠️ Seção "${id}" não encontrada. Verifique se o ID está correto no componente.`);
    }
  };

  const logoHref = isLivePage ? `/igreja/${churchSlug}` : "#inicio";

  return (
    <nav
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 dark:border-slate-800/40"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* LOGO - Left Section */}
          <a
            href={logoHref}
            className="flex items-center gap-3 group cursor-pointer"
            onClick={(e) => handleLinkClick(e, logoHref)}
          >
            {/* Logo da Igreja ou Ícone Padrão */}
            {churchLogo ? (
              <img
                src={churchLogo}
                alt={churchName || 'Logo da Igreja'}
                className="w-10 h-10 rounded-lg object-contain shadow-sm group-hover:scale-105 transition-transform bg-white/10 p-0.5"
              />
            ) : (
              <div className="relative w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-all">
                <span className="font-heading tracking-tighter text-amber-300">4</span>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white dark:border-slate-950" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-heading font-bold text-slate-800 dark:text-white leading-tight text-sm sm:text-base tracking-tight">
                {churchName || 'Minha Igreja'}
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-indigo-600 dark:text-indigo-400 tracking-wide leading-none truncate max-w-[150px] sm:max-w-none">
                {churchSlug ? `/${churchSlug}` : ''}
              </span>
            </div>
          </a>

          {/* DESKTOP LINKS - Central Right */}
          <div className="hidden lg:flex items-center gap-5">
            <div className="flex items-center gap-1.5 bg-slate-100/60 dark:bg-slate-900/60 p-1.5 rounded-full border border-slate-200/40 dark:border-slate-800/20">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-amber-400 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Actions Block */}
            <div className="flex items-center gap-2.5">
              {/* Light/Dark Toggler */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Alternar Tema Claro/Escuro"
              >
                <MyIcon name={isDarkMode ? "Sun" : "Moon"} size={18} />
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={onOpenPrayer}
                className="cursor-pointer gap-1.5 text-xs font-semibold border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50/50"
              >
                🙏 Pedir Oração
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={onOpenAdmin}
                className="cursor-pointer gap-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 font-semibold"
              >
                🔐 Área Admin
              </Button>
            </div>
          </div>

          {/* MOBILE BURGER - Toggle Buttons */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors mr-1"
            >
              <MyIcon name={isDarkMode ? "Sun" : "Moon"} size={18} />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              aria-label="Abrir Menu"
            >
              <MyIcon name={mobileMenuOpen ? "X" : "Menu"} size={22} />
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE PANEL EXPANSION */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"
          >
            <div className="px-4 pt-2 pb-6 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-850 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPrayer();
                  }}
                  className="w-full text-xs py-2 gap-1 justify-center cursor-pointer border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400"
                >
                  🙏 Pedir Oração
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full text-xs py-2 gap-1 justify-center bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                >
                  🔐 Área Admin
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
