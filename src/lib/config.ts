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

/**
 * Constrói URL completa para a API
 * Ex: buildApiUrl('/api/auth/login') → https://minha-igreja.up.railway.app/api/auth/login
 */
export function buildApiUrl(path: string): string {
  // Se path já é URL completa, extrai apenas o caminho (a partir de /api/)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const url = new URL(path);
      // Extrai o pathname (ex: /api/uploads/membros/...)
      path = url.pathname;
    } catch {
      // Se não conseguir parsear, continua com o path original
    }
  }

  // Remove barra inicial se existir
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Se apiUrl termina com /api, remove para evitar duplicação
  let baseUrl = config.apiUrl || '';
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.slice(0, -4);
  }

  return `${baseUrl}/${cleanPath}`;
}

// Validar configurações críticas em desenvolvimento
if (import.meta.env.DEV) {
  if (!config.apiUrl) {
    console.error('❌ VITE_API_URL não definida no .env');
  }
}
