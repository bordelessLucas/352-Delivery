import { useNavigate } from "react-router-dom";
import { MdMenu, MdNotifications, MdPerson } from "react-icons/md";
import { useAuth } from "../../../hooks/useAuth";
import { paths } from "../../../routes/paths";
import "./Header.css";

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  sidebarOpen?: boolean;
}

export const Header = ({ onMenuClick, showMenuButton = true, sidebarOpen = false }: HeaderProps) => {
  const { currentUser, logout: authLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authLogout();
      navigate(paths.login);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <header className={`app-header ${sidebarOpen ? "header-with-sidebar" : ""}`}>
      <div className="header-container">
        {/* Left Section */}
        <div className="header-left">
          {showMenuButton && (
            <button className="menu-button" onClick={onMenuClick}>
              <MdMenu size={24} />
            </button>
          )}
          
        </div>

        {/* Right Section */}
        <div className="header-right">
          <button className="header-icon-button" title="Notificações">
            <MdNotifications size={22} />
            <span className="notification-badge">3</span>
          </button>

          <div className="header-user-menu">
            <button className="user-menu-button">
              <div className="user-avatar">
                <MdPerson size={20} />
              </div>
              <div className="user-info-header">
                <span className="user-name-header">
                  {currentUser?.displayName || "Usuário"}
                </span>
                <span className="user-email-header">
                  {currentUser?.email}
                </span>
              </div>
            </button>

            <div className="user-dropdown">
              <button className="dropdown-item" onClick={() => navigate(paths.editProfile)}>
                <MdPerson size={18} />
                Meu Perfil
              </button>
              <button className="dropdown-item logout" onClick={handleLogout}>
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

