import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firestore";

export interface Plano {
  id?: string;
  userId: string;
  tipo: "anual" | "mensal" | "gratuito";
  dataInicio: Date;
  dataFim: Date;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Converter documento do Firestore para Plano
const firestoreDocToPlano = (doc: QueryDocumentSnapshot<DocumentData>): Plano => {
  const data = doc.data();
  
  let createdAt: Date;
  let updatedAt: Date;
  let dataInicio: Date;
  let dataFim: Date;
  
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

  if (data.dataInicio?.toDate) {
    dataInicio = data.dataInicio.toDate();
  } else if (data.dataInicio instanceof Timestamp) {
    dataInicio = data.dataInicio.toDate();
  } else if (data.dataInicio?.seconds) {
    dataInicio = new Date(data.dataInicio.seconds * 1000);
  } else {
    dataInicio = new Date();
  }

  if (data.dataFim?.toDate) {
    dataFim = data.dataFim.toDate();
  } else if (data.dataFim instanceof Timestamp) {
    dataFim = data.dataFim.toDate();
  } else if (data.dataFim?.seconds) {
    dataFim = new Date(data.dataFim.seconds * 1000);
  } else {
    // Criar plano anual padrão se não existir dataFim
    dataFim = new Date();
    dataFim.setFullYear(dataFim.getFullYear() + 1);
  }
  
  return {
    id: doc.id,
    userId: data.userId || "",
    tipo: data.tipo || "gratuito",
    dataInicio,
    dataFim,
    ativo: data.ativo !== undefined ? data.ativo : true,
    createdAt,
    updatedAt,
  };
};

// Converter Plano para formato do Firestore
const planoToFirestore = (plano: Omit<Plano, "id" | "createdAt" | "updatedAt">): DocumentData => {
  return {
    userId: plano.userId,
    tipo: plano.tipo,
    dataInicio: Timestamp.fromDate(plano.dataInicio),
    dataFim: Timestamp.fromDate(plano.dataFim),
    ativo: plano.ativo,
    updatedAt: Timestamp.now(),
  };
};

// Obter plano do usuário (cria plano gratuito se não existir)
export const getPlano = async (userId: string): Promise<Plano> => {
  try {
    if (!userId) {
      throw new Error("userId é obrigatório");
    }

    const planoRef = doc(db, "planos", userId);
    const planoSnap = await getDoc(planoRef);
    
    if (planoSnap.exists()) {
      return firestoreDocToPlano(planoSnap as QueryDocumentSnapshot<DocumentData>);
    } else {
      // Criar plano gratuito padrão
      const dataInicio = new Date();
      const dataFim = new Date();
      dataFim.setFullYear(dataFim.getFullYear() + 1); // Plano anual padrão
      
      const defaultPlano: Omit<Plano, "id" | "createdAt" | "updatedAt"> = {
        userId,
        tipo: "anual",
        dataInicio,
        dataFim,
        ativo: true,
      };
      
      const planoData = {
        ...planoToFirestore(defaultPlano),
        createdAt: Timestamp.now(),
      };
      
      await setDoc(planoRef, planoData);
      
      return {
        id: userId,
        ...defaultPlano,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  } catch (error: any) {
    console.error("Erro ao buscar plano:", error);
    throw error;
  }
};

// Calcular dias restantes do plano
export const calcularDiasRestantes = (plano: Plano): number => {
  const agora = new Date();
  const dataFim = plano.dataFim;
  
  if (dataFim < agora) {
    return 0; // Plano expirado
  }
  
  const diffTime = dataFim.getTime() - agora.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Atualizar plano
export const updatePlano = async (
  userId: string,
  plano: Partial<Omit<Plano, "id" | "userId" | "createdAt" | "updatedAt">>
): Promise<void> => {
  try {
    const planoRef = doc(db, "planos", userId);
    const planoSnap = await getDoc(planoRef);
    
    const updateData: DocumentData = {
      updatedAt: Timestamp.now(),
    };
    
    if (plano.tipo !== undefined) updateData.tipo = plano.tipo;
    if (plano.dataInicio !== undefined) updateData.dataInicio = Timestamp.fromDate(plano.dataInicio);
    if (plano.dataFim !== undefined) updateData.dataFim = Timestamp.fromDate(plano.dataFim);
    if (plano.ativo !== undefined) updateData.ativo = plano.ativo;
    
    if (planoSnap.exists()) {
      await updateDoc(planoRef, updateData);
    } else {
      // Criar plano se não existir
      const dataInicio = plano.dataInicio || new Date();
      const dataFim = plano.dataFim || new Date();
      dataFim.setFullYear(dataFim.getFullYear() + 1);
      
      await setDoc(planoRef, {
        userId,
        tipo: plano.tipo || "anual",
        dataInicio: Timestamp.fromDate(dataInicio),
        dataFim: Timestamp.fromDate(dataFim),
        ativo: plano.ativo !== undefined ? plano.ativo : true,
        createdAt: Timestamp.now(),
        ...updateData,
      });
    }
  } catch (error: any) {
    console.error("Erro ao atualizar plano:", error);
    throw error;
  }
};
