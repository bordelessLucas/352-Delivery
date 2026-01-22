# Configuração do Firestore para o Sistema de Delivery

## 1. Regras do Firestore

Acesse o [Console do Firebase](https://console.firebase.google.com/) e configure as regras do Firestore:

1. Vá em **Firestore Database** > **Regras**
2. Cole as seguintes regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para cupons - apenas o usuário autenticado pode acessar seus próprios cupons
    match /cupons/{couponId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Regras para produtos - apenas o usuário autenticado pode acessar seus próprios produtos
    match /produtos/{productId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Regras para variações globais - apenas o usuário autenticado pode acessar suas próprias variações
    match /variacoesGlobais/{variationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Clique em **Publicar**

## 2. Índices (se necessário)

Se você receber um erro sobre índice faltando:

1. O erro no console do navegador mostrará um link para criar o índice
2. Clique no link ou acesse o Console do Firebase
3. Vá em **Firestore Database** > **Índices**
4. Crie o índice conforme solicitado

### Índices Recomendados:

**Para a coleção `produtos`:**
- Campo: `userId` (Ascending)
- Campo: `createdAt` (Descending)
- Tipo: Composite Index

**Para a coleção `variacoesGlobais`:**
- Campo: `userId` (Ascending)
- Campo: `createdAt` (Descending)
- Tipo: Composite Index

**Para a coleção `cupons`:**
- Campo: `userId` (Ascending)
- Tipo: Single Field Index (ou Composite se usar orderBy)

## 3. Verificar Configuração

Certifique-se de que:
- ✅ O arquivo `.env` está configurado corretamente
- ✅ As variáveis de ambiente estão sendo carregadas
- ✅ O usuário está autenticado
- ✅ As regras do Firestore permitem leitura/escrita

## 4. Testar

Após configurar:
1. Faça login na aplicação
2. Teste as funcionalidades:
   - **Cupons**: Acesse a aba de Cupons e tente criar um novo cupom
   - **Produtos**: Acesse a aba de Produtos e tente criar um novo produto
   - **Variações Globais**: Crie variações globais que podem ser reutilizadas em produtos

## 5. Estrutura das Coleções

### Coleção: `cupons`
```javascript
{
  codigo: string,
  tipoDesconto: "percentual" | "fixo",
  valorDesconto: number,
  dataValidade: Timestamp,
  limiteUso: number,
  usosAtuais: number,
  valorMinimo?: number,
  ativo: boolean,
  userId: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Coleção: `produtos`
```javascript
{
  nome: string,
  descricao: string,
  preco: number,
  fotoUrl?: string,
  categoria: string,
  visibilidade: boolean,
  status: "ativo" | "inativo",
  variacaoGlobal?: {
    nome: string,
    escolhaMinima: number,
    escolhaMaxima: number,
    itens: Array<{
      nome: string,
      descricao?: string,
      precoAdicional: number
    }>
  },
  variacaoUnitaria?: {
    nome: string,
    escolhaMinima: number,
    escolhaMaxima: number,
    itens: Array<{
      nome: string,
      descricao?: string,
      precoAdicional: number
    }>
  },
  userId: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Coleção: `variacoesGlobais`
```javascript
{
  nome: string,
  escolhaMinima: number,
  escolhaMaxima: number,
  itens: Array<{
    nome: string,
    descricao?: string,
    precoAdicional: number
  }>,
  visibilidade: boolean,
  userId: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```
