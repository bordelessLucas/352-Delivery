import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../lib/firestore";
import { getOrders, type Order } from "./pedidosService";

export interface ReportStats {
  faturamentoDia: number;
  faturamentoSemana: number;
  faturamentoMes: number;
  pedidosMes: number;
}

export interface ReportData {
  pedidosConcluidos: number;
  pedidosCancelados: number;
  totalPedidos: number;
  pix: number;
  credito: number;
  debito: number;
  dinheiro: number;
  totalGanho: number;
}

// Calcular estatísticas do dashboard (faturamento do dia, semana, mês)
export const getReportStats = async (userId: string): Promise<ReportStats> => {
  try {
    const orders = await getOrders(userId);
    
    const now = new Date();
    const inicioDia = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const inicioSemana = new Date(now);
    inicioSemana.setDate(now.getDate() - now.getDay());
    inicioSemana.setHours(0, 0, 0, 0);
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let faturamentoDia = 0;
    let faturamentoSemana = 0;
    let faturamentoMes = 0;
    let pedidosMes = 0;
    
    // Assumindo que pedidos concluídos têm um campo "valorTotal" ou precisamos calcular
    // Por enquanto, vamos usar um valor padrão ou buscar de outra fonte
    // Se os pedidos não têm valor, vamos contar apenas os pedidos
    
    orders.forEach((order) => {
      const orderDate = order.dataHora;
      
      if (orderDate >= inicioMes) {
        pedidosMes++;
        if (order.status === "concluido") {
          // Se não houver valorTotal no pedido, usar um valor padrão ou 0
          // Você pode adicionar um campo valorTotal ao Order depois
          const valorPedido = (order as any).valorTotal || 0;
          faturamentoMes += valorPedido;
        }
      }
      
      if (orderDate >= inicioSemana && order.status === "concluido") {
        const valorPedido = (order as any).valorTotal || 0;
        faturamentoSemana += valorPedido;
      }
      
      if (orderDate >= inicioDia && order.status === "concluido") {
        const valorPedido = (order as any).valorTotal || 0;
        faturamentoDia += valorPedido;
      }
    });
    
    return {
      faturamentoDia,
      faturamentoSemana,
      faturamentoMes,
      pedidosMes,
    };
  } catch (error) {
    console.error("Erro ao calcular estatísticas:", error);
    return {
      faturamentoDia: 0,
      faturamentoSemana: 0,
      faturamentoMes: 0,
      pedidosMes: 0,
    };
  }
};

// Gerar relatório de vendas para um período
export const generateReport = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<ReportData> => {
  try {
    const orders = await getOrders(userId);
    
    // Filtrar pedidos no período
    const filteredOrders = orders.filter((order) => {
      const orderDate = order.dataHora;
      return orderDate >= startDate && orderDate <= endDate;
    });
    
    let pedidosConcluidos = 0;
    let pedidosCancelados = 0;
    let pix = 0;
    let credito = 0;
    let debito = 0;
    let dinheiro = 0;
    
    filteredOrders.forEach((order) => {
      const valorPedido = (order as any).valorTotal || 0;
      
      if (order.status === "concluido") {
        pedidosConcluidos++;
        
        // Agrupar por forma de pagamento
        const formaPagamento = order.formaPagamento.toLowerCase();
        if (formaPagamento.includes("pix")) {
          pix += valorPedido;
        } else if (formaPagamento.includes("crédito") || formaPagamento.includes("credito")) {
          credito += valorPedido;
        } else if (formaPagamento.includes("débito") || formaPagamento.includes("debito")) {
          debito += valorPedido;
        } else if (formaPagamento.includes("dinheiro")) {
          dinheiro += valorPedido;
        }
      } else if (order.status === "cancelado") {
        pedidosCancelados++;
      }
    });
    
    const totalGanho = pix + credito + debito + dinheiro;
    
    return {
      pedidosConcluidos,
      pedidosCancelados,
      totalPedidos: filteredOrders.length,
      pix,
      credito,
      debito,
      dinheiro,
      totalGanho,
    };
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return {
      pedidosConcluidos: 0,
      pedidosCancelados: 0,
      totalPedidos: 0,
      pix: 0,
      credito: 0,
      debito: 0,
      dinheiro: 0,
      totalGanho: 0,
    };
  }
};
