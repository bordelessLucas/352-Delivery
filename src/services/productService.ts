import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firestore";

// Tipos para variações
export interface VariationItem {
  id?: string;
  nome: string;
  descricao?: string;
  precoAdicional: number;
}

export interface GlobalVariation {
  id?: string;
  nome: string;
  escolhaMinima: number;
  escolhaMaxima: number;
  itens: VariationItem[];
  visibilidade: boolean;
}

export interface ProductVariation {
  id?: string;
  nome: string;
  escolhaMinima: number;
  escolhaMaxima: number;
  itens: VariationItem[];
}

export interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  fotoUrl?: string;
  categoria: string;
  visibilidade: boolean;
  status: "ativo" | "inativo";
  variacaoGlobal?: ProductVariation;
  variacaoUnitaria?: ProductVariation;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Converter documento do Firestore para Product
const firestoreDocToProduct = (doc: QueryDocumentSnapshot<DocumentData>): Product => {
  const data = doc.data();
  
  // Converter Timestamp para Date
  let createdAt: Date;
  let updatedAt: Date;
  
  if (data.createdAt) {
    if (data.createdAt.toDate) {
      createdAt = data.createdAt.toDate();
    } else if (data.createdAt instanceof Timestamp) {
      createdAt = data.createdAt.toDate();
    } else if (data.createdAt.seconds) {
      createdAt = new Date(data.createdAt.seconds * 1000);
    } else {
      createdAt = new Date();
    }
  } else {
    createdAt = new Date();
  }
  
  if (data.updatedAt) {
    if (data.updatedAt.toDate) {
      updatedAt = data.updatedAt.toDate();
    } else if (data.updatedAt instanceof Timestamp) {
      updatedAt = data.updatedAt.toDate();
    } else if (data.updatedAt.seconds) {
      updatedAt = new Date(data.updatedAt.seconds * 1000);
    } else {
      updatedAt = new Date();
    }
  } else {
    updatedAt = new Date();
  }
  
  return {
    id: doc.id,
    nome: data.nome || "",
    descricao: data.descricao || "",
    preco: data.preco || 0,
    fotoUrl: data.fotoUrl || "",
    categoria: data.categoria || "",
    visibilidade: data.visibilidade !== undefined ? data.visibilidade : true,
    status: data.status || "ativo",
    variacaoGlobal: data.variacaoGlobal || undefined,
    variacaoUnitaria: data.variacaoUnitaria || undefined,
    userId: data.userId || "",
    createdAt,
    updatedAt,
  };
};

