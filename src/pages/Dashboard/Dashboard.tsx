import { useState, useEffect, useRef } from "react";
import { 
  HiLightningBolt, 
  HiChartBar, 
  HiCog, 
  HiTrendingUp, 
  HiDocumentText,
  HiCalendar,
  HiClock,
  HiPhone,
  HiQrcode,
  HiExternalLink,
  HiPrinter,
  HiX
} from "react-icons/hi";
import { Layout } from "../../components/layout";
import { useAuth } from "../../hooks/useAuth";
import { useConfiguracoes } from "../../hooks/useConfiguracoes";
import { getReportStats, generateReport } from "../../services/relatoriosService";
import { getPlano, calcularDiasRestantes } from "../../services/planosService";
import { getHorarios, updateHorarios, type HorarioFuncionamento, diaLabels, turnoLabels } from "../../services/horariosService";
import { getConfiguracoes } from "../../services/configuracoesService";
import "./Dashboard.css";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { config } = useConfiguracoes();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    faturamentoDia: 0,
    faturamentoSemana: 0,
    faturamentoMes: 0,
    pedidosMes: 0,
  });
  const [nomeLoja, setNomeLoja] = useState("");
  const [diasRestantes, setDiasRestantes] = useState(0);
  const [tipoPlano, setTipoPlano] = useState<"anual" | "mensal" | "gratuito">("anual");
  
  // Estados para Relatórios
  const [showRelatorioModal, setShowRelatorioModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Estados para Horários
  const [showHorariosModal, setShowHorariosModal] = useState(false);
  const [horarios, setHorarios] = useState<HorarioFuncionamento[]>([]);
  const [editingHorario, setEditingHorario] = useState<HorarioFuncionamento | null>(null);
  
  // Estados para WhatsApp
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [statsData, configData, plano] = await Promise.all([
          getReportStats(currentUser.uid),
          getConfiguracoes(currentUser.uid).catch(() => null),
          getPlano(currentUser.uid).catch(() => null),
        ]);
        setStats(statsData);
        if (configData) {
          setNomeLoja(configData.geral.nomeLoja || "");
          setWhatsappNumber(configData.contato.whatsapp || "");
          setWhatsappUrl(configData.geral.url || "");
        }
        if (plano) {
          setDiasRestantes(calcularDiasRestantes(plano));
          setTipoPlano(plano.tipo);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const handleGenerateReport = async () => {
    if (!currentUser) return;
    
    if (!startDate || !endDate) {
      alert("Por favor, selecione as datas inicial e final.");
      return;
    }

    try {
      const report = await generateReport(currentUser.uid, new Date(startDate), new Date(endDate));
      setReportData(report);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório. Tente novamente.");
    }
  };

  const handlePrintReport = () => {
    if (reportRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Relatório de Vendas</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; }
                .report-section { margin: 20px 0; }
                .report-item { margin: 10px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #8B4513; color: white; }
              </style>
            </head>
            <body>
              ${reportRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleLoadHorarios = async () => {
    if (!currentUser) return;
    try {
      const horariosData = await getHorarios(currentUser.uid);
      setHorarios(horariosData.horarios);
      setShowHorariosModal(true);
    } catch (error) {
      console.error("Erro ao carregar horários:", error);
    }
  };

  const handleSaveHorarios = async () => {
    if (!currentUser) return;
    try {
      await updateHorarios(currentUser.uid, horarios);
      alert("Horários salvos com sucesso!");
      setShowHorariosModal(false);
    } catch (error) {
      console.error("Erro ao salvar horários:", error);
      alert("Erro ao salvar horários. Tente novamente.");
    }
  };

  const handleOpenWhatsApp = () => {
    if (whatsappNumber) {
      const cleanNumber = whatsappNumber.replace(/\D/g, "");
      window.open(`https://wa.me/${cleanNumber}`, "_blank");
    } else {
      alert("Número do WhatsApp não configurado. Configure nas Configurações.");
    }
  };

  const handleOpenStore = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank");
    } else {
      alert("URL da loja não configurada. Configure nas Configurações.");
    }
  };

  return (
    <Layout>
      <div className="dashboard-content-wrapper">
        <div className="welcome-card">
          <h2>Bem-vindo(a){nomeLoja ? ` ao ${nomeLoja}` : ""}!</h2>
          {currentUser && (
            <div className="user-info">
              <p>
                <strong>Nome:</strong> {currentUser.displayName || "Não informado"}
              </p>
              <p>
                <strong>Email:</strong> {currentUser.email}
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p>Carregando estatísticas...</p>
          </div>
        ) : (
          <>
            {/* Estatísticas */}
            <div className="dashboard-cards">
              <div className="info-card">
                <div className="card-icon-dashboard">
                  <HiTrendingUp size={32} />
                </div>
                <h3>Faturamento Hoje</h3>
                <p className="stat-value-large">{formatCurrency(stats.faturamentoDia)}</p>
              </div>

              <div className="info-card">
                <div className="card-icon-dashboard">
                  <HiChartBar size={32} />
                </div>
                <h3>Faturamento Semana</h3>
                <p className="stat-value-large">{formatCurrency(stats.faturamentoSemana)}</p>
              </div>

              <div className="info-card">
                <div className="card-icon-dashboard">
                  <HiChartBar size={32} />
                </div>
                <h3>Faturamento do Mês</h3>
                <p className="stat-value-large">{formatCurrency(stats.faturamentoMes)}</p>
              </div>

              <div className="info-card">
                <div className="card-icon-dashboard">
                  <HiDocumentText size={32} />
                </div>
                <h3>Pedidos do Mês</h3>
                <p className="stat-value-large">{stats.pedidosMes}</p>
              </div>
            </div>

            {/* Meu Plano */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Meu Plano</h2>
              </div>
              <div className="info-card">
                <div className="card-icon-dashboard">
                  <HiLightningBolt size={32} />
                </div>
                <h3>Plano {tipoPlano === "anual" ? "Anual" : tipoPlano === "mensal" ? "Mensal" : "Gratuito"}</h3>
                <p className="stat-value-large">{diasRestantes} dias restantes</p>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Ações Rápidas</h2>
              </div>
              <div className="dashboard-cards">
                <div className="action-card" onClick={() => setShowRelatorioModal(true)}>
                  <HiDocumentText size={32} />
                  <h3>Relatório</h3>
                  <p>Gerar relatório de vendas</p>
                </div>

                <div className="action-card" onClick={handleLoadHorarios}>
                  <HiClock size={32} />
                  <h3>Horário de Funcionamento</h3>
                  <p>Gerenciar horários</p>
                </div>

                <div className="action-card" onClick={handleOpenWhatsApp}>
                  <HiPhone size={32} />
                  <h3>Suporte Técnico</h3>
                  <p>Abrir WhatsApp</p>
                </div>

                <div className="action-card" onClick={() => setShowWhatsAppModal(true)}>
                  <HiQrcode size={32} />
                  <h3>Conectar WhatsApp</h3>
                  <p>Gerar QR Code</p>
                </div>

                <div className="action-card" onClick={handleOpenStore}>
                  <HiExternalLink size={32} />
                  <h3>Ver Loja</h3>
                  <p>Abrir site do Delivery</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Relatórios */}
      {showRelatorioModal && (
        <div className="modal-overlay" onClick={() => setShowRelatorioModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Gerar Relatório</h2>
              <button className="modal-close" onClick={() => setShowRelatorioModal(false)}>
                <HiX size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Data Inicial</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Data Final</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <button className="btn-primary" onClick={handleGenerateReport}>
                Buscar
              </button>
              
              {reportData && (
                <div ref={reportRef} className="report-display">
                  <h3>Relatório de Vendas</h3>
                  <p><strong>Data Inicial:</strong> {formatDate(startDate)}</p>
                  <p><strong>Data Final:</strong> {formatDate(endDate)}</p>
                  <p><strong>Pedidos Finalizados:</strong> {reportData.pedidosConcluidos}</p>
                  <p><strong>Pedidos Cancelados:</strong> {reportData.pedidosCancelados}</p>
                  <p><strong>Total de Pedidos:</strong> {reportData.totalPedidos}</p>
                  <table>
                    <thead>
                      <tr>
                        <th>Forma de Pagamento</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>PIX</td>
                        <td>{formatCurrency(reportData.pix)}</td>
                      </tr>
                      <tr>
                        <td>Crédito</td>
                        <td>{formatCurrency(reportData.credito)}</td>
                      </tr>
                      <tr>
                        <td>Débito</td>
                        <td>{formatCurrency(reportData.debito)}</td>
                      </tr>
                      <tr>
                        <td>Dinheiro</td>
                        <td>{formatCurrency(reportData.dinheiro)}</td>
                      </tr>
                      <tr>
                        <td><strong>TOTAL</strong></td>
                        <td><strong>{formatCurrency(reportData.totalGanho)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                  <button className="btn-primary" onClick={handlePrintReport}>
                    <HiPrinter size={20} /> Imprimir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Horários */}
      {showHorariosModal && (
        <div className="modal-overlay" onClick={() => setShowHorariosModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Horário de Funcionamento</h2>
              <button className="modal-close" onClick={() => setShowHorariosModal(false)}>
                <HiX size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="horarios-table">
                <table>
                  <thead>
                    <tr>
                      <th>Dia</th>
                      <th>Turno</th>
                      <th>Início</th>
                      <th>Encerramento</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horarios.map((horario, index) => (
                      <tr key={index}>
                        <td>{diaLabels[horario.dia]}</td>
                        <td>{turnoLabels[horario.turno]}</td>
                        <td>
                          <input
                            type="time"
                            value={horario.horaInicio}
                            onChange={(e) => {
                              const newHorarios = [...horarios];
                              newHorarios[index].horaInicio = e.target.value;
                              setHorarios(newHorarios);
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="time"
                            value={horario.horaFim}
                            onChange={(e) => {
                              const newHorarios = [...horarios];
                              newHorarios[index].horaFim = e.target.value;
                              setHorarios(newHorarios);
                            }}
                          />
                        </td>
                        <td>
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={horario.ativo}
                              onChange={(e) => {
                                const newHorarios = [...horarios];
                                newHorarios[index].ativo = e.target.checked;
                                setHorarios(newHorarios);
                              }}
                            />
                            {horario.ativo ? "Ativo" : "Inativo"}
                          </label>
                        </td>
                        <td>
                          <button
                            className="btn-small"
                            onClick={() => setEditingHorario(horario)}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-actions">
                <button className="btn-primary" onClick={handleSaveHorarios}>
                  Salvar
                </button>
                <button className="btn-secondary" onClick={() => setShowHorariosModal(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal WhatsApp QR Code */}
      {showWhatsAppModal && (
        <div className="modal-overlay" onClick={() => setShowWhatsAppModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Conectar WhatsApp</h2>
              <button className="modal-close" onClick={() => setShowWhatsAppModal(false)}>
                <HiX size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p>Gera um QR Code para conectar com o WhatsApp e enviar mensagens para o cliente quando ele finalizar um pedido.</p>
              <div className="qr-code-container">
                {whatsappNumber ? (
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                    alt="QR Code WhatsApp"
                  />
                ) : (
                  <p>Configure o número do WhatsApp nas Configurações primeiro.</p>
                )}
              </div>
              <p className="qr-instructions">
                Escaneie este QR Code com o WhatsApp para conectar sua conta.
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
