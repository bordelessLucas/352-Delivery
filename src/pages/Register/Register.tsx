import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MdRestaurant } from "react-icons/md";
import { paths } from "../../routes/paths";
import { useAuth } from "../../hooks/useAuth";
import restaurantBg from "../../assets/restaur.jpg";
import "./Register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, register: authRegister, loading } = useAuth();

  // Redirect if already logged in
  if (currentUser && !loading) {
    navigate(paths.home);
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      return setError("As senhas não coincidem");
    }

    if (password.length < 6) {
      return setError("A senha deve ter pelo menos 6 caracteres");
    }

    setIsLoading(true);

    try {
      await authRegister(email, password, name);
      navigate(paths.home);
    } catch (err: any) {
      setError(err.message || "Falha ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="register-container"
      style={{
        backgroundImage: `linear-gradient(rgba(139, 69, 19, 0.8), rgba(139, 69, 19, 0.8)), url(${restaurantBg})`
      }}
    >
      <div className="register-card">
        <div className="logo-container">
          <div className="logo-icon">
            <MdRestaurant size={40} color="white" />
          </div>
        </div>

        <h1 className="register-title">Criar conta</h1>
        <p className="register-subtitle">
          Preencha os dados abaixo para começar
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-field">
            <label htmlFor="name">Nome completo</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="João Silva"
            />
          </div>

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
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">Confirmar senha</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button type="submit" disabled={isLoading || loading} className="submit-btn">
            {isLoading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="login-link">
          Já tem uma conta?{" "}
          <Link to={paths.login}>Entrar</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
