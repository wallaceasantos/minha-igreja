/**
 * Script para executar migrations no Railway
 * Uso: node src/migrations/run_migrations.js
 */

import { getPool } from '../config/database.js';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  console.log('🚀 Executando migrations...\n');
  
  const pool = getPool();
  
  try {
    // Migration 010 - Criar tabela (se não existir)
    console.log('📦 Migration 010: Criar tabela testimonials...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        church_id INT NOT NULL,
        member_name VARCHAR(100) NOT NULL,
        member_email VARCHAR(100) DEFAULT NULL,
        member_avatar VARCHAR(10) DEFAULT NULL,
        member_since VARCHAR(50) DEFAULT NULL,
        testimonial_text TEXT NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        is_active TINYINT(1) DEFAULT 1,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        approved_at TIMESTAMP NULL DEFAULT NULL,
        approved_by INT DEFAULT NULL,
        
        FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE,
        INDEX idx_church_status (church_id, status),
        INDEX idx_display_order (display_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabela criada/verificada\n');
    
    // Migration 011 - Adicionar colunas faltantes
    console.log('📦 Migration 011: Adicionar colunas faltantes...');
    
    // Adicionar coluna member_email
    try {
      await pool.execute(`ALTER TABLE testimonials ADD COLUMN member_email VARCHAR(100) DEFAULT NULL`);
      console.log('✅ Coluna member_email adicionada');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Coluna member_email já existe');
      } else {
        throw e;
      }
    }
    
    // Adicionar coluna approved_at
    try {
      await pool.execute(`ALTER TABLE testimonials ADD COLUMN approved_at TIMESTAMP NULL DEFAULT NULL`);
      console.log('✅ Coluna approved_at adicionada');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Coluna approved_at já existe');
      } else {
        throw e;
      }
    }
    
    // Adicionar coluna approved_by
    try {
      await pool.execute(`ALTER TABLE testimonials ADD COLUMN approved_by INT DEFAULT NULL`);
      console.log('✅ Coluna approved_by adicionada');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Coluna approved_by já existe');
      } else {
        throw e;
      }
    }
    
    // Adicionar coluna status
    try {
      await pool.execute(`ALTER TABLE testimonials ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'`);
      console.log('✅ Coluna status adicionada');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Coluna status já existe');
      } else {
        throw e;
      }
    }
    
    // Criar índice
    try {
      await pool.execute(`CREATE INDEX idx_church_status ON testimonials(church_id, status)`);
      console.log('✅ Índice idx_church_status criado');
    } catch (e) {
      if (e.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Índice idx_church_status já existe');
      } else {
        throw e;
      }
    }
    
    // Atualizar registros sem status
    const [result] = await pool.execute(`UPDATE testimonials SET status = 'approved' WHERE status IS NULL`);
    console.log(`✅ ${result.affectedRows} registros atualizados para status 'approved'\n`);
    
    console.log('🎉 Todas as migrations executadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
