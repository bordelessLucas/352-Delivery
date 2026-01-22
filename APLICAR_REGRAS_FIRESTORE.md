# Como Aplicar as Regras do Firestore

## Passo a Passo

1. **Acesse o Console do Firebase**
   - Vá para: https://console.firebase.google.com/
   - Selecione seu projeto

2. **Navegue até as Regras do Firestore**
   - No menu lateral, clique em **Firestore Database**
   - Clique na aba **Regras** (Rules)

3. **Copie e Cole as Regras**
   - Abra o arquivo `firestore.rules` neste projeto
   - Copie todo o conteúdo
   - Cole no editor de regras do Firebase Console

4. **Publicar as Regras**
   - Clique no botão **Publicar** (Publish)
   - Aguarde a confirmação de que as regras foram publicadas

## Regras Incluídas

As regras configuradas permitem que:

✅ **Usuários autenticados** possam:
- Ler e escrever apenas em seus próprios documentos
- Criar novos documentos associados ao seu `userId`

✅ **Coleções Protegidas:**
- `cupons` - Gerenciamento de cupons de desconto
- `produtos` - Gerenciamento de produtos do cardápio
- `variacoesGlobais` - Gerenciamento de variações globais reutilizáveis

## Segurança

As regras garantem que:
- ❌ Usuários não autenticados não podem acessar nenhuma coleção
- ❌ Usuários não podem acessar documentos de outros usuários
- ✅ Cada usuário só gerencia seus próprios dados

## Teste Após Aplicar

Após publicar as regras, teste:
1. Faça login na aplicação
2. Tente criar um produto
3. Tente criar um cupom
4. Tente criar uma variação global

Se tudo funcionar, as regras estão corretas! ✅
