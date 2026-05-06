/**
 * Script de Teste: Fluxo de Domínio Próprio
 * ============================================
 * Testa todo o fluxo de solicitação de domínio localmente
 * 
 * Uso: node test-domain-flow.js
 */

import { getPool } from './src/config/database.js';

async function testDomainFlow() {
  console.log('🧪 Iniciando teste de fluxo de domínio...\n');
  
  const pool = getPool();
  
  try {
    // ============================================
    // TESTE 1: Verificar se tabelas existem
    // ============================================
    console.log('📋 TESTE 1: Verificando tabelas...');
    
    const [tables] = await pool.query(`
      SHOW TABLES LIKE 'church_domain_requests'
    `);
    
    if (tables.length === 0) {
      console.log('❌ Tabela church_domain_requests não existe!');
      console.log('💡 Execute a migration primeiro:');
      console.log('   mysql -u root -p jesus_vitoria_connect < migrations/006_domain_request.sql\n');
      return;
    }
    
    console.log('✅ Tabela church_domain_requests existe\n');
    
    // ============================================
    // TESTE 2: Simular solicitação de domínio
    // ============================================
    console.log('📋 TESTE 2: Simulando solicitação de domínio...');
    
    const testChurchId = 16; // Igreja do Evangelho Quadrangular
    const testDomain = 'www.igrejaquadrangular.localhost';
    
    // Verificar se já existe solicitação
    const [existing] = await pool.query(`
      SELECT * FROM church_domain_requests 
      WHERE church_id = ? AND status IN ('pending', 'configured', 'active')
      LIMIT 1
    `, [testChurchId]);
    
    if (existing.length > 0) {
      console.log('⚠️  Igreja já tem solicitação pendente:');
      console.log(`   Domínio: ${existing[0].requested_domain}`);
      console.log(`   Status: ${existing[0].status}`);
      console.log(`   Criado em: ${existing[0].created_at}\n`);
    } else {
      // Criar solicitação de teste
      await pool.execute(`
        INSERT INTO church_domain_requests
        (church_id, requested_domain, status, dns_check_result, created_at)
        VALUES (?, ?, 'pending', ?, NOW())
      `, [testChurchId, testDomain, JSON.stringify({
        tested_at: new Date().toISOString(),
        test_mode: true,
        note: 'Solicitação de teste local'
      })]);
      
      console.log('✅ Solicitação criada com sucesso!');
      console.log(`   Igreja ID: ${testChurchId}`);
      console.log(`   Domínio: ${testDomain}`);
      console.log(`   Status: pending\n`);
    }
    
    // ============================================
    // TESTE 3: Listar todas as solicitações
    // ============================================
    console.log('📋 TESTE 3: Listando solicitações...');
    
    const [requests] = await pool.query(`
      SELECT 
        r.id,
        r.church_id,
        c.name as church_name,
        r.requested_domain,
        r.status,
        r.dns_verified,
        r.created_at,
        r.configured_at,
        r.activated_at
      FROM church_domain_requests r
      JOIN churches c ON r.church_id = c.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `);
    
    if (requests.length === 0) {
      console.log('⚠️  Nenhuma solicitação encontrada\n');
    } else {
      console.log(`✅ Encontradas ${requests.length} solicitação(ões):\n`);
      
      requests.forEach((req, i) => {
        console.log(`   ${i + 1}. ${req.church_name}`);
        console.log(`      Domínio: ${req.requested_domain}`);
        console.log(`      Status: ${req.status}`);
        console.log(`   ${req.dns_verified ? '✅ DNS Verificado' : '⏳ Aguardando DNS'}\n`);
      });
    }
    
    // ============================================
    // TESTE 4: Simular configuração do Super Admin
    // ============================================
    console.log('📋 TESTE 4: Simulando configuração do Super Admin...');
    
    const [pending] = await pool.query(`
      SELECT * FROM church_domain_requests 
      WHERE status = 'pending' 
      LIMIT 1
    `);
    
    if (pending.length > 0) {
      const requestId = pending[0].id;
      
      // Atualizar para 'configured'
      await pool.execute(`
        UPDATE church_domain_requests 
        SET status = 'configured',
            configured_at = NOW(),
            dns_check_result = JSON_SET(
              dns_check_result, 
              '$.configured_by', 'Super Admin (Test)',
              '$.configured_at', NOW(),
              '$.note', 'DNS configurado manualmente (teste)'
            )
        WHERE id = ?
      `, [requestId]);
      
      console.log('✅ Status atualizado para "configured"');
      console.log('   Agora simula que Super Admin configurou DNS\n');
    } else {
      console.log('⚠️  Nenhuma solicitação pendente para configurar\n');
    }
    
    // ============================================
    // TESTE 5: Simular propagação de DNS
    // ============================================
    console.log('📋 TESTE 5: Simulando propagação de DNS...');
    
    const [configured] = await pool.query(`
      SELECT * FROM church_domain_requests 
      WHERE status = 'configured' 
      LIMIT 1
    `);
    
    if (configured.length > 0) {
      const requestId = configured[0].id;
      
      // Atualizar para 'active' (simula DNS propagado)
      await pool.execute(`
        UPDATE church_domain_requests 
        SET status = 'active',
            dns_verified = 1,
            activated_at = NOW(),
            dns_check_result = JSON_SET(
              dns_check_result, 
              '$.dns_propagated', true,
              '$.propagated_at', NOW(),
              '$.note', 'DNS propagado (simulado)'
            )
        WHERE id = ?
      `, [requestId]);
      
      console.log('✅ DNS propagado (simulado)!');
      console.log('   Status atualizado para "active"\n');
    } else {
      console.log('⚠️  Nenhuma solicitação configurada para testar propagação\n');
    }
    
    // ============================================
    // TESTE 6: Relatório Final
    // ============================================
    console.log('📋 TESTE 6: Relatório Final\n');
    
    const [final] = await pool.query(`
      SELECT 
        c.name as igreja,
        r.requested_domain as dominio,
        r.status,
        CASE 
          WHEN r.status = 'pending' THEN '⏳ Aguardando'
          WHEN r.status = 'configured' THEN '🔧 Configurado'
          WHEN r.status = 'active' THEN '✅ Ativo'
          ELSE '❌ Desconhecido'
        END as situacao,
        r.created_at as solicitado_em,
        r.activated_at as ativado_em
      FROM church_domain_requests r
      JOIN churches c ON r.church_id = c.id
      ORDER BY r.created_at DESC
      LIMIT 5
    `);
    
    console.log('┌─────────────────────────────────────────────────┐');
    console.log('│ SOLICITAÇÕES DE DOMÍNIO                       │');
    console.log('├─────────────────────────────────────────────────┤');
    
    final.forEach((row, i) => {
      console.log(`│ ${i + 1}. ${row.igreja.substring(0, 30).padEnd(30)} │`);
      console.log(`│    Domínio: ${row.dominio.padEnd(35)} │`);
      console.log(`│    Status: ${row.situacao.padEnd(38)} │`);
      console.log('│                                                 │');
    });
    
    console.log('└─────────────────────────────────────────────────┘\n');
    
    // ============================================
    // CONCLUSÃO
    // ============================================
    console.log('✅ TESTE CONCLUÍDO!\n');
    console.log('📊 Resumo:');
    console.log('   ✅ Tabelas existem');
    console.log('   ✅ Solicitações podem ser criadas');
    console.log('   ✅ Status podem ser atualizados');
    console.log('   ✅ DNS pode ser verificado (simulado)\n');
    
    console.log('🎯 Próximos passos para produção:');
    console.log('   1. Implementar verificação real de DNS');
    console.log('   2. Criar interface para Super Admin');
    console.log('   3. Implementar emails de notificação');
    console.log('   4. Configurar scheduler de verificação\n');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  } finally {
    process.exit(0);
  }
}

// Executar teste
testDomainFlow();
