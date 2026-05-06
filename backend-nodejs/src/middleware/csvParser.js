/**
 * CSV Parser Middleware
 * ============================================
 * Parser simples e seguro para arquivos CSV.
 * 
 * Uso:
 * const records = parseCSV(content);
 */

/**
 * Parse de uma linha CSV respeitando aspas
 * Ex: "João Silva","joao@email.com" → ['João Silva', 'joao@email.com']
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Adicionar último campo
  result.push(current.trim());
  
  return result;
}

/**
 * Parse de conteúdo CSV completo
 * @param {string} content - Conteúdo do arquivo CSV
 * @returns {Array<Object>} - Array de objetos com os dados
 */
export function parseCSV(content) {
  if (!content || content.trim().length === 0) {
    return [];
  }
  
  try {
    // Dividir em linhas e remover linhas vazias
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 2) {
      return []; // Precisa de header + pelo menos 1 linha de dados
    }
    
    // Parse do header (primeira linha)
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    
    // Parse dos dados
    const records = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const record = {};
      
      // Mapear valores para headers
      headers.forEach((header, index) => {
        // Remover aspas extras se existir
        let value = values[index] || '';
        value = value.replace(/^"|"$/g, '').trim();
        
        record[header] = value;
      });
      
      records.push(record);
    }
    
    return records;
  } catch (error) {
    console.error('Erro ao parsear CSV:', error);
    throw new Error('Falha ao processar arquivo CSV');
  }
}

/**
 * Validar se o conteúdo parece ser um CSV válido
 * @param {string} content - Conteúdo do arquivo
 * @returns {boolean}
 */
export function isValidCSV(content) {
  if (!content || content.trim().length === 0) {
    return false;
  }
  
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  
  // Precisa ter pelo menos 2 linhas (header + 1 dado)
  if (lines.length < 2) {
    return false;
  }
  
  // Verificar se tem vírgulas (formato CSV básico)
  const hasCommas = lines.some(line => line.includes(','));
  
  return hasCommas;
}

export default {
  parseCSV,
  isValidCSV
};
