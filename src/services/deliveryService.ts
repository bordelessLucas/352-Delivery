import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firestore";

export interface BairroDelivery {
  id: string;
  nome: string;
  distancia: number;
  preco: number;
}

export interface ConfigDelivery {
  tempoEntrega: string;
  bairros: BairroDelivery[];
  ativo: boolean;
}

export interface Delivery {
  id?: string;
  userId: string;
  config: ConfigDelivery;
  createdAt: Date;
  updatedAt: Date;
}

// Valores padrão
const defaultConfig: ConfigDelivery = {
  tempoEntrega: "",
  bairros: [],
  ativo: true,
};

// Converter documento do Firestore para Delivery
const firestoreDocToDelivery = (doc: QueryDocumentSnapshot<DocumentData>): Delivery => {
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
    userId: data.userId || "",
    config: data.config || defaultConfig,
    createdAt,
    updatedAt,
  };
};

// Converter Delivery para formato do Firestore
const deliveryToFirestore = (delivery: Omit<Delivery, "id" | "createdAt" | "updatedAt">): DocumentData => {
  return {
    userId: delivery.userId,
    config: delivery.config,
    updatedAt: Timestamp.now(),
  };
};

// Obter configurações de delivery do usuário (cria se não existir)
export const getDelivery = async (userId: string): Promise<Delivery> => {
  try {
    if (!userId) {
      throw new Error("userId é obrigatório");
    }

    const deliveryRef = doc(db, "delivery", userId);
    const deliverySnap = await getDoc(deliveryRef);
    
    if (deliverySnap.exists()) {
      return firestoreDocToDelivery(deliverySnap as QueryDocumentSnapshot<DocumentData>);
    } else {
      // Criar configurações padrão se não existir
      const defaultDelivery: Omit<Delivery, "id" | "createdAt" | "updatedAt"> = {
        userId,
        config: defaultConfig,
      };
      
      const deliveryData = {
        ...deliveryToFirestore(defaultDelivery),
        createdAt: Timestamp.now(),
      };
      
      await setDoc(deliveryRef, deliveryData);
      
      return {
        id: userId,
        ...defaultDelivery,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  } catch (error: any) {
    console.error("Erro ao buscar delivery:", error);
    throw error;
  }
};

// Atualizar configurações de delivery
export const updateDelivery = async (
  userId: string,
  config: Partial<ConfigDelivery>
): Promise<void> => {
  try {
    const deliveryRef = doc(db, "delivery", userId);
    const deliverySnap = await getDoc(deliveryRef);
    
    if (deliverySnap.exists()) {
      const currentData = deliverySnap.data();
      await updateDoc(deliveryRef, {
        config: { ...currentData.config, ...config },
        updatedAt: Timestamp.now(),
      });
    } else {
      await setDoc(deliveryRef, {
        userId,
        config: { ...defaultConfig, ...config },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error: any) {
    console.error("Erro ao atualizar delivery:", error);
    throw error;
  }
};

// Adicionar bairro
export const addBairro = async (
  userId: string,
  bairro: Omit<BairroDelivery, "id">
): Promise<void> => {
  try {
    const delivery = await getDelivery(userId);
    const newBairro: BairroDelivery = {
      id: Date.now().toString(),
      ...bairro,
    };
    
    const updatedBairros = [...delivery.config.bairros, newBairro];
    
    await updateDelivery(userId, {
      bairros: updatedBairros,
    });
  } catch (error: any) {
    console.error("Erro ao adicionar bairro:", error);
    throw error;
  }
};

// Atualizar bairro
export const updateBairro = async (
  userId: string,
  bairroId: string,
  bairro: Partial<Omit<BairroDelivery, "id">>
): Promise<void> => {
  try {
    const delivery = await getDelivery(userId);
    const updatedBairros = delivery.config.bairros.map((b) =>
      b.id === bairroId ? { ...b, ...bairro } : b
    );
    
    await updateDelivery(userId, {
      bairros: updatedBairros,
    });
  } catch (error: any) {
    console.error("Erro ao atualizar bairro:", error);
    throw error;
  }
};

// Remover bairro
export const removeBairro = async (
  userId: string,
  bairroId: string
): Promise<void> => {
  try {
    const delivery = await getDelivery(userId);
    const updatedBairros = delivery.config.bairros.filter((b) => b.id !== bairroId);
    
    await updateDelivery(userId, {
      bairros: updatedBairros,
    });
  } catch (error: any) {
    console.error("Erro ao remover bairro:", error);
    throw error;
  }
};
