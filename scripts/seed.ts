// Script de seed para popular o Firebase com dados mockados
// Uso: npm run seed <email> <senha>
// Ou configure SEED_EMAIL e SEED_PASSWORD no .env

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";
import { join } from "path";

// Carregar variáveis de ambiente do .env
function loadEnv() {
  try {
    const envFile = readFileSync(join(process.cwd(), ".env"), "utf-8");
    const envVars: Record<string, string> = {};
    envFile.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join("=").trim();
      }
    });
    return envVars;
  } catch (error) {
    console.warn("Arquivo .env não encontrado, usando variáveis de ambiente do sistema");
    return {};
  }
}

const envVars = loadEnv();

// Configuração do Firebase
const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Dados mockados de produtos (do Cardapio.tsx)
const mockProducts = [
  {
    nome: "Bruschetta Italiana",
    descricao: "Pão italiano, tomate, manjericão, alho, azeite",
    preco: 18.90,
    fotoUrl: "https://www.divvino.com.br/blog/wp-content/uploads/2024/03/receitas-de-bruschettas-capa.jpg",
    categoria: "entradas",
    visibilidade: true,
    status: "ativo",
  },
  {
    nome: "Carpaccio de Salmão",
    descricao: "Salmão fresco, rúcula, alcaparras, limão",
    preco: 32.50,
    fotoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    categoria: "entradas",
    visibilidade: true,
    status: "ativo",
  },
  {
    nome: "Risotto de Camarão",
    descricao: "Arroz arbóreo, camarões, queijo parmesão, vinho branco",
    preco: 45.90,
    fotoUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400",
    categoria: "pratos-principais",
    visibilidade: true,
    status: "ativo",
  },
  {
    nome: "Filé Mignon ao Molho Madeira",
    descricao: "Filé mignon, molho madeira, batatas rústicas",
    preco: 58.90,
    fotoUrl: "https://sabores-new.s3.amazonaws.com/public/2024/11/bife-ao-molho-madeira.jpg",
    categoria: "pratos-principais",
    visibilidade: true,
    status: "ativo",
  },
  {
    nome: "Tiramisu",
    descricao: "Biscoito champanhe, café, mascarpone, cacau",
    preco: 22.90,
    fotoUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400",
    categoria: "sobremesas",
    visibilidade: true,
    status: "ativo",
  },
  {
    nome: "Brownie com Sorvete",
    descricao: "Brownie, sorvete de baunilha, calda de chocolate",
    preco: 19.90,
    fotoUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400",
    categoria: "sobremesas",
    visibilidade: true,
    status: "ativo",
  },
  {
    nome: "Água Mineral",
    descricao: "Água mineral natural",
    preco: 4.50,
    fotoUrl: "https://www.delgo.com.br/imagens/como-e-feito-o-envase-de-agua-mineral.jpg",
    categoria: "bebidas",
    visibilidade: true,
    status: "ativo",
  },
  {
    nome: "Refrigerante",
    descricao: "Refrigerante gelado",
    preco: 6.90,
    fotoUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
    categoria: "bebidas",
    visibilidade: true,
    status: "ativo",
  },
  {
    nome: "Caipirinha",
    descricao: "Cachaça, limão, açúcar, gelo",
    preco: 15.90,
    fotoUrl: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400",
    categoria: "drinks",
    visibilidade: true,
    status: "ativo",
  },
  {
    nome: "Mojito",
    descricao: "Rum, hortelã, limão, água com gás",
    preco: 18.90,
    fotoUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400",
    categoria: "drinks",
    visibilidade: true,
    status: "ativo",
  },
];

// Dados mockados de pedidos (do Pedidos.tsx)
const mockOrders = [
  {
    numero: "001",
    clienteNome: "João Silva",
    clienteWhatsapp: "(11) 98765-4321",
    status: "preparando",
    dataHora: new Date(),
    formaPagamento: "Cartão de Crédito",
  },
  {
    numero: "002",
    clienteNome: "Maria Santos",
    clienteWhatsapp: "(11) 97654-3210",
    status: "indo-para-entrega",
    dataHora: new Date(),
    formaPagamento: "PIX",
  },
  {
    numero: "003",
    clienteNome: "Pedro Oliveira",
    clienteWhatsapp: "(11) 96543-2109",
    status: "confirmando-pagamento",
    dataHora: new Date(),
    formaPagamento: "Dinheiro",
  },
  {
    numero: "004",
    clienteNome: "Ana Costa",
    clienteWhatsapp: "(11) 95432-1098",
    status: "preparando",
    dataHora: new Date(),
    formaPagamento: "Cartão de Débito",
  },
  {
    numero: "005",
    clienteNome: "Carlos Ferreira",
    clienteWhatsapp: "(11) 94321-0987",
    status: "concluido",
    dataHora: new Date(Date.now() - 86400000), // Ontem
    formaPagamento: "PIX",
  },
  {
    numero: "006",
    clienteNome: "Julia Almeida",
    clienteWhatsapp: "(11) 93210-9876",
    status: "concluido",
    dataHora: new Date(Date.now() - 172800000), // 2 dias atrás
    formaPagamento: "Cartão de Crédito",
  },
];

