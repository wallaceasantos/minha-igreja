import express from 'express';
import { getPool } from '../config/database.js';
const router = express.Router();

router.post('/verify', async (req, res) => {
  try {
    const { church_id, pin } = req.body;
    if (!church_id || !pin) return res.status(400).json({ success: false, error: 'church_id e pin obrigatórios' });
    const pool = getPool();
    const [pins] = await pool.query(`SELECT p.*, m.name, m.phone, c.slug as church_slug, c.name as church_name FROM member_live_pins p INNER JOIN church_members m ON p.member_id=m.id INNER JOIN churches c ON p.church_id=c.id WHERE p.church_id=? AND p.pin=? AND p.is_active=1 AND (p.expires_at IS NULL OR p.expires_at>NOW()) LIMIT 1`, [church_id, pin]);
    if (!pins.length) return res.status(401).json({ success: false, error: 'PIN inválido' });
    const d = pins[0];
    if (d.used_count >= d.max_uses) return res.status(401).json({ success: false, error: 'PIN expirado' });
    await pool.query('UPDATE member_live_pins SET used_count=used_count+1 WHERE id=?', [d.id]);
    res.json({ success: true, data: { session_id: `${d.church_slug}_${d.member_id}_${Date.now()}`, member: { id: d.member_id, name: d.name }, church: { slug: d.church_slug, name: d.church_name } }, message: 'Acesso liberado!' });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/regenerate', async (req, res) => {
  try {
    const { church_id, member_id } = req.body;
    if (!church_id || !member_id) return res.status(400).json({ success: false, error: 'IDs obrigatórios' });
    const pool = getPool();
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    await pool.query('UPDATE member_live_pins SET is_active=0 WHERE church_id=? AND member_id=?', [church_id, member_id]);
    await pool.query('INSERT INTO member_live_pins (church_id,member_id,pin,max_uses,expires_at) VALUES (?,?,?,100,DATE_ADD(NOW(),INTERVAL 30 DAY))', [church_id, member_id, pin]);
    const [[m]] = await pool.query('SELECT name,phone FROM church_members WHERE id=?', [member_id]);
    const [[ch]] = await pool.query('SELECT name FROM churches WHERE id=?', [church_id]);
    let wu = null;
    if (m && m.phone) { const ph = m.phone.replace(/\D/g,''); const pf = ph.startsWith('55')?ph:`55${ph}`; wu = `https://wa.me/${pf}?text=${encodeURIComponent(`🎥 Transmissão ao Vivo\n\nOlá ${m.name}! Paz do Senhor! 🙏\n\nSeu código: *${pin}*\n\nAcesse: site da igreja > Transmissão ao Vivo\n📅 30 dias | Deus abençoe! ❤️`)}`; }
    res.json({ success: true, data: { pin, member: m, whatsapp_url: wu }, message: 'PIN gerado!' });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/bulk-generate', async (req, res) => {
  try {
    const { church_id, member_ids } = req.body;
    if (!church_id) return res.status(400).json({ success: false, error: 'church_id obrigatório' });
    const pool = getPool();
    const [[ch]] = await pool.query('SELECT name FROM churches WHERE id=?', [church_id]);
    const cn = ch ? ch.name : 'igreja';
    
    // Se member_ids for fornecido, gera PINs apenas para esses membros
    let members;
    if (member_ids && Array.isArray(member_ids) && member_ids.length > 0) {
      const placeholders = member_ids.map(() => '?').join(',');
      const [m] = await pool.query(`SELECT id,name,phone,email FROM church_members WHERE church_id=? AND id IN (${placeholders})`, [church_id, ...member_ids]);
      members = m;
    } else {
      // Se não, gera para todos os membros ativos
      const [m] = await pool.query('SELECT id,name,phone,email FROM church_members WHERE church_id=? AND is_active=1', [church_id]);
      members = m;
    }

    if (!members.length) return res.json({ success: true, data: { generated: [], count: 0 } });
    const generated = [];
    for (const m of members) {
      try {
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        await pool.query('UPDATE member_live_pins SET is_active=0 WHERE church_id=? AND member_id=?', [church_id, m.id]);
        await pool.query('INSERT INTO member_live_pins (church_id,member_id,pin,max_uses,expires_at) VALUES (?,?,?,100,DATE_ADD(NOW(),INTERVAL 30 DAY))', [church_id, m.id, pin]);
        let wu = null;
        if (m.phone) { const ph = m.phone.replace(/\D/g,''); const pf = ph.startsWith('55')?ph:`55${ph}`; wu = `https://wa.me/${pf}?text=${encodeURIComponent(`🎥 Transmissão ao Vivo - ${cn}\n\nOlá ${m.name}! Paz do Senhor! 🙏\n\nCódigo: *${pin}*\n\nAcesse: site > Transmissão ao Vivo\n📅 30 dias | Deus abençoe! ❤️`)}`; }
        generated.push({ member_id: m.id, name: m.name, phone: m.phone, pin, whatsapp_url: wu });
      } catch (e) { console.error('Bulk PIN error:', e); }
    }
    res.json({ success: true, data: { generated, count: generated.length, church_name: cn }, message: `${generated.length} PINs gerados!` });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

// NOVA: Cadastro rápido para visitantes assistirem à live
router.post('/quick-register', async (req, res) => {
  try {
    const { church_id, name, phone, email, source } = req.body;
    if (!church_id || !name) return res.status(400).json({ success: false, error: 'Nome e church_id obrigatórios' });
    const pool = getPool();
    // Verificar se igreja existe
    const [[ch]] = await pool.query('SELECT id, name, slug FROM churches WHERE id=?', [church_id]);
    if (!ch) return res.status(404).json({ success: false, error: 'Igreja não encontrada' });
    // Criar membro (visitor, ativo)
    const phoneClean = phone ? phone.replace(/\D/g,'') : null;
    const [result] = await pool.query(
      'INSERT INTO church_members (church_id, name, phone, email, member_status, is_active) VALUES (?, ?, ?, ?, "visitor", 1)',
      [church_id, name.trim(), phoneClean, email || null]
    );
    const memberId = result.insertId;
    // Gerar PIN automático
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    await pool.query('INSERT INTO member_live_pins (church_id, member_id, pin, max_uses, expires_at) VALUES (?,?,?,100,DATE_ADD(NOW(),INTERVAL 30 DAY))', [church_id, memberId, pin]);
    // Criar sessão
    const sessionId = `${ch.slug}_${memberId}_${Date.now()}`;
    res.json({ success: true, data: { session_id: sessionId, member: { id: memberId, name: name.trim(), phone: phoneClean }, church: { slug: ch.slug, name: ch.name }, pin, expires_in_days: 30, source: source || 'quick_register' }, message: 'Cadastro realizado! Acesso liberado!' });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/:member_id/pin', async (req, res) => {
  try {
    const pool = getPool();
    const [pins] = await pool.query('SELECT pin,expires_at,used_count,max_uses,is_active FROM member_live_pins WHERE member_id=? AND is_active=1 ORDER BY created_at DESC LIMIT 1', [req.params.member_id]);
    res.json({ success: true, data: pins[0] || null });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

export default router;
