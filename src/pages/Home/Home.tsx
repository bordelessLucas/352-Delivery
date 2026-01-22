import { Link } from "react-router-dom";
import { 
  HiChartBar, 
  HiCube, 
  HiShoppingBag, 
  HiTicket, 
  HiTrendingUp, 
  HiCog 
} from "react-icons/hi";
import { Layout } from "../../components/layout";
import { paths } from "../../routes/paths";
import "./Home.css";

const Home = () => {
  return (
    <Layout>
      <div className="home-content-wrapper">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Bem-vindo ao Delivery Manager!</h1>
          <p className="subtitle">
            Gerencie seu restaurante de forma profissional
          </p>
        </div>

        {/* Cards Grid */}
        <div className="cards-grid">
          <Link to={paths.dashboard} className="feature-card">
            <div className="card-icon">
              <HiChartBar size={48} />
            </div>
            <h3>Dashboard</h3>
            <p>Visualize métricas e desempenho do seu restaurante</p>
            <span className="card-link">Acessar →</span>
          </Link>

          <Link to={paths.cardapio} className="feature-card">
            <div className="card-icon">
              <HiCube size={48} />
            </div>
            <h3>Cardápio</h3>
            <p>Gerencie o cardápio e categorias</p>
            <span className="card-link">Acessar →</span>
          </Link>

          <Link to={paths.pedidos} className="feature-card">
            <div className="card-icon">
              <HiShoppingBag size={48} />
            </div>
            <h3>Pedidos</h3>
            <p>Acompanhe pedidos em tempo real</p>
            <span className="card-link">Acessar →</span>
          </Link>

          <Link to={paths.cupons} className="feature-card">
            <div className="card-icon">
              <HiTicket size={48} />
            </div>
            <h3>Cupons</h3>
            <p>Crie promoções e descontos</p>
            <span className="card-link">Acessar →</span>
          </Link>

          <Link to={paths.relatorios} className="feature-card">
            <div className="card-icon">
              <HiTrendingUp size={48} />
            </div>
            <h3>Relatórios</h3>
            <p>Análises detalhadas de vendas</p>
            <span className="card-link">Acessar →</span>
          </Link>

          <div className="feature-card">
            <div className="card-icon">
              <HiCog size={48} />
            </div>
            <h3>Configurações</h3>
            <p>Personalize seu restaurante</p>
            <span className="card-link">Em breve</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

