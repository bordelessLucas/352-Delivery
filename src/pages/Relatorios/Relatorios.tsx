import { useState, useRef } from "react";
import { HiTrendingUp, HiDocumentText, HiPrinter, HiCalendar } from "react-icons/hi";
import { Layout } from "../../components/layout";
import "./Relatorios.css";

const restaurantBg = "https://static.vecteezy.com/system/resources/previews/001/948/406/non_2x/wood-table-top-for-display-with-blurred-restaurant-background-free-photo.jpg";

interface ReportData {
  pedidosConcluidos: number;
  pedidosCancelados: number;
  totalPedidos: number;
  pix: number;
  credito: number;
  debito: number;
  dinheiro: number;
  totalGanho: number;
}

const Relatorios = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [showReport, setShowReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Dados mockados para os cards
  const faturamentoDia = 1250.50;
  const faturamentoSemana = 8750.30;
  const faturamentoMes = 35200.75;
  const pedidosMes = 142;

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

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      alert("Por favor, selecione as datas inicial e final.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("A data inicial deve ser anterior à data final.");
      return;
    }

    // Dados mockados do relatório
    const mockData: ReportData = {
      pedidosConcluidos: 45,
      pedidosCancelados: 3,
      totalPedidos: 48,
      pix: 1250.00,
      credito: 850.50,
      debito: 320.75,
      dinheiro: 180.25,
      totalGanho: 2601.50,
    };

    setReportData(mockData);
    setShowReport(true);
    setIsModalOpen(false);
  };

  const handlePrint = () => {
    if (reportRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Relatório de Vendas</title>
              <style>
                @media print {
                  @page {
                    margin: 20mm;
                  }
                  body {
                    font-family: Arial, sans-serif;
                    color: #000;
                  }
                  .no-print {
                    display: none;
                  }
                }
                body {
                  font-family: Arial, sans-serif;
                  padding: 20px;
                  color: #333;
                }
                .report-header {
                  text-align: center;
                  margin-bottom: 30px;
                  border-bottom: 2px solid #8B4513;
                  padding-bottom: 20px;
                }
                .report-header h1 {
                  color: #8B4513;
                  margin: 0 0 10px 0;
                }
                .report-period {
                  font-size: 14px;
                  color: #666;
                }
                .report-section {
                  margin-bottom: 30px;
                }
                .report-section h2 {
                  color: #8B4513;
                  border-bottom: 1px solid #ddd;
                  padding-bottom: 10px;
                  margin-bottom: 15px;
                }
                .report-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 15px;
                  margin-bottom: 20px;
                }
                .report-item {
                  padding: 15px;
                  background: #f9f9f9;
                  border-radius: 8px;
                  border-left: 4px solid #8B4513;
                }
                .report-item strong {
                  display: block;
                  color: #8B4513;
                  margin-bottom: 5px;
                }
                .report-item span {
                  font-size: 18px;
                  font-weight: 600;
                  color: #333;
                }
                .report-total {
                  background: #8B4513;
                  color: white;
                  padding: 20px;
                  border-radius: 8px;
                  text-align: center;
                  margin-top: 20px;
                }
                .report-total h3 {
                  margin: 0 0 10px 0;
                  font-size: 20px;
                }
                .report-total .total-value {
                  font-size: 32px;
                  font-weight: bold;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
                }
                th, td {
                  padding: 12px;
                  text-align: left;
                  border-bottom: 1px solid #ddd;
                }
                th {
                  background: #8B4513;
                  color: white;
                }
                tr:hover {
                  background: #f5f5f5;
                }
              </style>
            </head>
            <body>
              ${reportRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  const handleCloseReport = () => {
    setShowReport(false);
    setReportData(null);
    setStartDate("");
    setEndDate("");
  };

  return (
    <Layout>
      <div
        className="relatorios-container"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 69, 19, 0.7), rgba(139, 69, 19, 0.7)), url(${restaurantBg})`,
        }}
      >
        <div className="relatorios-content">
          <div className="relatorios-header">
            <h1>Relatórios</h1>
            <button className="create-report-btn" onClick={() => setIsModalOpen(true)}>
              <HiDocumentText size={20} />
              Criar Relatório
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <HiTrendingUp size={32} />
              </div>
              <div className="stat-info">
                <h3>Faturamento do Dia</h3>
                <p className="stat-value">{formatCurrency(faturamentoDia)}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <HiTrendingUp size={32} />
              </div>
              <div className="stat-info">
                <h3>Faturamento da Semana</h3>
                <p className="stat-value">{formatCurrency(faturamentoSemana)}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <HiTrendingUp size={32} />
              </div>
              <div className="stat-info">
                <h3>Faturamento do Mês</h3>
                <p className="stat-value">{formatCurrency(faturamentoMes)}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <HiDocumentText size={32} />
              </div>
              <div className="stat-info">
                <h3>Pedidos do Mês</h3>
                <p className="stat-value">{pedidosMes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Criar Relatório */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Criar Relatório</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGenerateReport();
                }}
              >
                <div className="form-group">
                  <label htmlFor="startDate">
                    <HiCalendar size={18} /> Data Inicial
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">
                    <HiCalendar size={18} /> Data Final
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="generate-btn">
                    Gerar Relatório
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Relatório Gerado */}
        {showReport && reportData && (
          <div className="report-overlay" onClick={handleCloseReport}>
            <div
              className="report-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="report-actions no-print">
                <button className="print-btn" onClick={handlePrint}>
                  <HiPrinter size={20} />
                  Imprimir
                </button>
                <button className="close-report-btn" onClick={handleCloseReport}>
                  Fechar
                </button>
              </div>

              <div ref={reportRef} className="report-content">
                <div className="report-header">
                  <h1>Relatório de Vendas</h1>
                  <p className="report-period">
                    Período: {formatDate(startDate)} a {formatDate(endDate)}
                  </p>
                </div>

                <div className="report-section">
                  <h2>Resumo de Pedidos</h2>
                  <div className="report-grid">
                    <div className="report-item">
                      <strong>Pedidos Concluídos</strong>
                      <span>{reportData.pedidosConcluidos}</span>
                    </div>
                    <div className="report-item">
                      <strong>Pedidos Cancelados</strong>
                      <span>{reportData.pedidosCancelados}</span>
                    </div>
                    <div className="report-item" style={{ gridColumn: "1 / -1" }}>
                      <strong>Total de Pedidos</strong>
                      <span>{reportData.totalPedidos}</span>
                    </div>
                  </div>
                </div>

                <div className="report-section">
                  <h2>Formas de Pagamento</h2>
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
                        <td>Cartão de Crédito</td>
                        <td>{formatCurrency(reportData.credito)}</td>
                      </tr>
                      <tr>
                        <td>Cartão de Débito</td>
                        <td>{formatCurrency(reportData.debito)}</td>
                      </tr>
                      <tr>
                        <td>Dinheiro</td>
                        <td>{formatCurrency(reportData.dinheiro)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="report-total">
                  <h3>Total Ganho</h3>
                  <div className="total-value">
                    {formatCurrency(reportData.totalGanho)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Relatorios;

