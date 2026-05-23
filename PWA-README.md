# PWA - MinhaIgreja Admin

Guia de instalação do PWA para o Dashboard do Pastor.

## O que é?

O PWA (Progressive Web App) permite que o pastor instale o dashboard como um aplicativo no smartphone, sem precisar da Play Store ou App Store.

## Como Instalar

### Android (Chrome)

1. **Acesse** o dashboard no Chrome: `https://minhaigreja.up.railway.app/admin`
2. **Faça login** na sua conta
3. **Toque nos 3 pontinhos** (menu) no canto superior direito
4. **Selecione** "Adicionar à tela inicial" ou "Instalar aplicativo"
5. **Confirme** a instalação
6. **Pronto!** O ícone aparecerá na tela inicial

### iPhone (Safari)

1. **Acesse** o dashboard no Safari: `https://minhaigreja.up.railway.app/admin`
2. **Faça login** na sua conta
3. **Toque no botão Compartilhar** (quadrado com seta pra cima)
4. **Role para baixo** e toque em "Adicionar à Tela de Início"
5. **Toque em "Adicionar"** no canto superior direito
6. **Pronto!** O ícone aparecerá na home screen

## Funcionalidades

✅ **Tela cheia** - Abre sem barra de endereço do navegador  
✅ **Ícone na tela inicial** - Como um app nativo  
✅ **Cache inteligente** - Funciona mesmo com internet lenta  
✅ **Notificações** - Receba alertas de novos pedidos de oração  
✅ **Atualização automática** - Sempre com a versão mais recente  

## Requisitos

- Android: Chrome 80+ ou Samsung Internet
- iOS: Safari 13+ (iOS 13 ou superior)
- Conexão com internet (WiFi ou 4G/5G)

## Atualização

O PWA se atualiza automaticamente. Para forçar uma atualização:

1. Abra o app
2. Aguarde alguns segundos na tela inicial
3. Se necessário, feche e abra novamente

## Desinstalar

### Android
1. Toque e segure o ícone do app
2. Arraste para "Desinstalar" ou "Remover"

### iPhone
1. Toque e segure o ícone do app
2. Toque em "Remover aplicativo"
3. Confirme "Remover da Tela de Início"

## Suporte

Em caso de problemas:
- Limpe o cache do navegador
- Reinstale o PWA
- Verifique se está usando a URL correta: `/admin`

## Notas Técnicas

- **Scope**: O PWA está configurado para `/admin`, então o pastor só verá o dashboard
- **Cache**: Assets são cacheados para carregamento rápido
- **API**: Requisições à API sempre buscam dados atualizados
- **Offline**: Páginas já visitadas podem ser acessadas offline (leitura apenas)
