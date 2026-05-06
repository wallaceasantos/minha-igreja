/**
 * Teste de Senha - Debug
 * Execute: node test-password.js
 */

import bcrypt from 'bcrypt';

const hashCorreto = '$2b$10$6giwtFqlpO/H7z1u6D6DC.9wOzaYQLkroP8H7amusD7fKXlcnbiEa';

console.log('=== TESTE DE SENHA ===\n');

console.log('Hash no banco:', hashCorreto);
console.log('Prefixo:', hashCorreto.substring(0, 7));
console.log('');

// Teste 1: Senha correta
console.log('Teste 1: Senha CORRETA (admin123)');
bcrypt.compare('admin123', hashCorreto)
  .then(valid => {
    console.log('Resultado:', valid ? '✅ VÁLIDO' : '❌ INVÁLIDO');
    console.log('');
  })
  .catch(err => {
    console.error('Erro:', err);
  });

// Teste 2: Senha errada
setTimeout(() => {
  console.log('Teste 2: Senha ERRADA (qualquer123)');
  bcrypt.compare('qualquer123', hashCorreto)
    .then(valid => {
      console.log('Resultado:', valid ? '✅ VÁLIDO (PROBLEMA!)' : '❌ INVÁLIDO (CORRETO)');
      console.log('');
    })
    .catch(err => {
      console.error('Erro:', err);
    });
}, 100);

// Teste 3: Senha vazia
setTimeout(() => {
  console.log('Teste 3: Senha VAZIA ("")');
  bcrypt.compare('', hashCorreto)
    .then(valid => {
      console.log('Resultado:', valid ? '✅ VÁLIDO (PROBLEMA!)' : '❌ INVÁLIDO (CORRETO)');
      console.log('');
    })
    .catch(err => {
      console.error('Erro:', err);
    });
}, 200);

// Teste 4: Gerar novo hash
setTimeout(() => {
  console.log('Teste 4: Gerar NOVO hash para admin123');
  bcrypt.hash('admin123', 10)
    .then(novoHash => {
      console.log('Novo hash:', novoHash);
      console.log('Prefixo:', novoHash.substring(0, 7));
      console.log('');
      
      // Testar novo hash
      console.log('Teste 5: Validar NOVO hash com admin123');
      bcrypt.compare('admin123', novoHash)
        .then(valid => {
          console.log('Resultado:', valid ? '✅ VÁLIDO' : '❌ INVÁLIDO');
        });
    });
}, 300);
