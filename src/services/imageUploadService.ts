import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../lib/firebase";

const storage = getStorage(app);

/**
 * Faz upload de uma imagem para o Firebase Storage
 * @param file Arquivo de imagem a ser enviado
 * @param path Caminho no storage (ex: "banners/banner-123")
 * @returns URL de download da imagem
 */
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    console.error("Erro ao fazer upload da imagem:", error);
    throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
  }
};

/**
 * Faz upload de múltiplas imagens
 * @param files Array de arquivos
 * @param basePath Caminho base no storage
 * @returns Array de URLs de download
 */
export const uploadMultipleImages = async (
  files: File[],
  basePath: string
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file, index) => {
      const fileExtension = file.name.split(".").pop();
      const fileName = `${basePath}-${index}.${fileExtension}`;
      return uploadImage(file, fileName);
    });
    
    return await Promise.all(uploadPromises);
  } catch (error: any) {
    console.error("Erro ao fazer upload das imagens:", error);
    throw new Error(`Erro ao fazer upload das imagens: ${error.message}`);
  }
};
