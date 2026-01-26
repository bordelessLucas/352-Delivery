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

export type DiaSemana = "domingo" | "segunda" | "terca" | "quarta" | "quinta" | "sexta" | "sabado";
export type Turno = "manha" | "tarde" | "noite";

export interface HorarioFuncionamento {
  dia: DiaSemana;
  turno: Turno;
  horaInicio: string; // Formato HH:mm
  horaFim: string; // Formato HH:mm
  ativo: boolean;
}

export interface HorariosConfig {
  id?: string;
  userId: string;
  horarios: HorarioFuncionamento[];
  createdAt: Date;
  updatedAt: Date;
}

// Valores padrão - todos os dias fechados
const defaultHorarios: HorarioFuncionamento[] = [
  { dia: "domingo", turno: "manha", horaInicio: "08:00", horaFim: "12:00", ativo: false },
  { dia: "segunda", turno: "manha", horaInicio: "08:00", horaFim: "12:00", ativo: true },
  { dia: "terca", turno: "manha", horaInicio: "08:00", horaFim: "12:00", ativo: true },
  { dia: "quarta", turno: "manha", horaInicio: "08:00", horaFim: "12:00", ativo: true },
  { dia: "quinta", turno: "manha", horaInicio: "08:00", horaFim: "12:00", ativo: true },
  { dia: "sexta", turno: "manha", horaInicio: "08:00", horaFim: "12:00", ativo: true },
  { dia: "sabado", turno: "manha", horaInicio: "08:00", horaFim: "12:00", ativo: false },
];

// Converter documento do Firestore para HorariosConfig
const firestoreDocToHorarios = (doc: QueryDocumentSnapshot<DocumentData>): HorariosConfig => {
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
    horarios: data.horarios || defaultHorarios,
    createdAt,
    updatedAt,
  };
};

// Converter HorariosConfig para formato do Firestore
const horariosToFirestore = (horarios: Omit<HorariosConfig, "id" | "createdAt" | "updatedAt">): DocumentData => {
  return {
    userId: horarios.userId,
    horarios: horarios.horarios,
    updatedAt: Timestamp.now(),
  };
};

// Obter horários do usuário (cria padrão se não existir)
export const getHorarios = async (userId: string): Promise<HorariosConfig> => {
  try {
    if (!userId) {
      throw new Error("userId é obrigatório");
    }

    const horariosRef = doc(db, "horarios", userId);
    const horariosSnap = await getDoc(horariosRef);
    
    if (horariosSnap.exists()) {
      return firestoreDocToHorarios(horariosSnap as QueryDocumentSnapshot<DocumentData>);
    } else {
      // Criar horários padrão
      const defaultHorariosConfig: Omit<HorariosConfig, "id" | "createdAt" | "updatedAt"> = {
        userId,
        horarios: defaultHorarios,
      };
      
      const horariosData = {
        ...horariosToFirestore(defaultHorariosConfig),
        createdAt: Timestamp.now(),
      };
      
      await setDoc(horariosRef, horariosData);
      
      return {
        id: userId,
        ...defaultHorariosConfig,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  } catch (error: any) {
    console.error("Erro ao buscar horários:", error);
    throw error;
  }
};

// Atualizar horários
export const updateHorarios = async (
  userId: string,
  horarios: HorarioFuncionamento[]
): Promise<void> => {
  try {
    const horariosRef = doc(db, "horarios", userId);
    const horariosSnap = await getDoc(horariosRef);
    
    if (horariosSnap.exists()) {
      await updateDoc(horariosRef, {
        horarios,
        updatedAt: Timestamp.now(),
      });
    } else {
      await setDoc(horariosRef, {
        userId,
        horarios,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error: any) {
    console.error("Erro ao atualizar horários:", error);
    throw error;
  }
};

// Labels para os dias da semana
export const diaLabels: Record<DiaSemana, string> = {
  domingo: "Domingo",
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
};

// Labels para os turnos
export const turnoLabels: Record<Turno, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
};
