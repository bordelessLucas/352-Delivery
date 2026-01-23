import { useState, useEffect } from "react";
import { HiCalendar, HiPhone, HiUser, HiClock, HiCreditCard, HiCheckCircle } from "react-icons/hi";
import { Layout } from "../../components/layout";
import { useAuth } from "../../hooks/useAuth";
import { getOrders, type Order, type OrderStatus } from "../../services/pedidosService";
import "./Pedidos.css";

const restaurantBg = "https://static.vecteezy.com/system/resources/previews/001/948/406/non_2x/wood-table-top-for-display-with-blurred-restaurant-background-free-photo.jpg";

const statusLabels: Record<OrderStatus, string> = {
  preparando: "Preparando",
  "indo-para-entrega": "Indo para Entrega",
  "confirmando-pagamento": "Confirmando Pagamento",
  concluido: "Concluído",
};

const Pedidos = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("=== DEBUG PEDIDOS COMPONENTE ===");
        console.log("UserId atual:", currentUser.uid);
        const ordersData = await getOrders(currentUser.uid);
        console.log("Pedidos carregados:", ordersData.length);
        console.log("Pedidos:", ordersData);
        setOrders(ordersData);
      } catch (error: any) {
        console.error("Erro ao carregar pedidos:", error);
        console.error("Código do erro:", error?.code);
        console.error("Mensagem do erro:", error?.message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [currentUser]);

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
    const filtered = orders.filter((order) => {
      const sameDay = isSameDay(order.dataHora, selectedDate);
      if (!sameDay && orders.length > 0) {
        console.log(`Pedido #${order.numero} não corresponde à data ${formatDate(selectedDate)}. Data do pedido: ${formatDate(order.dataHora)}`);
      }
      return sameDay;
    });
    console.log(`Filtrando pedidos para ${formatDate(selectedDate)}:`, {
      totalPedidos: orders.length,
      pedidosFiltrados: filtered.length,
      pedidos: orders.map(o => ({ numero: o.numero, data: formatDate(o.dataHora), status: o.status }))
    });
    return filtered;
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

          {loading ? (
            <div className="no-orders">
              <p>Carregando pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <p>Nenhum pedido encontrado.</p>
              <p style={{ fontSize: "14px", marginTop: "10px", color: "#999" }}>
                Total de pedidos no banco: {orders.length}
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="no-orders">
              <p>Nenhum pedido encontrado para esta data ({formatDate(selectedDate)}).</p>
              <p style={{ fontSize: "14px", marginTop: "10px", color: "#999" }}>
                Total de pedidos: {orders.length}
              </p>
              <p style={{ fontSize: "14px", color: "#999" }}>
                Datas disponíveis: {[...new Set(orders.map(o => formatDate(o.dataHora)))].join(", ")}
              </p>
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

