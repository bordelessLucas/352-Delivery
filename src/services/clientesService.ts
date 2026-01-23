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

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cpfCnpj?: string;
  dataNascimento?: string;
  observacoes?: string;
  totalPedidos?: number;
  valorTotalPedidos?: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Converter documento do Firestore para Cliente
const firestoreDocToCliente = (doc: QueryDocumentSnapshot<DocumentData>): Cliente => {
  const data = doc.data();
  
  let createdAt: Date;
  let updatedAt: Date;
  
  if (data.createdAt?.toDate) {
    createdAt = data.createdAt.toDate();
  } else if (data.createdAt instanceof Timestamp) {
    createdAt = data.createdAt.toDate();
  } else if (data.createdAt?.seconds) {
    createdAt = new Date(data.createdAt.seconds * 1000);
  } else {
    createdAt = new Date();
  }
  
  if (data.updatedAt?.toDate) {
    updatedAt = data.updatedAt.toDate();
  } else if (data.updatedAt instanceof Timestamp) {
    updatedAt = data.updatedAt.toDate();
  } else if (data.updatedAt?.seconds) {
    updatedAt = new Date(data.updatedAt.seconds * 1000);
  } else {
    updatedAt = new Date();
  }
  
  return {
    id: doc.id,
    nome: data.nome || "",
    email: data.email || "",
    telefone: data.telefone || "",
    endereco: data.endereco || "",
    cidade: data.cidade || "",
    estado: data.estado || "",
    cep: data.cep || "",
    cpfCnpj: data.cpfCnpj || "",
    dataNascimento: data.dataNascimento || "",
    observacoes: data.observacoes || "",
    totalPedidos: data.totalPedidos || 0,
    valorTotalPedidos: data.valorTotalPedidos || 0,
    userId: data.userId || "",
    createdAt,
    updatedAt,
  };
};

// Converter Cliente para formato do Firestore
const clienteToFirestore = (cliente: Omit<Cliente, "id" | "createdAt" | "updatedAt">): DocumentData => {
  return {
    nome: cliente.nome,
    email: cliente.email,
    telefone: cliente.telefone,
    endereco: cliente.endereco || "",
    cidade: cliente.cidade || "",
    estado: cliente.estado || "",
    cep: cliente.cep || "",
    cpfCnpj: cliente.cpfCnpj || "",
    dataNascimento: cliente.dataNascimento || "",
    observacoes: cliente.observacoes || "",
    totalPedidos: cliente.totalPedidos || 0,
    valorTotalPedidos: cliente.valorTotalPedidos || 0,
    userId: cliente.userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
};

// Obter todos os clientes do usuário autenticado
export const getClientes = async (userId: string): Promise<Cliente[]> => {
  try {
    if (!userId) {
      console.warn("getClientes chamado sem userId");
      return [];
    }

    const clientesRef = collection(db, "clientes");
    let querySnapshot;
    
    try {
      const q = query(
        clientesRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      querySnapshot = await getDocs(q);
    } catch (error: any) {
      if (error?.code === "failed-precondition" || error?.code === 9) {
        console.warn("Índice não encontrado, usando query sem orderBy");
        const q = query(
          clientesRef,
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
    
    const clientes = querySnapshot.docs.map((doc) => {
      try {
        return firestoreDocToCliente(doc);
      } catch (error) {
        console.error("Erro ao converter documento:", error, doc.id);
        return null;
      }
    }).filter((cliente): cliente is Cliente => cliente !== null);
    
    // Ordena manualmente se não usou orderBy
    const sortedClientes = clientes.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    
    return sortedClientes;
  } catch (error: any) {
    console.error("Erro ao buscar clientes:", error);
    
    if (error?.code === "failed-precondition" || error?.code === 9) {
      console.warn("Índice do Firestore não encontrado. Retornando lista vazia.");
      return [];
    }
    
    if (error?.code === "permission-denied" || error?.code === 7) {
      console.warn("Permissão negada ao acessar clientes. Verifique as regras do Firestore.");
      return [];
    }
    
    throw error;
  }
};

// Obter um cliente específico
export const getCliente = async (clienteId: string): Promise<Cliente | null> => {
  try {
    const clienteRef = doc(db, "clientes", clienteId);
    const clienteSnap = await getDoc(clienteRef);
    
    if (clienteSnap.exists()) {
      return firestoreDocToCliente(clienteSnap as QueryDocumentSnapshot<DocumentData>);
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    throw error;
  }
};

// Criar um novo cliente
export const createCliente = async (
  cliente: Omit<Cliente, "id" | "userId" | "createdAt" | "updatedAt" | "totalPedidos" | "valorTotalPedidos">,
  userId: string
): Promise<string> => {
  try {
    if (!userId) {
      throw new Error("userId é obrigatório para criar um cliente");
    }

    const clientesRef = collection(db, "clientes");
    const clienteData = clienteToFirestore({ 
      ...cliente, 
      userId,
      totalPedidos: 0,
      valorTotalPedidos: 0,
    });
    
    const docRef = await addDoc(clientesRef, clienteData);
    return docRef.id;
  } catch (error: any) {
    console.error("Erro ao criar cliente:", error);
    throw error;
  }
};

// Atualizar um cliente existente
export const updateCliente = async (
  clienteId: string,
  cliente: Partial<Omit<Cliente, "id" | "createdAt" | "updatedAt" | "userId">>
): Promise<void> => {
  try {
    const clienteRef = doc(db, "clientes", clienteId);
    const updateData: DocumentData = {};
    
    if (cliente.nome !== undefined) updateData.nome = cliente.nome;
    if (cliente.email !== undefined) updateData.email = cliente.email;
    if (cliente.telefone !== undefined) updateData.telefone = cliente.telefone;
    if (cliente.endereco !== undefined) updateData.endereco = cliente.endereco;
    if (cliente.cidade !== undefined) updateData.cidade = cliente.cidade;
    if (cliente.estado !== undefined) updateData.estado = cliente.estado;
    if (cliente.cep !== undefined) updateData.cep = cliente.cep;
    if (cliente.cpfCnpj !== undefined) updateData.cpfCnpj = cliente.cpfCnpj;
    if (cliente.dataNascimento !== undefined) updateData.dataNascimento = cliente.dataNascimento;
    if (cliente.observacoes !== undefined) updateData.observacoes = cliente.observacoes;
    if (cliente.totalPedidos !== undefined) updateData.totalPedidos = cliente.totalPedidos;
    if (cliente.valorTotalPedidos !== undefined) updateData.valorTotalPedidos = cliente.valorTotalPedidos;
    
    updateData.updatedAt = Timestamp.now();
    
    await updateDoc(clienteRef, updateData);
  } catch (error: any) {
    console.error("Erro ao atualizar cliente:", error);
    throw error;
  }
};

// Deletar um cliente
export const deleteCliente = async (clienteId: string): Promise<void> => {
  try {
    const clienteRef = doc(db, "clientes", clienteId);
    await deleteDoc(clienteRef);
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    throw error;
  }
};
