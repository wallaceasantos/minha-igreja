import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import MyIcon from "./MyIcon";
import { motion } from "motion/react";
import { ContactMessage } from "../types";

interface ContactSectionProps {
  onSubmitMessage: (msg: Omit<ContactMessage, "id" | "createdAt">) => void;
  churchName?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
}

export default function ContactSection({ onSubmitMessage, churchName, address, neighborhood, city, state, zip, phone, email, facebookUrl, instagramUrl, youtubeUrl }: ContactSectionProps) {
  const [name, setName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || !formEmail.trim()) return;

    onSubmitMessage({
      name,
      email: formEmail,
      phone: formPhone,
      message,
    });

    setSuccess(true);
    setName("");
    setFormEmail("");
    setFormPhone("");
    setMessage("");

    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };

  return (
    <section id="contato" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm transition-all w-full relative overflow-hidden scroll-mt-24">
      <div className="w-full">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="flex justify-center items-center gap-1 text-amber-500 dark:text-amber-400">
            <span className="h-px w-8 bg-amber-500/50" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Fale Conosco</span>
            <span className="h-px w-8 bg-amber-500/50" />
          </div>
          <h2 className="font-heading font-semibold text-3xl sm:text-4xl text-slate-800 dark:text-white tracking-tight">
            Entre em Contato
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400">
            Estamos aqui para ouvir você e sua família. Envie uma mensagem ou nos visite!
          </p>
        </div>

        {/* Form and Map Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* LEFT COLUMN: CONTACT DETAILS & DIRECTIONS (col-span 5) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="font-heading font-semibold text-xl text-slate-800 dark:text-white">
                Informações de Contato
              </h3>
              
              <div className="space-y-4">
                
                {/* Address item */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 shrink-0">
                    <MyIcon name="MapPin" size={18} />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-xs text-slate-450 uppercase tracking-widest leading-none mb-1">
                      Endereço
                    </h4>
                    <p className="text-sm text-slate-650 dark:text-slate-300 font-medium">
                      {address || 'Av. Urucará, 1275'} - {neighborhood || 'Cachoeirinha'} <br />
                      {city || 'Manaus'} - {state || 'AM'}{zip ? `, CEP ${zip}` : ''}
                    </p>
                  </div>
                </div>

                {/* Phone item */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 shrink-0">
                    <MyIcon name="Phone" size={18} />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-xs text-slate-450 uppercase tracking-widest leading-none mb-1">
                      Telefone
                    </h4>
                    <p className="text-sm text-slate-650 dark:text-slate-300 font-mono font-semibold">
                      {phone || '(00) 0000-0000'}
                    </p>
                  </div>
                </div>

                {/* Email item */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 shrink-0">
                    <MyIcon name="Mail" size={18} />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-xs text-slate-450 uppercase tracking-widest leading-none mb-1">
                      E-mail Oficial
                    </h4>
                    <p className="text-sm text-slate-650 dark:text-slate-300 font-mono">
                      {email || 'contato@igreja.com'}
                    </p>
                  </div>
                </div>

              </div>

              {/* Geo Links Buttons for Map Directions */}
              <div className="pt-4 flex flex-wrap gap-3">
                <a
                  href="https://maps.google.com/?q=Av.+Urucar%C3%A1,+1275+-+Cachoeirinha,+Manaus+-+AM,+69065-180"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button variant="outline" size="sm" className="cursor-pointer gap-1.5 text-xs text-slate-700 bg-white">
                    📍 Ver no Google Maps <MyIcon name="ExternalLink" size={12} />
                  </Button>
                </a>

                <a
                  href="https://www.openstreetmap.org/search?query=Av.+Urucar%C3%A1%2C+1275+-+Manaus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button variant="outline" size="sm" className="cursor-pointer gap-1.5 text-xs text-slate-700 bg-white">
                    🗺️ Ver no OpenStreetMap <MyIcon name="ExternalLink" size={12} />
                  </Button>
                </a>
              </div>
            </div>

            {/* Social Media Link Icons */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-850/60 pb-6 shrink-0">
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Redes Sociais Oficiais
              </span>
              <div className="flex items-center gap-2.5">
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-450 rounded-xl transition-all font-semibold text-xs">
                    📸 Instagram
                  </a>
                )}
                {facebookUrl && (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-450 rounded-xl transition-all font-semibold text-xs">
                    👥 Facebook
                  </a>
                )}
                {youtubeUrl && (
                  <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-450 rounded-xl transition-all font-semibold text-xs">
                    📺 YouTube
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: CONTACT MESSAGE SUBMISSION FORM (col-span 7) */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/80 dark:border-slate-850 shadow-md">
              <h3 className="font-heading font-semibold text-xl text-slate-800 dark:text-white mb-1.5">
                Envie-nos Sua Mensagem
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
                Dúvidas sobre batismo, cursos ou visitas? Preencha o formulário abaixo e responderemos em breve.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-1.5">
                    Nome Completo *
                  </label>
                  <Input
                    required
                    placeholder="Digite seu nome legal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-1.5">
                      E-mail de Contato *
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-1.5">
                      Telefone (opcional)
                    </label>
                    <Input
                      type="tel"
                      placeholder="(92) 99999-9999"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-1.5">
                    Sua Mensagem *
                  </label>
                  <Textarea
                    required
                    rows={4}
                    placeholder="Escreva detalhadamente sua mensagem acadêmica, pastoral ou geral..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="resize-none"
                  />
                </div>

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 rounded-xl flex items-center gap-3"
                  >
                    <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-full text-green-600 dark:text-green-400 shrink-0">
                      <MyIcon name="Check" size={14} />
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold text-green-800 dark:text-green-300 block leading-tight">
                        Mensagem Enviada!
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        Obrigado por nos contatar. Sua mensagem foi salva e estará visível na Área Administrativa.
                      </span>
                    </div>
                  </motion.div>
                )}

                <Button type="submit" variant="default" className="w-full cursor-pointer h-11 font-semibold flex gap-2">
                  <MyIcon name="Mail" size={16} /> Enviar Mensagem
                </Button>

              </form>
            </Card>
          </div>

        </div>

      </div>
    </section>
  );
}
