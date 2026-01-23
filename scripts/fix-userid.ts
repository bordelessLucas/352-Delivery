// Script para corrigir o userId dos produtos existentes
// Uso: npm run fix-userid <email> <senha>
// Este script atualiza todos os produtos para terem o userId do usuário autenticado

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, Timestamp } from "firebase/firestore";
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
    console.warn("Arquivo .env nao encontrado, usando variaveis de ambiente do sistema");
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

async function fixUserId() {
  try {
    // Solicitar credenciais do usuário
    const email = process.argv[2] || envVars.SEED_EMAIL || process.env.SEED_EMAIL;
    const password = process.argv[3] || envVars.SEED_PASSWORD || process.env.SEED_PASSWORD;

    if (!email || !password) {
      console.error("ERRO: Por favor, forneca email e senha:");
      console.error("Uso: npm run fix-userid <email> <senha>");
      console.error("Ou configure SEED_EMAIL e SEED_PASSWORD no arquivo .env");
      console.error("\nExemplo:");
      console.error("  npm run fix-userid usuario@exemplo.com senha123");
      process.exit(1);
    }

    console.log("Autenticando usuario...");
    console.log(`Email: ${email}`);
    
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (authError: any) {
      if (authError.code === "auth/invalid-credential" || authError.code === "auth/wrong-password" || authError.code === "auth/user-not-found") {
        console.error("\nERRO de autenticacao:");
        console.error("   - Verifique se o email e senha estao corretos");
        console.error("   - Certifique-se de que o usuario existe no Firebase Authentication");
        console.error(`\nErro detalhado: ${authError.message}`);
      } else {
        console.error("\nERRO ao autenticar:", authError.message);
        console.error(`Codigo do erro: ${authError.code}`);
      }
      process.exit(1);
    }
    
    const newUserId = userCredential.user.uid;
    console.log(`OK Usuario autenticado: ${newUserId}`);

    // Buscar TODOS os produtos (sem filtro de userId)
    console.log("\n=== Buscando todos os produtos ===");
    const produtosRef = collection(db, "produtos");
    const allProductsSnapshot = await getDocs(produtosRef);
    
    console.log(`Total de produtos encontrados: ${allProductsSnapshot.size}`);
    
    if (allProductsSnapshot.empty) {
      console.log("Nenhum produto encontrado no banco de dados.");
      process.exit(0);
    }

    // Listar produtos e seus userIds atuais
    console.log("\n=== Produtos encontrados ===");
    const productsToUpdate: Array<{ id: string; nome: string; currentUserId: string }> = [];
    
    allProductsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const currentUserId = data.userId || "sem userId";
      productsToUpdate.push({
        id: doc.id,
        nome: data.nome || "Sem nome",
        currentUserId,
      });
      console.log(`- ${data.nome || "Sem nome"} (ID: ${doc.id}, userId atual: ${currentUserId})`);
    });

    // Atualizar produtos que têm userId diferente
    console.log("\n=== Atualizando produtos ===");
    let atualizados = 0;
    let jaCorretos = 0;
    let erros = 0;

    for (const product of productsToUpdate) {
      if (product.currentUserId === newUserId) {
        console.log(`OK ${product.nome} ja tem o userId correto`);
        jaCorretos++;
        continue;
      }

      try {
        const productRef = doc(db, "produtos", product.id);
        await updateDoc(productRef, {
          userId: newUserId,
          updatedAt: Timestamp.now(),
        });
        console.log(`OK ${product.nome} atualizado (userId: ${product.currentUserId} -> ${newUserId})`);
        atualizados++;
      } catch (error: any) {
        erros++;
        console.error(`ERRO ao atualizar ${product.nome}:`, error.message);
        console.error(`  Codigo do erro: ${error.code}`);
      }
    }

    console.log(`\n=== Resumo ===`);
    console.log(`Produtos atualizados: ${atualizados}`);
    console.log(`Produtos ja corretos: ${jaCorretos}`);
    console.log(`Erros: ${erros}`);
    console.log(`\nOK Processo concluido!`);

    // Também atualizar pedidos se necessário
    console.log("\n=== Verificando pedidos ===");
    const pedidosRef = collection(db, "pedidos");
    const allOrdersSnapshot = await getDocs(pedidosRef);
    
    if (!allOrdersSnapshot.empty) {
      console.log(`Total de pedidos encontrados: ${allOrdersSnapshot.size}`);
      let pedidosAtualizados = 0;
      let pedidosJaCorretos = 0;
      let pedidosErros = 0;

      for (const orderDoc of allOrdersSnapshot.docs) {
        const data = orderDoc.data();
        const currentUserId = data.userId || "sem userId";
        
        if (currentUserId === newUserId) {
          console.log(`OK Pedido #${data.numero || orderDoc.id} ja tem o userId correto`);
          pedidosJaCorretos++;
          continue;
        }

        try {
          const orderRef = doc(db, "pedidos", orderDoc.id);
          await updateDoc(orderRef, {
            userId: newUserId,
            updatedAt: Timestamp.now(),
          });
          console.log(`OK Pedido #${data.numero || orderDoc.id} atualizado (userId: ${currentUserId} -> ${newUserId})`);
          pedidosAtualizados++;
        } catch (error: any) {
          pedidosErros++;
          console.error(`ERRO ao atualizar pedido ${orderDoc.id}:`, error.message);
          console.error(`  Codigo do erro: ${error.code}`);
        }
      }
      
      console.log(`\n=== Resumo de Pedidos ===`);
      console.log(`Pedidos atualizados: ${pedidosAtualizados}`);
      console.log(`Pedidos ja corretos: ${pedidosJaCorretos}`);
      console.log(`Erros: ${pedidosErros}`);
    } else {
      console.log("Nenhum pedido encontrado no banco de dados.");
    }

    process.exit(0);
  } catch (error: any) {
    console.error("ERRO durante a correcao:", error.message);
    console.error(error);
    process.exit(1);
  }
}

fixUserId();
