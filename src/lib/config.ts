/**
 * Configurações da Aplicação
 * Carrega variáveis de ambiente com validação
 */

interface EnvConfig {
  apiUrl: string;
  siteUrl: string;
  youtubeChannel: string;
}

function getEnvVariable(name: string): string {
  const value = import.meta.env[name];
  
  if (!value) {
    console.warn(`Variável de ambiente ${name} não definida. Usando valor padrão.`);
    return '';
  }
  
  return value;
}

export const config: EnvConfig = Object.freeze({
  apiUrl: getEnvVariable('VITE_API_URL'),
  siteUrl: getEnvVariable('VITE_SITE_URL'),
  youtubeChannel: getEnvVariable('VITE_YOUTUBE_CHANNEL'),
});

// Validar configurações críticas em desenvolvimento
if (import.meta.env.DEV) {
  if (!config.apiUrl) {
    console.error('❌ VITE_API_URL não definida no .env');
  }
}
