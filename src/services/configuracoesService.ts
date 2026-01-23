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

// Interfaces para Configurações
export interface ConfigGeral {
  nomeLoja: string;
  descricao: string;
  segmento: string;
  titulo: string;
  estado: string;
  cidade: string;
  url: string;
}

export interface ConfigAparencia {
  fotoPerfil: string;
  capa: string;
  corLayout: string;
  exibicao: "grade" | "lista";
}

export interface ConfigPagamento {
  aceitaDinheiro: boolean;
  aceitaCredito: boolean;
  aceitaDebito: boolean;
  bandeiras: string;
  aceitaPix: boolean;
}

export interface BairroEntrega {
  id: string;
  nome: string;
  distancia: number;
  preco: number;
}

export interface ConfigEntrega {
  tempoEntrega: string;
  bairros: BairroEntrega[];
}

export interface ConfigContato {
  whatsapp: string;
  email: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  localizacao: string;
}

export interface ConfigUsuario {
  nomeUsuario: string;
  dataNascimento: string;
  tipoDocumento: "CPF" | "CNPJ";
  numeroDocumento: string;
  email: string;
  senha?: string; // Não armazenar senha em texto plano, apenas para atualização
}

export interface Configuracoes {
  id?: string;
  userId: string;
  geral: ConfigGeral;
  aparencia: ConfigAparencia;
  pagamento: ConfigPagamento;
  entrega: ConfigEntrega;
  contato: ConfigContato;
  usuario: ConfigUsuario;
  createdAt: Date;
  updatedAt: Date;
}

// Valores padrão
const defaultGeral: ConfigGeral = {
  nomeLoja: "",
  descricao: "",
  segmento: "",
  titulo: "",
  estado: "",
  cidade: "",
  url: "",
};

const defaultAparencia: ConfigAparencia = {
  fotoPerfil: "",
  capa: "",
  corLayout: "#8B4513",
  exibicao: "grade",
};

const defaultPagamento: ConfigPagamento = {
  aceitaDinheiro: false,
  aceitaCredito: false,
  aceitaDebito: false,
  bandeiras: "",
  aceitaPix: false,
};

const defaultEntrega: ConfigEntrega = {
  tempoEntrega: "",
  bairros: [],
};

const defaultContato: ConfigContato = {
  whatsapp: "",
  email: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  youtube: "",
  localizacao: "",
};

const defaultUsuario: ConfigUsuario = {
  nomeUsuario: "",
  dataNascimento: "",
  tipoDocumento: "CPF",
  numeroDocumento: "",
  email: "",
};

// Converter documento do Firestore para Configuracoes
const firestoreDocToConfiguracoes = (doc: QueryDocumentSnapshot<DocumentData>): Configuracoes => {
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
    geral: data.geral || defaultGeral,
    aparencia: data.aparencia || defaultAparencia,
    pagamento: data.pagamento || defaultPagamento,
    entrega: data.entrega || defaultEntrega,
    contato: data.contato || defaultContato,
    usuario: data.usuario || defaultUsuario,
    createdAt,
    updatedAt,
  };
};

// Converter Configuracoes para formato do Firestore
const configuracoesToFirestore = (config: Omit<Configuracoes, "id" | "createdAt" | "updatedAt">): DocumentData => {
  return {
    userId: config.userId,
    geral: config.geral,
    aparencia: config.aparencia,
    pagamento: config.pagamento,
    entrega: config.entrega,
    contato: config.contato,
    usuario: {
      ...config.usuario,
      senha: undefined, // Não salvar senha em texto plano
    },
    updatedAt: Timestamp.now(),
  };
};

