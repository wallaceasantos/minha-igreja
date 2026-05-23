import React from "react";
import MyIcon from "./MyIcon";

interface FooterProps {
  churchName?: string;
  churchDescription?: string;
  churchLogo?: string | null;
  phone?: string;
  email?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
}

export default function Footer({ churchName, churchDescription, churchLogo, phone, email, facebookUrl, instagramUrl, youtubeUrl }: FooterProps) {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const item = document.querySelector(href);
    if (item) {
      item.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-900 overflow-hidden shrink-0 select-none">
      
      {/* Upper Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Logo & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 group">
              {churchLogo ? (
                <img
                  src={churchLogo}
                  alt={churchName || 'Logo da Igreja'}
                  className="w-9 h-9 rounded-lg object-contain bg-white/10 p-0.5 shadow-sm"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  <span className="font-heading tracking-tighter text-amber-300">4</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-heading font-bold text-white leading-tight text-sm sm:text-base">
                  {churchName || 'Igreja do Evangelho'}
                </span>
                <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest leading-none">
                  {churchDescription ? 'Site Oficial' : 'Quadrangular'}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xs">
              Pregando o Evangelho Pleno com integridade, amor e serviço desde fundações de fé. Jesus Salva, Batiza, Cura e Voltará!
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-indigo-400">
              Links Rápidos
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <a href="#inicio" onClick={(e) => handleScrollTo(e, "#inicio")} className="hover:text-amber-400 hover:underline transition-colors cursor-pointer">
                  Início / Topo
                </a>
              </li>
              <li>
                <a href="#sobre" onClick={(e) => handleScrollTo(e, "#sobre")} className="hover:text-amber-400 hover:underline transition-colors cursor-pointer">
                  Sobre Nós (História)
                </a>
              </li>
              <li>
                <a href="#ministerios" onClick={(e) => handleScrollTo(e, "#ministerios")} className="hover:text-amber-400 hover:underline transition-colors cursor-pointer">
                  Ministérios Ativos
                </a>
              </li>
              <li>
                <a href="#cultos" onClick={(e) => handleScrollTo(e, "#cultos")} className="hover:text-amber-400 hover:underline transition-colors cursor-pointer">
                  Horários dos Cultos
                </a>
              </li>
              <li>
                <a href="#eventos" onClick={(e) => handleScrollTo(e, "#eventos")} className="hover:text-amber-400 hover:underline transition-colors cursor-pointer">
                  Próximos Eventos
                </a>
              </li>
            </ul>
          </div>

          {/* Contacts info index */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-indigo-400">
              Fale Conosco
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>Av. Urucará, 1275 - Manaus/AM</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span className="font-mono">{phone || '(92) 98421-3885'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <span className="font-mono">{email || 'contato@igreja.com'}</span>
              </li>
            </ul>
          </div>

          {/* Social icons block */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-indigo-400">
              Siga Nossas Redes
            </h4>
            <p className="text-xs text-slate-400 max-w-xs leading-normal">
              Fique por dentro das lives semanais, mensagens pastorais diárias e fotos de ações locais.
            </p>
            <div className="flex gap-2.5 pt-1">
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors" title="Instagram">
                  📸
                </a>
              )}
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors" title="Facebook">
                  👥
                </a>
              )}
              {youtubeUrl && (
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors" title="YouTube">
                  📺
                </a>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="border-t border-slate-900 bg-slate-950 py-6 text-center text-[11px] sm:text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p>© 2026 {churchName || 'Igreja'}. Todos os direitos reservados.</p>
          <p className="text-slate-600">
            Site oficial criado com <span className="font-semibold text-indigo-500">MinhaIgreja</span> | Proclamando Esperança
          </p>
        </div>
      </div>

    </footer>
  );
}