// Converter Product para formato do Firestore
const productToFirestore = (product: Omit<Product, "id" | "createdAt" | "updatedAt">): DocumentData => {
  const data: DocumentData = {
    nome: product.nome,
    descricao: product.descricao,
    preco: product.preco,
    fotoUrl: product.fotoUrl || "",
    categoria: product.categoria,
    visibilidade: product.visibilidade,
    status: product.status,
    userId: product.userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Só adiciona variações se existirem
  if (product.variacaoGlobal) {
    data.variacaoGlobal = product.variacaoGlobal;
  }
  if (product.variacaoUnitaria) {
    data.variacaoUnitaria = product.variacaoUnitaria;
  }

  return data;
};

// Obter todos os produtos do usuário autenticado
export const getProducts = async (userId: string): Promise<Product[]> => {
  try {
    if (!userId) {
      console.warn("getProducts chamado sem userId");
      return [];
    }

    const productsRef = collection(db, "produtos");
    let querySnapshot;
    
    try {
      // Tenta usar orderBy primeiro
      const q = query(
        productsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      querySnapshot = await getDocs(q);
    } catch (error: any) {
      // Se falhar (por falta de índice), usa apenas where
      if (error?.code === "failed-precondition" || error?.code === 9) {
        console.warn("Índice não encontrado, usando query sem orderBy");
        const q = query(
          productsRef,
          where("userId", "==", userId)
        );
        querySnapshot = await getDocs(q);
      } else {
        throw error;
      }
    }
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const products = querySnapshot.docs.map((doc) => {
      try {
        return firestoreDocToProduct(doc);
      } catch (error) {
        console.error("Erro ao converter documento:", error, doc.id);
        return null;
      }
    }).filter((product): product is Product => product !== null);
    
    // Ordena manualmente se não usou orderBy
    return products.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  } catch (error: any) {
    console.error("Erro ao buscar produtos:", error);
    console.error("Código do erro:", error?.code);
    console.error("Mensagem do erro:", error?.message);
    
    if (error?.code === "failed-precondition" || error?.code === 9) {
      console.warn("Índice do Firestore não encontrado. Retornando lista vazia.");
      return [];
    }
    
    if (error?.code === "permission-denied" || error?.code === 7) {
      console.warn("Permissão negada ao acessar produtos. Verifique as regras do Firestore.");
      return [];
    }
    
    throw error;
  }
};

// Obter um produto específico
export const getProduct = async (productId: string): Promise<Product | null> => {
  try {
    const productRef = doc(db, "produtos", productId);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      return firestoreDocToProduct(productSnap as QueryDocumentSnapshot<DocumentData>);
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    throw error;
  }
};

// Criar um novo produto
export const createProduct = async (
  product: Omit<Product, "id" | "userId" | "createdAt" | "updatedAt">,
  userId: string
): Promise<string> => {
  try {
    if (!userId) {
      throw new Error("userId é obrigatório para criar um produto");
    }

    const productsRef = collection(db, "produtos");
    const productData = productToFirestore({ ...product, userId });
    
    const docRef = await addDoc(productsRef, productData);
    return docRef.id;
  } catch (error: any) {
    console.error("Erro ao criar produto:", error);
    console.error("Código do erro:", error?.code);
    console.error("Mensagem do erro:", error?.message);
    throw error;
  }
};

// Atualizar um produto existente
export const updateProduct = async (
  productId: string,
  product: Partial<Omit<Product, "id" | "createdAt" | "updatedAt" | "userId">>
): Promise<void> => {
  try {
    const productRef = doc(db, "produtos", productId);
    const updateData: DocumentData = {};
    
    if (product.nome !== undefined) updateData.nome = product.nome;
    if (product.descricao !== undefined) updateData.descricao = product.descricao;
    if (product.preco !== undefined) updateData.preco = product.preco;
    if (product.fotoUrl !== undefined) updateData.fotoUrl = product.fotoUrl || "";
    if (product.categoria !== undefined) updateData.categoria = product.categoria;
    if (product.visibilidade !== undefined) updateData.visibilidade = product.visibilidade;
    if (product.status !== undefined) updateData.status = product.status;
    
    // Tratar variações: se undefined, remove do documento; se definida, atualiza
    if (product.variacaoGlobal !== undefined) {
      if (product.variacaoGlobal) {
        updateData.variacaoGlobal = product.variacaoGlobal;
      } else {
        // Se for null/undefined, remove o campo
        updateData.variacaoGlobal = null;
      }
    }
    if (product.variacaoUnitaria !== undefined) {
      if (product.variacaoUnitaria) {
        updateData.variacaoUnitaria = product.variacaoUnitaria;
      } else {
        // Se for null/undefined, remove o campo
        updateData.variacaoUnitaria = null;
      }
    }
    
    updateData.updatedAt = Timestamp.now();
    
    await updateDoc(productRef, updateData);
  } catch (error: any) {
    console.error("Erro ao atualizar produto:", error);
    console.error("Código do erro:", error?.code);
    console.error("Mensagem do erro:", error?.message);
    throw error;
  }
};

// Deletar um produto
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, "produtos", productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    throw error;
  }
};

// Obter todas as variações globais do usuário
export const getGlobalVariations = async (userId: string): Promise<GlobalVariation[]> => {
  try {
    if (!userId) {
      return [];
    }

    const variationsRef = collection(db, "variacoesGlobais");
    const q = query(
      variationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        nome: data.nome || "",
        escolhaMinima: data.escolhaMinima || 0,
        escolhaMaxima: data.escolhaMaxima || 0,
        itens: data.itens || [],
        visibilidade: data.visibilidade !== undefined ? data.visibilidade : true,
      };
    });
  } catch (error: any) {
    console.error("Erro ao buscar variações globais:", error);
    return [];
  }
};

// Criar uma nova variação global
export const createGlobalVariation = async (
  variation: Omit<GlobalVariation, "id">,
  userId: string
): Promise<string> => {
  try {
    const variationsRef = collection(db, "variacoesGlobais");
    const variationData = {
      ...variation,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(variationsRef, variationData);
    return docRef.id;
  } catch (error: any) {
    console.error("Erro ao criar variação global:", error);
    throw error;
  }
};

// Atualizar uma variação global
export const updateGlobalVariation = async (
  variationId: string,
  variation: Partial<Omit<GlobalVariation, "id">>
): Promise<void> => {
  try {
    const variationRef = doc(db, "variacoesGlobais", variationId);
    const updateData: DocumentData = { ...variation };
    updateData.updatedAt = Timestamp.now();
    
    await updateDoc(variationRef, updateData);
  } catch (error) {
    console.error("Erro ao atualizar variação global:", error);
    throw error;
  }
};

// Deletar uma variação global
export const deleteGlobalVariation = async (variationId: string): Promise<void> => {
  try {
    const variationRef = doc(db, "variacoesGlobais", variationId);
    await deleteDoc(variationRef);
  } catch (error) {
    console.error("Erro ao deletar variação global:", error);
    throw error;
  }
};
