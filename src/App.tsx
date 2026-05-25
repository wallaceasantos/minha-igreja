/**
 * MinhaIgreja - App Principal
 * Plataforma Multi-Tenant para Igrejas
 */

import { lazy, Suspense, useState, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import { buildApiUrl } from '@/lib/config';

// Páginas
const LandingPage = lazy(() => import("./pages/LandingPage"));
const CreateChurch = lazy(() => import("./pages/CreateChurch"));
const Sucesso = lazy(() => import("./pages/Sucesso"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));
const SuperAdminDelinquency = lazy(() => import("./pages/super-admin/SuperAdminDelinquency"));
const SuperAdminDomains = lazy(() => import("./pages/super-admin/SuperAdminDomains"));
const SuperAdminChurches = lazy(() => import("./pages/super-admin/ChurchesList"));
const SuperAdminChurchDetails = lazy(() => import("./pages/super-admin/ChurchDetails"));
const SuperAdminChurchPlans = lazy(() => import("./pages/super-admin/ChurchPlans"));
const SuperAdminUsers = lazy(() => import("./pages/super-admin/UsersList"));
const SuperAdminUserDetails = lazy(() => import("./pages/super-admin/UserDetails"));
const SuperAdminBilling = lazy(() => import("./pages/super-admin/BillingOverview"));
const SuperAdminInvoices = lazy(() => import("./pages/super-admin/Invoices"));
const SuperAdminPayments = lazy(() => import("./pages/super-admin/Payments"));
const SuperAdminAuditLogs = lazy(() => import("./pages/super-admin/AuditLogs"));
const SuperAdminPlans = lazy(() => import("./pages/super-admin/PlansManagement"));
const SuperAdminSettings = lazy(() => import("./pages/super-admin/SystemSettings"));
const SuperAdminTickets = lazy(() => import("./pages/super-admin/SupportTickets"));
const SuperAdminAnnouncements = lazy(() => import("./pages/super-admin/Announcements"));
const SuperAdminReports = lazy(() => import("./pages/super-admin/Reports"));
const SuperAdminSecurity = lazy(() => import("./pages/super-admin/SecurityDashboard"));
const ChurchNew = lazy(() => import("./pages/church/NewDesign/ChurchPage"));
const ChurchLive = lazy(() => import("./pages/church/ChurchLive"));
const TestimonialForm = lazy(() => import("./pages/church/TestimonialForm"));
const Login = lazy(() => import("./pages/Login"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const SobreNos = lazy(() => import("./pages/SobreNos"));
const ContatoInstitucional = lazy(() => import("./pages/ContatoInstitucional"));
const Blog = lazy(() => import("./pages/Blog"));
const TermosDeUso = lazy(() => import("./pages/TermosDeUso"));
const LGPD = lazy(() => import("./pages/LGPD"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Plans = lazy(() => import("./pages/admin/Plans"));
const PedidosOracaoPublico = lazy(() => import("./pages/PedidosOracaoPublico"));
const PedidosOracaoPremium = lazy(() => import("./pages/PedidosOracaoPremium"));

// Componente router para decidir qual página de pedidos mostrar baseado no plano
const PedidosOracaoRouter = () => {
  const { slug } = useParams<{ slug: string }>();
  const [planType, setPlanType] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChurchPlan = async () => {
      try {
        const res = await fetch(buildApiUrl(`/api/church/slug/${slug}`));
        const data = await res.json();
        
        if (data.success) {
          const church = data.data;
          // Verificar trial
          const trialEndDate = church.trial_end_date ? new Date(church.trial_end_date) : null;
          const isTrialActive = trialEndDate && trialEndDate > new Date();
          
          if (isTrialActive || ['essencial', 'premium', 'enterprise'].includes(church.plan_type)) {
            setPlanType('premium');
          } else {
            setPlanType('free');
          }
        }
      } catch (error) {
        console.error('Error loading church plan:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChurchPlan();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return planType === 'premium' ? <PedidosOracaoPremium /> : <PedidosOracaoPublico />;
};

// Lazy Admin Pages
const LazyAdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const LazyAdminConfig = lazy(() => import("./pages/admin/Configuracoes"));
const LazyAdminPedidos = lazy(() => import("./pages/admin/Pedidos"));
const LazyAdminMembros = lazy(() => import("./pages/admin/Membros"));
const LazyAdminEventos = lazy(() => import("./pages/admin/Eventos"));
const LazyAdminCultos = lazy(() => import("./pages/admin/Cultos"));
const LazyAdminMinisterios = lazy(() => import("./pages/admin/Ministerios"));
const LazyAdminTickets = lazy(() => import("./pages/admin/Tickets"));
const LazyAdminChurchGallery = lazy(() => import("./pages/admin/ChurchGallery"));
const LazyAdminLiveStreams = lazy(() => import("./pages/admin/LiveStreams"));
const LazyAdminReviews = lazy(() => import("./pages/admin/Reviews"));
const LazyAdminVerses = lazy(() => import("./pages/admin/Verses"));
const LazyAdminTestimonials = lazy(() => import("./pages/admin/Testimonials"));

// Componente de redirecionamento para rotas antigas /church -> /igreja
const ChurchSlugRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/igreja/${slug}`} replace />;
};

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
              <Route path="/sucesso" element={<Sucesso />} />
              <Route path="/login" element={<Login />} />
              <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/super-admin/delinquency" element={<SuperAdminDelinquency />} />
              <Route path="/super-admin/domains" element={<SuperAdminDomains />} />
              <Route path="/super-admin/churches" element={<SuperAdminChurches />} />
              <Route path="/super-admin/churches/:id" element={<SuperAdminChurchDetails />} />
              <Route path="/super-admin/churches/:id/plans" element={<SuperAdminChurchPlans />} />
              <Route path="/super-admin/users" element={<SuperAdminUsers />} />
              <Route path="/super-admin/users/:id" element={<SuperAdminUserDetails />} />
              <Route path="/super-admin/billing" element={<SuperAdminBilling />} />
              <Route path="/super-admin/billing/invoices" element={<SuperAdminInvoices />} />
              <Route path="/super-admin/billing/payments" element={<SuperAdminPayments />} />
              <Route path="/super-admin/audit-logs" element={<SuperAdminAuditLogs />} />
              <Route path="/super-admin/plans" element={<SuperAdminPlans />} />
              <Route path="/super-admin/settings" element={<SuperAdminSettings />} />
              <Route path="/super-admin/tickets" element={<SuperAdminTickets />} />
              <Route path="/super-admin/tickets/:id" element={<SuperAdminTickets />} />
              <Route path="/super-admin/announcements" element={<SuperAdminAnnouncements />} />
              <Route path="/super-admin/reports" element={<SuperAdminReports />} />
              <Route path="/super-admin/security" element={<SuperAdminSecurity />} />
              
              {/* Preview da Igreja (localhost) - NOVO DESIGN */}
              <Route path="/igreja/:slug" element={<ChurchNew />} />
              <Route path="/igreja/:slug/ao-vivo" element={<ChurchLive />} />
              <Route path="/igreja/:slug/depoimento" element={<TestimonialForm />} />
              <Route path="/igreja" element={<ChurchNew />} />

              {/* Redirecionamento de rotas antigas /church -> /igreja */}
              <Route path="/church/:slug" element={<ChurchSlugRedirect />} />
              <Route path="/church" element={<Navigate to="/igreja" replace />} />

              {/* Páginas Institucionais (FORA DO LAYOUT) */}
              <Route path="/sobre-nos" element={<SobreNos />} />
              <Route path="/contato-institucional" element={<ContatoInstitucional />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/termos-de-uso" element={<TermosDeUso />} />
              <Route path="/lgpd" element={<LGPD />} />
              <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
              <Route path="/pedidos-oracao" element={<PedidosOracaoPublico />} />
              <Route path="/igreja/:slug/pedidos-oracao" element={<PedidosOracaoRouter />} />

              {/* Rotas para Igrejas (Subdomínios) */}

              {/* Área Administrativa */}
              <Route element={<ProtectedRoute />}>
                <Route path="/admin/dashboard" element={<LazyAdminDashboard />} />
                <Route path="/admin/galeria" element={<LazyAdminChurchGallery />} />
                <Route path="/admin/live-streams" element={<LazyAdminLiveStreams />} />
                <Route path="/admin/verses" element={<LazyAdminVerses />} />
                <Route path="/admin/depoimentos" element={<LazyAdminTestimonials />} />
                <Route path="/admin/avaliar" element={<LazyAdminReviews />} />
                <Route path="/admin/configuracoes" element={<LazyAdminConfig />} />
                <Route path="/admin/pedidos" element={<LazyAdminPedidos />} />
                <Route path="/admin/membros" element={<LazyAdminMembros />} />
                <Route path="/admin/eventos" element={<LazyAdminEventos />} />
                <Route path="/admin/plans" element={<Plans />} />
                <Route path="/admin/cultos" element={<LazyAdminCultos />} />
                <Route path="/admin/ministerios" element={<LazyAdminMinisterios />} />
                <Route path="/admin/tickets" element={<LazyAdminTickets />} />
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

export default App;
