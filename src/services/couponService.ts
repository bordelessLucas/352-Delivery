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
import type { Coupon, DiscountType } from "../pages/Cupons/Cupons";

// Converter Date para Timestamp do Firestore
const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Converter Timestamp do Firestore para Date
const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Converter documento do Firestore para Coupon
const firestoreDocToCoupon = (doc: QueryDocumentSnapshot<DocumentData>): Coupon => {
  const data = doc.data();
  
  // Verificar se dataValidade é Timestamp ou Date
  let dataValidade: Date;
  if (data.dataValidade?.toDate) {
    // É um Timestamp do Firestore
    dataValidade = data.dataValidade.toDate();
  } else if (data.dataValidade instanceof Date) {
    // Já é uma Date
    dataValidade = data.dataValidade;
  } else if (data.dataValidade?.seconds) {
    // É um Timestamp com seconds
    dataValidade = timestampToDate(data.dataValidade);
  } else {
    // Fallback: usar data atual
    console.warn(`Documento ${doc.id} não tem dataValidade válida, usando data atual`);
    dataValidade = new Date();
  }
  
  return {
    id: doc.id,
    codigo: data.codigo || "",
    tipoDesconto: (data.tipoDesconto || "percentual") as DiscountType,
    valorDesconto: data.valorDesconto || 0,
    dataValidade,
    limiteUso: data.limiteUso || 0,
    usosAtuais: data.usosAtuais || 0,
    valorMinimo: data.valorMinimo || 0,
    ativo: data.ativo !== undefined ? data.ativo : true,
  };
};

// Converter Coupon para formato do Firestore
const couponToFirestore = (coupon: Omit<Coupon, "id">): DocumentData => {
  return {
    codigo: coupon.codigo,
    tipoDesconto: coupon.tipoDesconto,
    valorDesconto: coupon.valorDesconto,
    dataValidade: dateToTimestamp(coupon.dataValidade),
    limiteUso: coupon.limiteUso,
    usosAtuais: coupon.usosAtuais || 0,
    valorMinimo: coupon.valorMinimo || 0,
    ativo: coupon.ativo !== undefined ? coupon.ativo : true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
};

// Obter todos os cupons do usuário autenticado
export const getCoupons = async (userId: string): Promise<Coupon[]> => {
  try {
    if (!userId) {
      console.warn("getCoupons chamado sem userId");
      return [];
    }

    const couponsRef = collection(db, "cupons");
    const q = query(
      couponsRef,
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Se não houver documentos, retornar array vazio
    if (querySnapshot.empty) {
      return [];
    }
    
    const coupons = querySnapshot.docs.map((doc) => {
      try {
        return firestoreDocToCoupon(doc);
      } catch (error) {
        console.error("Erro ao converter documento:", error, doc.id);
        return null;
      }
    }).filter((coupon): coupon is Coupon => coupon !== null);
    
    // Ordenar por data de validade (mais recente primeiro)
    return coupons.sort((a, b) => {
      return b.dataValidade.getTime() - a.dataValidade.getTime();
    });
  } catch (error: any) {
    console.error("Erro ao buscar cupons:", error);
    
    // Se for erro de índice, retornar array vazio e logar aviso
    if (error?.code === "failed-precondition" || error?.code === 9) {
      console.warn("Índice do Firestore não encontrado. Retornando lista vazia.");
      console.warn("Para criar o índice, acesse o console do Firebase e siga o link fornecido no erro.");
      return [];
    }
    
    // Se for erro de permissão, retornar array vazio
    if (error?.code === "permission-denied" || error?.code === 7) {
      console.warn("Permissão negada ao acessar cupons. Verifique as regras do Firestore.");
      return [];
    }
    
    throw error;
  }
};

// Obter um cupom específico
export const getCoupon = async (couponId: string): Promise<Coupon | null> => {
  try {
    const couponRef = doc(db, "cupons", couponId);
    const couponSnap = await getDoc(couponRef);
    
    if (couponSnap.exists()) {
      return firestoreDocToCoupon(couponSnap as QueryDocumentSnapshot<DocumentData>);
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar cupom:", error);
    throw error;
  }
};

// Criar um novo cupom
export const createCoupon = async (
  coupon: Omit<Coupon, "id" | "usosAtuais">,
  userId: string
): Promise<string> => {
  try {
    if (!userId) {
      throw new Error("userId é obrigatório para criar um cupom");
    }

    console.log("Criando cupom para usuário:", userId);
    const couponsRef = collection(db, "cupons");
    const couponData = {
      ...couponToFirestore({ ...coupon, usosAtuais: 0 }),
      userId,
    };
    
    console.log("Dados do cupom a ser criado:", couponData);
    const docRef = await addDoc(couponsRef, couponData);
    console.log("Cupom criado com ID:", docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error("Erro ao criar cupom:", error);
    console.error("Código do erro:", error?.code);
    console.error("Mensagem do erro:", error?.message);
    throw error;
  }
};

// Atualizar um cupom existente
export const updateCoupon = async (
  couponId: string,
  coupon: Partial<Omit<Coupon, "id" | "usosAtuais">>
): Promise<void> => {
  try {
    const couponRef = doc(db, "cupons", couponId);
    const updateData: DocumentData = {};
    
    if (coupon.codigo !== undefined) updateData.codigo = coupon.codigo;
    if (coupon.tipoDesconto !== undefined) updateData.tipoDesconto = coupon.tipoDesconto;
    if (coupon.valorDesconto !== undefined) updateData.valorDesconto = coupon.valorDesconto;
    if (coupon.dataValidade !== undefined) updateData.dataValidade = dateToTimestamp(coupon.dataValidade);
    if (coupon.limiteUso !== undefined) updateData.limiteUso = coupon.limiteUso;
    if (coupon.valorMinimo !== undefined) updateData.valorMinimo = coupon.valorMinimo;
    if (coupon.ativo !== undefined) updateData.ativo = coupon.ativo;
    
    updateData.updatedAt = Timestamp.now();
    
    await updateDoc(couponRef, updateData);
  } catch (error) {
    console.error("Erro ao atualizar cupom:", error);
    throw error;
  }
};

// Deletar um cupom
export const deleteCoupon = async (couponId: string): Promise<void> => {
  try {
    const couponRef = doc(db, "cupons", couponId);
    await deleteDoc(couponRef);
  } catch (error) {
    console.error("Erro ao deletar cupom:", error);
    throw error;
  }
};

// Incrementar uso de um cupom
export const incrementCouponUsage = async (couponId: string): Promise<void> => {
  try {
    const couponRef = doc(db, "cupons", couponId);
    const couponSnap = await getDoc(couponRef);
    
    if (couponSnap.exists()) {
      const currentUsos = couponSnap.data().usosAtuais || 0;
      await updateDoc(couponRef, {
        usosAtuais: currentUsos + 1,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error("Erro ao incrementar uso do cupom:", error);
    throw error;
  }
};
