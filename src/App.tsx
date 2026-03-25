/**
 * Igreja Connect - App Principal
 * Plataforma Multi-Tenant para Igrejas
 */

import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas
const LandingPage = lazy(() => import("./pages/LandingPage"));
const CreateChurch = lazy(() => import("./pages/CreateChurch"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const SobreNos = lazy(() => import("./pages/SobreNos"));
const ContatoInstitucional = lazy(() => import("./pages/ContatoInstitucional"));
const Blog = lazy(() => import("./pages/Blog"));
const TermosDeUso = lazy(() => import("./pages/TermosDeUso"));
const LGPD = lazy(() => import("./pages/LGPD"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <BrowserRouter future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}>
          <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          }>
            <Routes>
              {/* Domínio Principal - Landing Page Institucional */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/criar" element={<CreateChurch />} />
              <Route path="/login" element={<Login />} />
              
              {/* Páginas Institucionais (FORA DO LAYOUT) */}
              <Route path="/sobre-nos" element={<SobreNos />} />
              <Route path="/contato-institucional" element={<ContatoInstitucional />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/termos-de-uso" element={<TermosDeUso />} />
              <Route path="/lgpd" element={<LGPD />} />
              <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />

              {/* Rotas para Igrejas (Subdomínios) - COM LAYOUT */}
              <Route element={<Layout />}>
                <Route path="/home" element={<Home />} />

                {/* Área Administrativa */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/admin/dashboard" element={<LazyAdminDashboard />} />
                  <Route path="/admin/pedidos" element={<LazyAdminPedidos />} />
                  <Route path="/admin/configuracoes" element={<LazyAdminConfig />} />
                </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

// Lazy loading para páginas admin (serão criadas)
const LazyAdminDashboard = lazy(() => import("./pages/admin/Dashboard").catch(() => ({ default: NotFound })));
const LazyAdminPedidos = lazy(() => import("./pages/admin/Pedidos").catch(() => ({ default: NotFound })));
const LazyAdminConfig = lazy(() => import("./pages/admin/Configuracoes").catch(() => ({ default: NotFound })));

export default App;
