import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MdRestaurant } from "react-icons/md";
import { paths } from "../../routes/paths";
import { useAuth } from "../../hooks/useAuth";
import restaurantBg from "../../assets/restaur.jpg";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, login: authLogin, loading } = useAuth();

  // Redirect if already logged in
  if (currentUser && !loading) {
    navigate(paths.home);
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authLogin(email, password);
      navigate(paths.home);
    } catch (err: any) {
      setError(err.message || "Falha ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="login-container"
      style={{
        backgroundImage: `linear-gradient(rgba(139, 69, 19, 0.8), rgba(139, 69, 19, 0.8)), url(${restaurantBg})`
      }}
    >
      <div className="login-card">
        <div className="logo-container">
          <div className="logo-icon">
            <MdRestaurant size={40} color="white" />
          </div>
        </div>

        <h1 className="login-title">Bem-vindo de volta</h1>
        <p className="login-subtitle">
          Entre com suas credenciais para acessar o painel
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-field">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-field">
            <div className="label-row">
              <label htmlFor="password">Senha</label>
              <Link to="#" className="forgot-link">
                Esqueceu a senha?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={isLoading || loading} className="submit-btn">
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="register-link">
          Não tem uma conta?{" "}
          <Link to={paths.register}>Criar conta</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

