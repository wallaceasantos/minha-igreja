/**
 * Página: LGPD - Lei Geral de Proteção de Dados
 * Informações sobre conformidade com a LGPD
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Shield, Lock, User, Database, Eye, CheckCircle, AlertCircle, Church, Menu, X, LogIn } from 'lucide-react';

export default function LGPD() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Fixo */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <Church className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Igreja Connect</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 ml-auto">
            <a href="/#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Funcionalidades
            </a>
            <a href="/#planos" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Planos
            </a>
            <a href="/#depoimentos" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Depoimentos
            </a>
            <Button variant="ghost" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Link>
            </Button>
            <ModeToggle />
            <Button asChild>
              <Link to="/criar">Criar Minha Igreja</Link>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden ml-auto">
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
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-3">
              <a
                href="/#funcionalidades"
                className="text-sm font-medium py-2 px-3 rounded-md transition-colors hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Funcionalidades
              </a>
              <a
                href="/#planos"
                className="text-sm font-medium py-2 px-3 rounded-md transition-colors hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Planos
              </a>
              <a
                href="/#depoimentos"
                className="text-sm font-medium py-2 px-3 rounded-md transition-colors hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Depoimentos
              </a>
              <Button variant="ghost" asChild className="justify-start">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </Link>
              </Button>
              <Button asChild>
                <Link to="/criar" onClick={() => setMobileMenuOpen(false)}>
                  Criar Minha Igreja
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1">
        <section className="py-20 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <Shield className="h-20 w-20 text-primary mx-auto mb-6" />
                <h1 className="text-4xl font-bold text-primary mb-4">
                  LGPD - Lei Geral de Proteção de Dados
                </h1>
                <p className="text-lg text-muted-foreground">
                  Como o Igreja Connect protege seus dados e está em conformidade com a Lei nº 13.709/2018
                </p>
              </div>

              {/* O Que é LGPD */}
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">O Que é a LGPD?</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                  <p>
                    A <strong>Lei Geral de Proteção de Dados Pessoais (LGPD)</strong> - Lei nº 13.709/2018
                    é a legislação brasileira que regula as atividades de tratamento e proteção de dados
                    pessoais.
                  </p>
                  <p>
                    A lei tem como objetivo proteger os direitos fundamentais de liberdade e de privacidade
                    e o livre desenvolvimento da personalidade da pessoa natural.
                  </p>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="font-semibold text-primary mb-2">Principais Pilares:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Transparência no tratamento de dados</li>
                      <li>Finalidade específica e legítima</li>
                      <li>Necessidade e minimização de dados</li>
                      <li>Segurança e prevenção de danos</li>
                      <li>Responsabilização e prestação de contas</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Como Protegemos Seus Dados */}
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Lock className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">Como Protegemos Seus Dados</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <Database className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Criptografia de Dados</h3>
                        <p className="text-sm text-muted-foreground">
                          Todos os dados são criptografados em trânsito (SSL/TLS) e em repouso.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Acesso Restrito</h3>
                        <p className="text-sm text-muted-foreground">
                          Apenas pessoas autorizadas têm acesso aos dados, com autenticação de dois fatores.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Eye className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Isolamento de Dados</h3>
                        <p className="text-sm text-muted-foreground">
                          Cada igreja tem seus dados completamente isolados das demais.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Backups Regulares</h3>
                        <p className="text-sm text-muted-foreground">
                          Backups automáticos diários em servidores seguros e redundantes.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dados que Coletamos */}
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <User className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">Dados que Coletamos</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Dados Pessoais:</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Nome completo</li>
                      <li>Endereço de e-mail</li>
                      <li>Número de telefone</li>
                      <li>CPF (apenas quando necessário para emissão de notas fiscais)</li>
                      <li>Endereço completo</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Dados de Navegação:</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Endereço IP</li>
                      <li>Tipo de navegador e dispositivo</li>
                      <li>Páginas acessadas e tempo de permanência</li>
                      <li>Cookies e tecnologias similares</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Dados da Igreja:</h3>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Nome e CNPJ da igreja</li>
                      <li>Endereço e informações de contato</li>
                      <li>Dados dos membros cadastrados</li>
                      <li>Pedidos de oração e mensagens</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Finalidade do Tratamento */}
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 mb-8">
                <CardHeader>
                  <h2 className="text-2xl font-bold">Finalidade do Tratamento de Dados</h2>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Coletamos e tratamos seus dados pessoais para as seguintes finalidades:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Prestação dos serviços contratados</li>
                    <li>Comunicação com o usuário (e-mails, notificações, suporte)</li>
                    <li>Faturamento e emissão de notas fiscais</li>
                    <li>Melhoria contínua da plataforma</li>
                    <li>Cumprimento de obrigações legais e regulatórias</li>
                    <li>Prevenção a fraudes e segurança</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Seus Direitos */}
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 mb-8">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">Seus Direitos (Titular dos Dados)</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    De acordo com a LGPD, você tem os seguintes direitos:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Confirmação</h3>
                        <p className="text-sm text-muted-foreground">
                          Confirmar a existência de tratamento de dados
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Acesso</h3>
                        <p className="text-sm text-muted-foreground">
                          Acessar seus dados pessoais
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Correção</h3>
                        <p className="text-sm text-muted-foreground">
                          Corrigir dados incompletos, inexatos ou desatualizados
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Anonimização</h3>
                        <p className="text-sm text-muted-foreground">
                          Anonimizar, bloquear ou eliminar dados desnecessários
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Portabilidade</h3>
                        <p className="text-sm text-muted-foreground">
                          Solicitar a portabilidade dos dados
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Eliminação</h3>
                        <p className="text-sm text-muted-foreground">
                          Eliminar dados tratados com consentimento
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Informação</h3>
                        <p className="text-sm text-muted-foreground">
                          Informação sobre entidades com quem compartilhamos dados
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Revogação</h3>
                        <p className="text-sm text-muted-foreground">
                          Revogar o consentimento a qualquer momento
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Como Exercer Seus Direitos */}
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 mb-8">
                <CardHeader>
                  <h2 className="text-2xl font-bold">Como Exercer Seus Direitos</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Para exercer seus direitos previstos na LGPD, entre em contato com nosso
                    <strong> Encarregado de Proteção de Dados (DPO)</strong>:
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <strong>Email:</strong>
                      <a href="mailto:dpo@igrejaconnect.com.br" className="text-primary hover:underline">
                        dpo@igrejaconnect.com.br
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <strong>Telefone:</strong>
                      <span>(11) 99999-9999</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <strong>Correspondência:</strong>
                      <span>Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Prazo de resposta: Até 15 (quinze) dias úteis, conforme previsto na legislação.
                  </p>
                </CardContent>
              </Card>

              {/* Cookies */}
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 mb-8">
                <CardHeader>
                  <h2 className="text-2xl font-bold">Política de Cookies</h2>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                  <p>
                    Utilizamos cookies e tecnologias similares para melhorar sua experiência em nossa
                    plataforma. Você pode gerenciar suas preferências de cookies a qualquer momento.
                  </p>
                  <div>
                    <h3 className="font-semibold mb-2">Tipos de Cookies que Utilizamos:</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Essenciais:</strong> Necessários para o funcionamento da plataforma</li>
                      <li><strong>De desempenho:</strong> Coletam informações anônimas sobre o uso</li>
                      <li><strong>De funcionalidade:</strong> Lembram suas preferências</li>
                      <li><strong>De publicidade:</strong> Não utilizamos para fins publicitários</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Segurança de Dados */}
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 mb-8">
                <CardHeader>
                  <h2 className="text-2xl font-bold">Medidas de Segurança</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Adotamos medidas de segurança técnicas, administrativas e organizacionais para
                      proteger seus dados pessoais:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Criptografia de dados em trânsito e em repouso</li>
                      <li>Controle de acesso rigoroso</li>
                      <li>Monitoramento contínuo de segurança</li>
                      <li>Treinamento regular da equipe</li>
                      <li>Políticas internas de proteção de dados</li>
                      <li>Avaliação periódica de riscos</li>
                      <li>Plano de resposta a incidentes</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Compartilhamento de Dados */}
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 mb-8">
                <CardHeader>
                  <h2 className="text-2xl font-bold">Compartilhamento de Dados</h2>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                  <p>
                    Seus dados pessoais são <strong>compartilhados apenas quando necessário</strong> e
                    com as seguintes finalidades:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Provedores de serviço:</strong> Hospedagem, e-mail marketing, pagamentos</li>
                    <li><strong>Obrigações legais:</strong> Quando exigido por lei ou autoridade competente</li>
                    <li><strong>Proteção de direitos:</strong> Para defender nossos direitos em processos judiciais</li>
                  </ul>
                  <p className="font-semibold">
                    Não vendemos, alugamos ou comercializamos seus dados pessoais com terceiros.
                  </p>
                </CardContent>
              </Card>

              {/* Retenção de Dados */}
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 mb-8">
                <CardHeader>
                  <h2 className="text-2xl font-bold">Retenção de Dados</h2>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                  <p>
                    Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades
                    para as quais foram coletados:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Durante a vigência do contrato:</strong> Enquanto você usar a plataforma</li>
                    <li><strong>Após cancelamento:</strong> Até 5 anos para cumprimento de obrigações legais</li>
                    <li><strong>Dados de navegação:</strong> Até 6 meses, conforme Marco Civil da Internet</li>
                  </ul>
                  <p>
                    Após esses períodos, os dados são eliminados ou anonimizados de forma segura.
                  </p>
                </CardContent>
              </Card>

              {/* Alterações na Política */}
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 mb-8">
                <CardHeader>
                  <h2 className="text-2xl font-bold">Alterações nesta Política</h2>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Esta Política de Privacidade e LGPD pode ser atualizada periodicamente para refletir
                    mudanças em nossas práticas ou na legislação aplicável.
                  </p>
                  <p className="mt-4 text-sm">
                    Última atualização: {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>

              {/* Contato */}
              <Card className="bg-primary/10 border-primary">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">Dúvidas sobre LGPD?</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Se você tiver dúvidas sobre esta política, sobre o tratamento de seus dados ou quiser
                    exercer seus direitos, entre em contato com nosso Encarregado de Proteção de Dados (DPO):
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <strong>Email:</strong>
                      <a href="mailto:dpo@igrejaconnect.com.br" className="text-primary hover:underline">
                        dpo@igrejaconnect.com.br
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <strong>Telefone:</strong>
                      <span>(11) 99999-9999</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-divine-shadow text-white dark:bg-card dark:border-t dark:border-border py-12">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Church className="h-6 w-6" />
                <span className="text-xl font-bold">Igreja Connect</span>
              </div>
              <p className="text-sm text-gray-300 dark:text-muted-foreground">
                Plataforma digital para igrejas que desejam se conectar com membros e visitantes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-300 dark:text-muted-foreground">
                <li><a href="/#funcionalidades" className="hover:text-white dark:hover:text-primary">Funcionalidades</a></li>
                <li><a href="/#planos" className="hover:text-white dark:hover:text-primary">Planos</a></li>
                <li><a href="/criar" className="hover:text-white dark:hover:text-primary">Começar Grátis</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-300 dark:text-muted-foreground">
                <li><a href="/sobre-nos" className="hover:text-white dark:hover:text-primary">Sobre Nós</a></li>
                <li><a href="/contato-institucional" className="hover:text-white dark:hover:text-primary">Contato</a></li>
                <li><a href="/blog" className="hover:text-white dark:hover:text-primary">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-300 dark:text-muted-foreground">
                <li><a href="/termos-de-uso" className="hover:text-white dark:hover:text-primary">Termos de Uso</a></li>
                <li><a href="/politica-privacidade" className="hover:text-white dark:hover:text-primary">Privacidade</a></li>
                <li><a href="/lgpd" className="hover:text-white dark:hover:text-primary">LGPD</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-600 dark:border-border mt-8 pt-6 text-center text-sm text-gray-400 dark:text-muted-foreground">
            <p>Copyright © {new Date().getFullYear()} Igreja Connect. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
