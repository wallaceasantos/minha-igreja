#!/bin/bash

# ================================================================
# Script de Deploy - Igreja Connect (HostGator)
# ================================================================
# Uso: ./deploy.sh
# ================================================================

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuração
FTP_USER="seu_usuario_ftp"
FTP_HOST="ftp.ccjv.com.br"
FTP_PATH="/home/usuario/public_html/"

echo -e "${YELLOW}🚀 Iniciando deploy do Igreja Connect...${NC}"
echo ""

# 1. Build do Frontend
echo -e "${YELLOW}🔨 Passo 1: Build do frontend...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build falhou!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build concluído!${NC}"
echo ""

# 2. Upload via rsync (se disponível)
if command -v rsync &> /dev/null; then
    echo -e "${YELLOW}📤 Passo 2: Upload via rsync...${NC}"
    
    # Upload frontend
    rsync -avz --delete \
        dist/ \
        ${FTP_USER}@${FTP_HOST}:${FTP_PATH}
    
    # Upload backend
    rsync -avz \
        api/ \
        database/ \
        lib/ \
        ${FTP_USER}@${FTP_HOST}:${FTP_PATH}
    
    echo -e "${GREEN}✅ Upload concluído!${NC}"
else
    echo -e "${YELLOW}⚠️  rsync não encontrado. Use FTP manual.${NC}"
    echo ""
    echo "Instruções:"
    echo "1. Abra FileZilla ou WinSCP"
    echo "2. Conecte-se a: ${FTP_HOST}"
    echo "3. Upload de dist/ para: ${FTP_PATH}"
    echo "4. Upload de api/, database/, lib/ para: ${FTP_PATH}"
fi

echo ""
echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo "📍 Acesse: https://ccjv.com.br"
echo "📍 Teste: https://ccjv.com.br/criar"
echo ""
