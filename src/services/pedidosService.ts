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

export type OrderStatus = "preparando" | "indo-para-entrega" | "confirmando-pagamento" | "concluido";

export interface Order {
  id: string;
  numero: string;
  clienteNome: string;
  clienteWhatsapp: string;
  status: OrderStatus;
  dataHora: Date;
  formaPagamento: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Converter documento do Firestore para Order
const firestoreDocToOrder = (doc: QueryDocumentSnapshot<DocumentData>): Order => {
  const data = doc.data();
  
  // Converter Timestamp para Date
  let createdAt: Date;
  let updatedAt: Date;
  let dataHora: Date;
  
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

  if (data.dataHora) {
    if (data.dataHora.toDate) {
      dataHora = data.dataHora.toDate();
    } else if (data.dataHora instanceof Timestamp) {
      dataHora = data.dataHora.toDate();
    } else if (data.dataHora.seconds) {
      dataHora = new Date(data.dataHora.seconds * 1000);
    } else {
      dataHora = new Date();
    }
  } else {
    dataHora = new Date();
  }
  
  return {
    id: doc.id,
    numero: data.numero || "",
    clienteNome: data.clienteNome || "",
    clienteWhatsapp: data.clienteWhatsapp || "",
    status: data.status || "preparando",
    dataHora,
    formaPagamento: data.formaPagamento || "",
    userId: data.userId || "",
    createdAt,
    updatedAt,
  };
};

// Converter Order para formato do Firestore
const orderToFirestore = (order: Omit<Order, "id" | "createdAt" | "updatedAt">): DocumentData => {
  return {
    numero: order.numero,
    clienteNome: order.clienteNome,
    clienteWhatsapp: order.clienteWhatsapp,
    status: order.status,
    dataHora: Timestamp.fromDate(order.dataHora),
    formaPagamento: order.formaPagamento,
    userId: order.userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
};

// Obter todos os pedidos do usuário autenticado
export const getOrders = async (userId: string): Promise<Order[]> => {
  try {
    if (!userId) {
      console.warn("getOrders chamado sem userId");
      return [];
    }

    console.log("=== DEBUG PEDIDOS ===");
    console.log("Buscando pedidos para userId:", userId);
    const ordersRef = collection(db, "pedidos");
    let querySnapshot;
    
    try {
      const q = query(
        ordersRef,
        where("userId", "==", userId),
        orderBy("dataHora", "desc")
      );
      querySnapshot = await getDocs(q);
      console.log("Query com orderBy executada com sucesso");
    } catch (error: any) {
      if (error?.code === "failed-precondition" || error?.code === 9) {
        console.warn("Índice não encontrado, usando query sem orderBy");
        const q = query(
          ordersRef,
          where("userId", "==", userId)
        );
        querySnapshot = await getDocs(q);
        console.log("Query sem orderBy executada com sucesso");
      } else {
        throw error;
      }
    }
    
    console.log("Documentos encontrados:", querySnapshot.size);
    
    // Debug: mostrar dados brutos de cada documento
    querySnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Documento ${index + 1} (ID: ${doc.id}):`, {
        numero: data.numero,
        userId: data.userId,
        userIdEsperado: userId,
        userIdMatch: data.userId === userId,
        dataHora: data.dataHora
      });
    });
    
    if (querySnapshot.empty) {
      console.log("Nenhum pedido encontrado para o usuário");
      console.log("Verifique se os pedidos no Firebase têm userId correto:", userId);
      return [];
    }
    
    const orders = querySnapshot.docs.map((doc) => {
      try {
        const order = firestoreDocToOrder(doc);
        console.log("Pedido convertido:", order.id, order.numero, order.dataHora);
        return order;
      } catch (error) {
        console.error("Erro ao converter documento:", error, doc.id);
        console.error("Dados do documento:", doc.data());
        return null;
      }
    }).filter((order): order is Order => order !== null);
    
    console.log("Total de pedidos convertidos:", orders.length);
    
    // Ordena manualmente se não usou orderBy
    const sortedOrders = orders.sort((a, b) => b.dataHora.getTime() - a.dataHora.getTime());
    console.log("Pedidos retornados:", sortedOrders.length);
    return sortedOrders;
  } catch (error: any) {
    console.error("Erro ao buscar pedidos:", error);
    console.error("Código do erro:", error?.code);
    console.error("Mensagem do erro:", error?.message);
    throw error;
  }
};

// Obter um pedido específico
export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, "pedidos", orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      return firestoreDocToOrder(orderSnap as QueryDocumentSnapshot<DocumentData>);
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    throw error;
  }
};

// Criar um novo pedido
export const createOrder = async (
  order: Omit<Order, "id" | "userId" | "createdAt" | "updatedAt">,
  userId: string
): Promise<string> => {
  try {
    if (!userId) {
      throw new Error("userId é obrigatório para criar um pedido");
    }

    const ordersRef = collection(db, "pedidos");
    const orderData = orderToFirestore({ ...order, userId });
    
    const docRef = await addDoc(ordersRef, orderData);
    return docRef.id;
  } catch (error: any) {
    console.error("Erro ao criar pedido:", error);
    throw error;
  }
};

// Atualizar um pedido existente
export const updateOrder = async (
  orderId: string,
  order: Partial<Omit<Order, "id" | "createdAt" | "updatedAt" | "userId">>
): Promise<void> => {
  try {
    const orderRef = doc(db, "pedidos", orderId);
    const updateData: DocumentData = {};
    
    if (order.numero !== undefined) updateData.numero = order.numero;
    if (order.clienteNome !== undefined) updateData.clienteNome = order.clienteNome;
    if (order.clienteWhatsapp !== undefined) updateData.clienteWhatsapp = order.clienteWhatsapp;
    if (order.status !== undefined) updateData.status = order.status;
    if (order.dataHora !== undefined) updateData.dataHora = Timestamp.fromDate(order.dataHora);
    if (order.formaPagamento !== undefined) updateData.formaPagamento = order.formaPagamento;
    
    updateData.updatedAt = Timestamp.now();
    
    await updateDoc(orderRef, updateData);
  } catch (error: any) {
    console.error("Erro ao atualizar pedido:", error);
    throw error;
  }
};

// Deletar um pedido
export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    const orderRef = doc(db, "pedidos", orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error("Erro ao deletar pedido:", error);
    throw error;
  }
};
