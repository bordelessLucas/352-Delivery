import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firestore";
import { uploadImage } from "./imageUploadService";

export interface Banner {
  id?: string;
  userId: string;
  titulo: string;
  imagemDesktop: string;
  imagemMobile: string;
  visivel: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Converter documento do Firestore para Banner
const firestoreDocToBanner = (doc: QueryDocumentSnapshot<DocumentData>): Banner => {
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
    titulo: data.titulo || "",
    imagemDesktop: data.imagemDesktop || "",
    imagemMobile: data.imagemMobile || "",
    visivel: data.visivel ?? true,
    createdAt,
    updatedAt,
  };
};

// Converter Banner para formato do Firestore
const bannerToFirestore = (banner: Omit<Banner, "id" | "createdAt" | "updatedAt">): DocumentData => {
  return {
    userId: banner.userId,
    titulo: banner.titulo,
    imagemDesktop: banner.imagemDesktop,
    imagemMobile: banner.imagemMobile,
    visivel: banner.visivel,
    updatedAt: Timestamp.now(),
  };
};

/**
 * Obter todos os banners de um usuário
 */
export const getBanners = async (userId: string): Promise<Banner[]> => {
  try {
    if (!userId) {
      throw new Error("userId é obrigatório");
    }

    const bannersRef = collection(db, "banners");
    const q = query(bannersRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => firestoreDocToBanner(doc as QueryDocumentSnapshot<DocumentData>));
  } catch (error: any) {
    console.error("Erro ao buscar banners:", error);
    throw error;
  }
};

/**
 * Criar um novo banner
 */
export const createBanner = async (
  banner: Omit<Banner, "id" | "userId" | "createdAt" | "updatedAt">,
  userId: string,
  desktopFile?: File,
  mobileFile?: File
): Promise<string> => {
  try {
    if (!userId) {
      throw new Error("userId é obrigatório");
    }

    let imagemDesktop = banner.imagemDesktop;
    let imagemMobile = banner.imagemMobile;

    // Fazer upload das imagens se arquivos foram fornecidos
    if (desktopFile) {
      const desktopPath = `banners/${userId}/desktop-${Date.now()}`;
      imagemDesktop = await uploadImage(desktopFile, desktopPath);
    }

    if (mobileFile) {
      const mobilePath = `banners/${userId}/mobile-${Date.now()}`;
      imagemMobile = await uploadImage(mobileFile, mobilePath);
    }

    const bannerData = {
      ...banner,
      userId,
      imagemDesktop,
      imagemMobile,
    };

    const bannersRef = collection(db, "banners");
    const bannerDoc = {
      ...bannerToFirestore(bannerData),
      createdAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(bannersRef, bannerDoc);
    return docRef.id;
  } catch (error: any) {
    console.error("Erro ao criar banner:", error);
    throw error;
  }
};

/**
 * Atualizar um banner existente
 */
export const updateBanner = async (
  bannerId: string,
  banner: Partial<Omit<Banner, "id" | "userId" | "createdAt" | "updatedAt">>,
  desktopFile?: File,
  mobileFile?: File
): Promise<void> => {
  try {
    const bannerRef = doc(db, "banners", bannerId);
    const bannerSnap = await getDoc(bannerRef);
    
    if (!bannerSnap.exists()) {
      throw new Error("Banner não encontrado");
    }

    const currentData = bannerSnap.data();
    let imagemDesktop = currentData.imagemDesktop;
    let imagemMobile = currentData.imagemMobile;

    // Fazer upload das novas imagens se arquivos foram fornecidos
    if (desktopFile) {
      const desktopPath = `banners/${currentData.userId}/desktop-${Date.now()}`;
      imagemDesktop = await uploadImage(desktopFile, desktopPath);
    }

    if (mobileFile) {
      const mobilePath = `banners/${currentData.userId}/mobile-${Date.now()}`;
      imagemMobile = await uploadImage(mobileFile, mobilePath);
    }

    await updateDoc(bannerRef, {
      ...banner,
      imagemDesktop,
      imagemMobile,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    console.error("Erro ao atualizar banner:", error);
    throw error;
  }
};

/**
 * Deletar um banner
 */
export const deleteBanner = async (bannerId: string): Promise<void> => {
  try {
    const bannerRef = doc(db, "banners", bannerId);
    await deleteDoc(bannerRef);
  } catch (error: any) {
    console.error("Erro ao deletar banner:", error);
    throw error;
  }
};
