/**
 * Script para gerar ícones PNG a partir do SVG
 * Uso: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Verifica se está no ambiente Node com Canvas
// Se não tiver canvas instalado, usa uma alternativa simples
try {
  const { createCanvas, loadImage } = require('canvas');
  
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
  const svgPath = path.join(__dirname, '..', 'public', 'icon.svg');
  const publicDir = path.join(__dirname, '..', 'public');
  
  async function generateIcons() {
    console.log('Gerando ícones PWA...');
    
    // Lê o SVG
    const svgBuffer = fs.readFileSync(svgPath);
    
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Carrega o SVG como imagem
      const img = await loadImage(svgBuffer);
      ctx.drawImage(img, 0, 0, size, size);
      
      // Salva como PNG
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`✓ Gerado: icon-${size}x${size}.png`);
    }
    
    console.log('\n✅ Todos os ícones foram gerados com sucesso!');
    console.log('📁 Local: public/');
  }
  
  generateIcons().catch((err) => {
    console.error('Erro ao gerar ícones:', err);
    console.log('\n💡 Para usar este script, instale o canvas:');
    console.log('   npm install canvas --save-dev');
    console.log('\n   Ou abra o arquivo public/generate-icons.html no navegador');
    process.exit(1);
  });
  
} catch (error) {
  console.log('⚠️ Canvas não instalado. Usando método alternativo...\n');
  console.log('Para gerar os ícones, você pode:');
  console.log('1. Instalar canvas: npm install canvas --save-dev');
  console.log('2. Ou abrir public/generate-icons.html no navegador');
  console.log('3. Ou usar um conversor online SVG para PNG\n');
  
  // Cria um arquivo placeholder explicando como gerar
  const readmePath = path.join(__dirname, '..', 'public', 'ICONS-README.txt');
  const content = `ICONES PWA - INSTRUÇÕES
========================

Para gerar os ícones PNG necessários:

Opção 1 - Navegador (Mais fácil):
1. Abra o arquivo generate-icons.html no navegador
2. Clique nos links para baixar cada ícone
3. Salve na pasta public/

Opção 2 - Node.js (Automático):
1. Instale o canvas: npm install canvas --save-dev
2. Rode: node scripts/generate-icons.js

Opção 3 - Online:
1. Acesse https://convertio.co/svg-png/
2. Converta o icon.svg para cada tamanho necessário:
   - 72x72, 96x96, 128x128, 144x144
   - 152x152, 192x192, 384x384, 512x512
3. Salve na pasta public/

Tamanhos necessários:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
`;
  
  fs.writeFileSync(readmePath, content);
  console.log('📝 Criado arquivo: public/ICONS-README.txt');
}
