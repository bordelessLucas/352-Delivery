import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { paths } from "./paths";
import { useAuth } from "../hooks/useAuth";

// Pages
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Home from "../pages/Home/Home";
import Dashboard from "../pages/Dashboard/Dashboard";
import Cardapio from "../pages/Cardapio/Cardapio";
import Pedidos from "../pages/Pedidos/Pedidos";
import Cupons from "../pages/Cupons/Cupons";
import Produtos from "../pages/Produtos/Produtos";
import Relatorios from "../pages/Relatorios/Relatorios";
import Mais from "../pages/Mais/Mais";
import Clientes from "../pages/Clientes/Clientes";
import Configuracoes from "../pages/Configuracoes/Configuracoes";
import Delivery from "../pages/Delivery/Delivery";

// Component to handle root redirect
const RootRedirect = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontSize: "18px",
        color: "#666"
      }}>
        Carregando...
      </div>
    );
  }

  // Se autenticado, vai para home, senão vai para login
  return currentUser ? (
    <Navigate to={paths.home} replace />
  ) : (
    <Navigate to={paths.login} replace />
  );
};

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Rota raiz - redireciona baseado em autenticação */}
                    <Route path={paths.root} element={<RootRedirect />} />
                    
                    {/* Rotas públicas */}
                    <Route path={paths.login} element={<Login />} />
                    <Route path={paths.register} element={<Register />} />
                    
                    {/* Rotas protegidas */}
                    <Route 
                        path={paths.home} 
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={paths.dashboard} 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={paths.cardapio} 
                        element={
                            <ProtectedRoute>
                                <Cardapio />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={paths.pedidos} 
                        element={
                            <ProtectedRoute>
                                <Pedidos />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={paths.cupons}
                        element={
                            <ProtectedRoute>
                                <Cupons />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={paths.produtos}
                        element={
                            <ProtectedRoute>
                                <Produtos />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={paths.relatorios} 
                        element={
                            <ProtectedRoute>
                                <Relatorios />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={paths.mais} 
                        element={
                            <ProtectedRoute>
                                <Mais />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={paths.clientes} 
                        element={
                            <ProtectedRoute>
                                <Clientes />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={paths.configuracoes} 
                        element={
                            <ProtectedRoute>
                                <Configuracoes />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path={paths.delivery} 
                        element={
                            <ProtectedRoute>
                                <Delivery />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Rota 404 - redireciona para raiz */}
                    <Route path={paths.notFound} element={<Navigate to={paths.root} replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}