async function seed() {
  try {
    // Solicitar credenciais do usuário
    const email = process.argv[2] || envVars.SEED_EMAIL || process.env.SEED_EMAIL;
    const password = process.argv[3] || envVars.SEED_PASSWORD || process.env.SEED_PASSWORD;

    if (!email || !password) {
      console.error("❌ Por favor, forneça email e senha:");
      console.error("Uso: npm run seed <email> <senha>");
      console.error("Ou configure SEED_EMAIL e SEED_PASSWORD no arquivo .env");
      console.error("\nExemplo:");
      console.error("  npm run seed usuario@exemplo.com senha123");
      process.exit(1);
    }

    console.log("Autenticando usuário...");
    console.log(`Email: ${email}`);
    
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (authError: any) {
      if (authError.code === "auth/invalid-credential" || authError.code === "auth/wrong-password" || authError.code === "auth/user-not-found") {
        console.error("\n❌ Erro de autenticação:");
        console.error("   - Verifique se o email e senha estão corretos");
        console.error("   - Certifique-se de que o usuário existe no Firebase Authentication");
        console.error("   - Se necessário, crie o usuário no console do Firebase primeiro");
        console.error(`\nErro detalhado: ${authError.message}`);
      } else {
        console.error("\n❌ Erro ao autenticar:", authError.message);
        console.error(`Código do erro: ${authError.code}`);
      }
      process.exit(1);
    }
    
    const userId = userCredential.user.uid;
    console.log(`✓ Usuário autenticado: ${userId}`);

    // Seed de produtos
    console.log("\n=== Seed de Produtos ===");
    const produtosRef = collection(db, "produtos");
    let produtosCriados = 0;
    let produtosErro = 0;
    
    for (const product of mockProducts) {
      try {
        const productData = {
          ...product,
          userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
        const docRef = await addDoc(produtosRef, productData);
        console.log(`✓ Produto criado: ${product.nome} (ID: ${docRef.id})`);
        produtosCriados++;
      } catch (error: any) {
        produtosErro++;
        console.error(`✗ Erro ao criar produto ${product.nome}:`, error.message);
        console.error(`  Código do erro: ${error.code}`);
      }
    }
    
    console.log(`\nResumo de Produtos: ${produtosCriados} criados, ${produtosErro} com erro`);

    // Seed de pedidos
    console.log("\n=== Seed de Pedidos ===");
    const pedidosRef = collection(db, "pedidos");
    let pedidosCriados = 0;
    let pedidosErro = 0;
    
    for (const order of mockOrders) {
      try {
        const orderData = {
          ...order,
          userId,
          dataHora: Timestamp.fromDate(order.dataHora),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
        
        console.log(`Tentando criar pedido #${order.numero} com userId: ${userId}`);
        const docRef = await addDoc(pedidosRef, orderData);
        console.log(`✓ Pedido criado: #${order.numero} - ${order.clienteNome} (ID: ${docRef.id})`);
        pedidosCriados++;
      } catch (error: any) {
        pedidosErro++;
        console.error(`✗ Erro ao criar pedido #${order.numero}:`, error.message);
        console.error(`  Código do erro: ${error.code}`);
        console.error(`  Detalhes:`, error);
        
        // Se for erro de permissão, dar dicas
        if (error.code === "permission-denied" || error.code === 7) {
          console.error(`  ⚠️ Erro de permissão! Verifique:`);
          console.error(`     - Se o usuário está autenticado (userId: ${userId})`);
          console.error(`     - Se as regras do Firestore permitem criação`);
          console.error(`     - Se o userId no documento corresponde ao usuário autenticado`);
        }
      }
    }
    
    console.log(`\nResumo de Pedidos: ${pedidosCriados} criados, ${pedidosErro} com erro`);

    console.log("\n✅ Seed concluído com sucesso!");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Erro durante o seed:", error.message);
    process.exit(1);
  }
}

seed();
