import { Link } from "react-router-dom";
import { 
  HiUsers,
  HiCog,
  HiTruck
} from "react-icons/hi";
import { Layout } from "../../components/layout";
import { paths } from "../../routes/paths";
import "./Mais.css";

const Mais = () => {
  return (
    <Layout>
      <div className="mais-content-wrapper">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Mais Opções</h1>
          <p className="subtitle">
            Gerencie clientes, configurações e delivery
          </p>
        </div>

        {/* Cards Grid */}
        <div className="cards-grid">
          <Link to={paths.clientes} className="feature-card">
            <div className="card-icon">
              <HiUsers size={48} />
            </div>
            <h3>Clientes</h3>
            <p>Gerencie seus clientes e informações</p>
            <span className="card-link">Acessar →</span>
          </Link>

          <Link to={paths.configuracoes} className="feature-card">
            <div className="card-icon">
              <HiCog size={48} />
            </div>
            <h3>Configurações</h3>
            <p>Personalize seu restaurante</p>
            <span className="card-link">Acessar →</span>
          </Link>

          <Link to={paths.delivery} className="feature-card">
            <div className="card-icon">
              <HiTruck size={48} />
            </div>
            <h3>Delivery</h3>
            <p>Configure opções de entrega</p>
            <span className="card-link">Acessar →</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Mais;
