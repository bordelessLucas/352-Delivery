import { HiLightningBolt, HiChartBar, HiCog } from "react-icons/hi";
import { Layout } from "../../components/layout";
import { useAuth } from "../../hooks/useAuth";
import "./Dashboard.css";

const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <Layout>
      <div className="dashboard-content-wrapper">
        <div className="welcome-card">
          <h2>Bem-vindo(a)!</h2>
          {currentUser && (
            <div className="user-info">
              <p>
                <strong>Nome:</strong>{" "}
                {currentUser.displayName || "Não informado"}
              </p>
              <p>
                <strong>Email:</strong> {currentUser.email}
              </p>
              <p>
                <strong>Email Verificado:</strong>{" "}
                {currentUser.emailVerified ? "Sim" : "Não"}
              </p>
              <p>
                <strong>ID:</strong> {currentUser.uid}
              </p>
            </div>
          )}
        </div>

        <div className="dashboard-cards">
          <div className="info-card">
            <div className="card-icon-dashboard">
              <HiLightningBolt size={32} />
            </div>
            <h3>Início Rápido</h3>
            <p>Comece a usar o sistema explorando as funcionalidades disponíveis.</p>
          </div>

          <div className="info-card">
            <div className="card-icon-dashboard">
              <HiChartBar size={32} />
            </div>
            <h3>Estatísticas</h3>
            <p>Acompanhe suas métricas e resultados em tempo real.</p>
          </div>

          <div className="info-card">
            <div className="card-icon-dashboard">
              <HiCog size={32} />
            </div>
            <h3>Configurações</h3>
            <p>Personalize sua experiência ajustando as preferências.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

