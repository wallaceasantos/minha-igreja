/**
 * CSV Validator Middleware
 * ============================================
 * Validação de dados de membros importados via CSV.
 * 
 * Uso:
 * const errors = validateMember(record, existingEmails);
 */

/**
 * Validar formato de email
 */
function isValidEmail(email) {
  if (!email) return true; // Email é opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar formato de telefone (aceita vários formatos)
 */
function isValidPhone(phone) {
  if (!phone || phone.trim() === '') return true; // Telefone é opcional
  
  // Remover caracteres não numéricos
  const numbers = phone.replace(/\D/g, '');
  
  // Telefone brasileiro tem 10-11 dígitos (com DDD)
  return numbers.length >= 10 && numbers.length <= 11;
}

/**
 * Validar formato de data (YYYY-MM-DD)
 */
function isValidDate(dateString) {
  if (!dateString || dateString.trim() === '') return true; // Data é opcional
  
  // Verificar formato YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  
  // Verificar se é uma data válida
  const date = new Date(dateString + 'T00:00:00');
  return !isNaN(date.getTime());
}

/**
 * Validar status do membro
 */
function isValidStatus(status) {
  if (!status || status.trim() === '') return true; // Status é opcional
  
  const validStatus = ['member', 'visitor', 'candidate', 'inactive'];
  return validStatus.includes(status.toLowerCase().trim());
}

/**
 * Validar campo booleano (0 ou 1)
 */
function isValidBoolean(value) {
  if (!value || value.trim() === '') return true; // É opcional
  
  return value === '0' || value === '1';
}

/**
 * Validar registro de membro completo
 * @param {Object} record - Dados do membro
 * @param {Array<string>} existingEmails - Emails já cadastrados
 * @returns {Object} - { valid, errors, warnings }
 */
export function validateMember(record, existingEmails = []) {
  const errors = [];
  const warnings = [];
  
  // 1. Nome é obrigatório
  if (!record.nome || record.nome.trim().length < 3) {
    errors.push('Nome deve ter pelo menos 3 caracteres');
  }
  
  // 2. Validar email
  if (record.email) {
    if (!isValidEmail(record.email)) {
      errors.push('Email inválido: ' + record.email);
    } else if (existingEmails.includes(record.email.toLowerCase().trim())) {
      warnings.push('Email já cadastrado: ' + record.email);
    }
  }
  
  // 3. Validar telefone
  if (record.telefone && !isValidPhone(record.telefone)) {
    errors.push('Telefone inválido: ' + record.telefone);
  }
  
  // 4. Validar datas
  if (record.data_nascimento && !isValidDate(record.data_nascimento)) {
    errors.push('Data de nascimento inválida: ' + record.data_nascimento);
  }
  
  if (record.data_batismo && !isValidDate(record.data_batismo)) {
    errors.push('Data de batismo inválida: ' + record.data_batismo);
  }
  
  if (record.data_membros && !isValidDate(record.data_membros)) {
    errors.push('Data de membros inválida: ' + record.data_membros);
  }
  
  // 5. Validar status
  if (record.status && !isValidStatus(record.status)) {
    errors.push('Status inválido: ' + record.status + '. Use: member, visitor, candidate, inactive');
  }
  
  // 6. Validar campo e_lider (booleano)
  if (record.e_lider && !isValidBoolean(record.e_lider)) {
    errors.push('Campo "e_lider" deve ser 0 ou 1');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validar múltiplos registros
 * @param {Array<Object>} records - Lista de registros
 * @param {Array<string>} existingEmails - Emails já cadastrados
 * @returns {Object} - { valid, total, validRecords, invalidRecords }
 */
export function validateMembers(records, existingEmails = []) {
  const validRecords = [];
  const invalidRecords = [];
  const allWarnings = [];
  
  records.forEach((record, index) => {
    const validation = validateMember(record, existingEmails);
    
    if (validation.valid) {
      validRecords.push({
        ...record,
        warnings: validation.warnings
      });
      
      if (validation.warnings.length > 0) {
        allWarnings.push({
          line: index + 2, // +2 porque header é linha 1 e array é 0-based
          nome: record.nome,
          warnings: validation.warnings
        });
      }
    } else {
      invalidRecords.push({
        line: index + 2,
        nome: record.nome || 'Desconhecido',
        errors: validation.errors
      });
    }
  });
  
  return {
    valid: invalidRecords.length === 0,
    total: records.length,
    validCount: validRecords.length,
    invalidCount: invalidRecords.length,
    validRecords,
    invalidRecords,
    warnings: allWarnings
  };
}

export default {
  validateMember,
  validateMembers,
  isValidEmail,
  isValidPhone,
  isValidDate,
  isValidStatus
};
