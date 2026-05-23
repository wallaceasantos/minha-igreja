import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import MyIcon from "./MyIcon";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { buildApiUrl } from "@/lib/config";
import { toast } from "sonner";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  churchSlug?: string;
}

export default function AdminModal({ isOpen, onClose, churchSlug }: AdminModalProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(buildApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("adminToken", data.data.token);
        toast.success("Login realizado com sucesso!");
        onClose();
        navigate("/admin/dashboard");
      } else {
        setError(data.error || "Credenciais inválidas");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-10 overflow-hidden"
          >
            {/* Top Accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 to-blue-500" />

            <div className="p-6 md:p-8">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              >
                <MyIcon name="X" size={20} />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="mx-auto w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-full flex items-center justify-center mb-4">
                  <MyIcon name="Lock" size={28} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
                  Área Administrativa
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Acesse o painel administrativo
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Login
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Entre com suas credenciais da igreja
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="pastor@igreja.com"
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Senha</label>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                          Esqueceu a senha?
                        </span>
                      </div>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-950/30 p-2 rounded">
                    <MyIcon name="AlertCircle" size={14} /> {error}
                  </p>
                )}

                <Button type="submit" className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isLoading}>
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>Acessar Painel <MyIcon name="ArrowRight" size={16} /></>
                  )}
                </Button>
              </form>

              {/* Footer Links */}
              <div className="mt-6 space-y-3 text-center border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Não tem uma conta?{" "}
                  <button 
                    onClick={() => { navigate("/criar"); onClose(); }}
                    className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                  >
                    Crie uma igreja grátis
                  </button>
                </p>
                <button 
                  onClick={onClose}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center gap-1 mx-auto"
                >
                  <MyIcon name="ArrowLeft" size={12} /> Voltar ao site da igreja
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
