import { useState } from "react";
import { HiCalendar, HiPhone, HiUser, HiClock, HiCreditCard, HiCheckCircle } from "react-icons/hi";
import { Layout } from "../../components/layout";
import "./Pedidos.css";

const restaurantBg = "https://static.vecteezy.com/system/resources/previews/001/948/406/non_2x/wood-table-top-for-display-with-blurred-restaurant-background-free-photo.jpg";

export type OrderStatus = "preparando" | "indo-para-entrega" | "confirmando-pagamento" | "concluido";

export interface Order {
  id: string;
  numero: string;
  clienteNome: string;
  clienteWhatsapp: string;
  status: OrderStatus;
  dataHora: Date;
  formaPagamento: string;
}

const statusLabels: Record<OrderStatus, string> = {
  preparando: "Preparando",
  "indo-para-entrega": "Indo para Entrega",
  "confirmando-pagamento": "Confirmando Pagamento",
  concluido: "Concluído",
};

// Pedidos mockados
const mockOrders: Order[] = [
  {
    id: "1",
    numero: "001",
    clienteNome: "João Silva",
    clienteWhatsapp: "(11) 98765-4321",
    status: "preparando",
    dataHora: new Date(),
    formaPagamento: "Cartão de Crédito",
  },
  {
    id: "2",
    numero: "002",
    clienteNome: "Maria Santos",
    clienteWhatsapp: "(11) 97654-3210",
    status: "indo-para-entrega",
    dataHora: new Date(),
    formaPagamento: "PIX",
  },
  {
    id: "3",
    numero: "003",
    clienteNome: "Pedro Oliveira",
    clienteWhatsapp: "(11) 96543-2109",
    status: "confirmando-pagamento",
    dataHora: new Date(),
    formaPagamento: "Dinheiro",
  },
  {
    id: "4",
    numero: "004",
    clienteNome: "Ana Costa",
    clienteWhatsapp: "(11) 95432-1098",
    status: "preparando",
    dataHora: new Date(),
    formaPagamento: "Cartão de Débito",
  },
  {
    id: "5",
    numero: "005",
    clienteNome: "Carlos Ferreira",
    clienteWhatsapp: "(11) 94321-0987",
    status: "concluido",
    dataHora: new Date(Date.now() - 86400000), // Ontem
    formaPagamento: "PIX",
  },
  {
    id: "6",
    numero: "006",
    clienteNome: "Julia Almeida",
    clienteWhatsapp: "(11) 93210-9876",
    status: "concluido",
    dataHora: new Date(Date.now() - 172800000), // 2 dias atrás
    formaPagamento: "Cartão de Crédito",
  },
];

const Pedidos = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders] = useState<Order[]>(mockOrders);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isPastDay = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderDate = new Date(date);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate < today;
  };

  const getFilteredOrders = (): Order[] => {
    return orders.filter((order) => isSameDay(order.dataHora, selectedDate));
  };

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    setSelectedOrder(null);
  };

  const getStatusClass = (status: OrderStatus): string => {
    if (status === "concluido") return "status-concluido";
    if (status === "preparando") return "status-preparando";
    if (status === "indo-para-entrega") return "status-entrega";
    return "status-pagamento";
  };

  const filteredOrders = getFilteredOrders();

  return (
    <Layout>
      <div
        className="pedidos-container"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 69, 19, 0.7), rgba(139, 69, 19, 0.7)), url(${restaurantBg})`,
        }}
      >
        <div className="pedidos-content">
          <div className="pedidos-header">
            <h1>Pedidos</h1>
            <div className="date-selector">
              <button
                className="date-btn"
                onClick={() => handleDateChange(-1)}
                aria-label="Dia anterior"
              >
                ←
              </button>
              <div className="current-date">
                <HiCalendar size={20} />
                <span>{formatDate(selectedDate)}</span>
              </div>
              <button
                className="date-btn"
                onClick={() => handleDateChange(1)}
                aria-label="Próximo dia"
              >
                →
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <p>Nenhum pedido encontrado para esta data.</p>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order) => {
                const isPast = isPastDay(order.dataHora);
                const displayStatus: OrderStatus = isPast ? "concluido" : order.status;

                return (
                  <div
                    key={order.id}
                    className="order-card"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="order-header">
                      <div className="order-number">
                        <span>Pedido #{order.numero}</span>
                      </div>
                      <div className={`order-status ${getStatusClass(displayStatus)}`}>
                        {displayStatus === "concluido" && <HiCheckCircle size={16} />}
                        <span>{statusLabels[displayStatus]}</span>
                      </div>
                    </div>
                    <div className="order-info">
                      <div className="order-info-item">
                        <HiUser size={18} />
                        <span>{order.clienteNome}</span>
                      </div>
                      <div className="order-info-item">
                        <HiPhone size={18} />
                        <span>{order.clienteWhatsapp}</span>
                      </div>
                      <div className="order-info-item">
                        <HiClock size={18} />
                        <span>{formatDateTime(order.dataHora)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal de Detalhes do Pedido */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Detalhes do Pedido</h2>
              <div className="order-details">
                <div className="detail-item">
                  <strong>Número do Pedido:</strong>
                  <span>#{selectedOrder.numero}</span>
                </div>
                <div className="detail-item">
                  <strong>Nome do Cliente:</strong>
                  <span>{selectedOrder.clienteNome}</span>
                </div>
                <div className="detail-item">
                  <strong>
                    <HiPhone size={18} /> WhatsApp:
                  </strong>
                  <span>{selectedOrder.clienteWhatsapp}</span>
                </div>
                <div className="detail-item">
                  <strong>Status:</strong>
                  <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                    {statusLabels[selectedOrder.status]}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>
                    <HiClock size={18} /> Data e Hora:
                  </strong>
                  <span>{formatDateTime(selectedOrder.dataHora)}</span>
                </div>
                <div className="detail-item">
                  <strong>
                    <HiCreditCard size={18} /> Forma de Pagamento:
                  </strong>
                  <span>{selectedOrder.formaPagamento}</span>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="close-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Pedidos;