// Obter configurações do usuário (cria se não existir)
export const getConfiguracoes = async (userId: string): Promise<Configuracoes> => {
  try {
    if (!userId) {
      throw new Error("userId é obrigatório");
    }

    const configRef = doc(db, "configuracoes", userId);
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      return firestoreDocToConfiguracoes(configSnap as QueryDocumentSnapshot<DocumentData>);
    } else {
      // Criar configurações padrão se não existir
      const defaultConfig: Omit<Configuracoes, "id" | "createdAt" | "updatedAt"> = {
        userId,
        geral: defaultGeral,
        aparencia: defaultAparencia,
        pagamento: defaultPagamento,
        entrega: defaultEntrega,
        contato: defaultContato,
        usuario: defaultUsuario,
      };
      
      const configData = {
        ...configuracoesToFirestore(defaultConfig),
        createdAt: Timestamp.now(),
      };
      
      await setDoc(configRef, configData);
      
      return {
        id: userId,
        ...defaultConfig,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  } catch (error: any) {
    console.error("Erro ao buscar configurações:", error);
    throw error;
  }
};

// Atualizar configurações gerais
export const updateConfigGeral = async (
  userId: string,
  geral: Partial<ConfigGeral>
): Promise<void> => {
  try {
    const configRef = doc(db, "configuracoes", userId);
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      const currentData = configSnap.data();
      await updateDoc(configRef, {
        geral: { ...currentData.geral, ...geral },
        updatedAt: Timestamp.now(),
      });
    } else {
      // Criar documento com apenas geral
      await setDoc(configRef, {
        userId,
        geral: { ...defaultGeral, ...geral },
        aparencia: defaultAparencia,
        pagamento: defaultPagamento,
        entrega: defaultEntrega,
        contato: defaultContato,
        usuario: defaultUsuario,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error: any) {
    console.error("Erro ao atualizar configurações gerais:", error);
    throw error;
  }
};

// Atualizar configurações de aparência
export const updateConfigAparencia = async (
  userId: string,
  aparencia: Partial<ConfigAparencia>
): Promise<void> => {
  try {
    const configRef = doc(db, "configuracoes", userId);
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      const currentData = configSnap.data();
      await updateDoc(configRef, {
        aparencia: { ...currentData.aparencia, ...aparencia },
        updatedAt: Timestamp.now(),
      });
    } else {
      await setDoc(configRef, {
        userId,
        geral: defaultGeral,
        aparencia: { ...defaultAparencia, ...aparencia },
        pagamento: defaultPagamento,
        entrega: defaultEntrega,
        contato: defaultContato,
        usuario: defaultUsuario,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error: any) {
    console.error("Erro ao atualizar configurações de aparência:", error);
    throw error;
  }
};

// Atualizar configurações de pagamento
export const updateConfigPagamento = async (
  userId: string,
  pagamento: Partial<ConfigPagamento>
): Promise<void> => {
  try {
    const configRef = doc(db, "configuracoes", userId);
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      const currentData = configSnap.data();
      await updateDoc(configRef, {
        pagamento: { ...currentData.pagamento, ...pagamento },
        updatedAt: Timestamp.now(),
      });
    } else {
      await setDoc(configRef, {
        userId,
        geral: defaultGeral,
        aparencia: defaultAparencia,
        pagamento: { ...defaultPagamento, ...pagamento },
        entrega: defaultEntrega,
        contato: defaultContato,
        usuario: defaultUsuario,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error: any) {
    console.error("Erro ao atualizar configurações de pagamento:", error);
    throw error;
  }
};

// Atualizar configurações de entrega
export const updateConfigEntrega = async (
  userId: string,
  entrega: Partial<ConfigEntrega>
): Promise<void> => {
  try {
    const configRef = doc(db, "configuracoes", userId);
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      const currentData = configSnap.data();
      await updateDoc(configRef, {
        entrega: { ...currentData.entrega, ...entrega },
        updatedAt: Timestamp.now(),
      });
    } else {
      await setDoc(configRef, {
        userId,
        geral: defaultGeral,
        aparencia: defaultAparencia,
        pagamento: defaultPagamento,
        entrega: { ...defaultEntrega, ...entrega },
        contato: defaultContato,
        usuario: defaultUsuario,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error: any) {
    console.error("Erro ao atualizar configurações de entrega:", error);
    throw error;
  }
};

// Atualizar configurações de contato
export const updateConfigContato = async (
  userId: string,
  contato: Partial<ConfigContato>
): Promise<void> => {
  try {
    const configRef = doc(db, "configuracoes", userId);
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      const currentData = configSnap.data();
      await updateDoc(configRef, {
        contato: { ...currentData.contato, ...contato },
        updatedAt: Timestamp.now(),
      });
    } else {
      await setDoc(configRef, {
        userId,
        geral: defaultGeral,
        aparencia: defaultAparencia,
        pagamento: defaultPagamento,
        entrega: defaultEntrega,
        contato: { ...defaultContato, ...contato },
        usuario: defaultUsuario,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error: any) {
    console.error("Erro ao atualizar configurações de contato:", error);
    throw error;
  }
};

// Atualizar configurações de usuário
export const updateConfigUsuario = async (
  userId: string,
  usuario: Partial<ConfigUsuario>
): Promise<void> => {
  try {
    const configRef = doc(db, "configuracoes", userId);
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      const currentData = configSnap.data();
      const updatedUsuario = { ...currentData.usuario, ...usuario };
      // Remover senha do objeto antes de salvar
      delete updatedUsuario.senha;
      
      await updateDoc(configRef, {
        usuario: updatedUsuario,
        updatedAt: Timestamp.now(),
      });
    } else {
      const newUsuario = { ...defaultUsuario, ...usuario };
      delete newUsuario.senha;
      
      await setDoc(configRef, {
        userId,
        geral: defaultGeral,
        aparencia: defaultAparencia,
        pagamento: defaultPagamento,
        entrega: defaultEntrega,
        contato: defaultContato,
        usuario: newUsuario,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error: any) {
    console.error("Erro ao atualizar configurações de usuário:", error);
    throw error;
  }
};
