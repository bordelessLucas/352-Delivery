import { NavLink } from "react-router-dom";
import { 
  HiHome, 
  HiChartBar, 
  HiCube, 
  HiShoppingBag, 
  HiTicket, 
  HiTrendingUp, 
  HiDotsVertical,
  HiCollection
} from "react-icons/hi";
import { MdRestaurant } from "react-icons/md";
import { paths } from "../../../routes/paths";
import "./Sidebar.css";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const menuItems = [
    { path: paths.home, icon: HiHome, label: "Início" },
    { path: paths.dashboard, icon: HiChartBar, label: "Dashboard" },
    { path: paths.cardapio, icon: HiCube, label: "Cardápio" },
    { path: paths.produtos, icon: HiCollection, label: "Produtos" },
    { path: paths.pedidos, icon: HiShoppingBag, label: "Pedidos" },
    { path: paths.cupons, icon: HiTicket, label: "Cupons" },
    { path: paths.relatorios, icon: HiTrendingUp, label: "Relatórios" },
    { path: paths.mais, icon: HiDotsVertical, label: "Mais" },
  ];

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose}></div>
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <MdRestaurant size={28} color="white" />
          </div>
          <div className="sidebar-brand">
            <h2>Delivery</h2>
            <span>Manager</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
              }
              onClick={onClose}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-version">
            <span>Versão 1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

