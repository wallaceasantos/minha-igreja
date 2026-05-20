import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export const TextHoverEffect = ({
  text,
  duration,
  className,
}: {
  text: string;
  duration?: number;
  className?: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
    }
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 1000 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className={cn("select-none uppercase cursor-pointer", className)}
    >
      <defs>
        <linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          cx="50%"
          cy="50%"
          r="25%"
        >
          {hovered && (
            <>
              <stop offset="0%" stopColor="#3b82f6" /> {/* Blue 500 */}
              <stop offset="25%" stopColor="#8b5cf6" /> {/* Violet 500 */}
              <stop offset="50%" stopColor="#ec4899" /> {/* Pink 500 */}
              <stop offset="75%" stopColor="#06b6d4" /> {/* Cyan 500 */}
              <stop offset="100%" stopColor="#10b981" /> {/* Emerald 500 */}
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMask)"
          />
        </mask>
      </defs>
      
      {/* Base text outline */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.8"
        className="fill-transparent stroke-muted-foreground/40 font-[helvetica] text-[5rem] font-bold"
        style={{ opacity: hovered ? 0.8 : 0.4 }}
      >
        {text}
      </text>

      {/* Animated drawing text */}
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.8"
        className="fill-transparent stroke-primary/70 font-[helvetica] text-[5rem] font-bold"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{
          strokeDashoffset: 0,
          strokeDasharray: 1000,
        }}
        transition={{
          duration: 4,
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.text>
      
      {/* Gradient reveal text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="0.8"
        mask="url(#textMask)"
        className="fill-transparent font-[helvetica] text-[5rem] font-bold"
      >
        {text}
      </text>
    </svg>
  );
};

export const FooterBackgroundGradient = () => {
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(125% 125% at 50% 10%, hsl(var(--background)) 40%, hsl(var(--primary)/0.1) 100%)",
      }}
    />
  );
};

export const HoverFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background relative w-full overflow-hidden border-t border-border">
      <div className="max-w-7xl mx-auto p-8 md:p-14 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
          {/* Brand section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary fill-primary" />
              <span className="text-3xl font-bold text-primary">MinhaIgreja</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Plataforma completa para igrejas que desejam se conectar com membros e visitantes de forma profissional.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Youtube size={20} /></a>
            </div>
          </div>

          {/* Produto */}
          <div>
            <h4 className="text-foreground text-lg font-semibold mb-6">Produto</h4>
            <ul className="space-y-3">
              <li><a href="/#funcionalidades" className="text-muted-foreground hover:text-primary transition-colors">Funcionalidades</a></li>
              <li><a href="/#planos" className="text-muted-foreground hover:text-primary transition-colors">Planos</a></li>
              <li><a href="/criar" className="text-muted-foreground hover:text-primary transition-colors">Começar Grátis</a></li>
              <li><a href="/login" className="text-muted-foreground hover:text-primary transition-colors">Área do Pastor</a></li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="text-foreground text-lg font-semibold mb-6">Suporte</h4>
            <ul className="space-y-3">
              <li><a href="/contato-institucional" className="text-muted-foreground hover:text-primary transition-colors">Contato</a></li>
              <li><a href="/termos-de-uso" className="text-muted-foreground hover:text-primary transition-colors">Termos de Uso</a></li>
              <li><a href="/politica-privacidade" className="text-muted-foreground hover:text-primary transition-colors">Privacidade</a></li>
              <li><a href="/lgpd" className="text-muted-foreground hover:text-primary transition-colors">LGPD</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-foreground text-lg font-semibold mb-6">Contato</h4>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-muted-foreground">
                <Mail size={18} className="text-primary flex-shrink-0" />
                <span>contato@minhaigreja.com.br</span>
              </li>
              <li className="flex items-center space-x-3 text-muted-foreground">
                <Phone size={18} className="text-primary flex-shrink-0" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center space-x-3 text-muted-foreground">
                <MapPin size={18} className="text-primary flex-shrink-0" />
                <span>São Paulo, SP</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-t border-border my-8" />

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} MinhaIgreja. Todos os direitos reservados.</p>
        </div>
      </div>

      {/* Text hover effect */}
      <div className="absolute bottom-0 left-0 w-full h-[20rem] -mb-10 hidden lg:flex pointer-events-none">
        <TextHoverEffect text="MinhaIgreja" className="z-0 opacity-100" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
};
