import { useState } from "react";
import { Header } from "../Header/Header";
import { Sidebar } from "../Sidebar/Sidebar";
import "./Layout.css";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const Layout = ({ children, showSidebar = true }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-layout">
      {showSidebar && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      
      <div className={`app-main ${showSidebar ? "with-sidebar" : ""} ${sidebarOpen ? "sidebar-expanded" : ""}`}>
        <Header 
          onMenuClick={toggleSidebar} 
          showMenuButton={showSidebar}
          sidebarOpen={sidebarOpen}
        />
        
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
};
