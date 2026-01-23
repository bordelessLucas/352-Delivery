import { useState, useEffect } from "react";
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import { Layout } from "../../components/layout";
import { useAuth } from "../../hooks/useAuth";
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  type Cliente,
} from "../../services/clientesService";
import "./Clientes.css";

const Clientes = () => {
  const { currentUser } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    cpfCnpj: "",
    dataNascimento: "",
    observacoes: "",
  });

  useEffect(() => {
    const loadClientes = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getClientes(currentUser.uid);
        setClientes(data);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadClientes();
  }, [currentUser]);

  const handleAdd = () => {
    setEditingCliente(null);
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      cpfCnpj: "",
      dataNascimento: "",
      observacoes: "",
    });
    setShowModal(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      endereco: cliente.endereco || "",
      cidade: cliente.cidade || "",
      estado: cliente.estado || "",
      cep: cliente.cep || "",
      cpfCnpj: cliente.cpfCnpj || "",
      dataNascimento: cliente.dataNascimento || "",
      observacoes: cliente.observacoes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este cliente?")) {
      return;
    }

    try {
      await deleteCliente(id);
      setClientes(clientes.filter((c) => c.id !== id));
      alert("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      alert("Erro ao excluir cliente. Tente novamente.");
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    if (!formData.nome || !formData.email || !formData.telefone) {
      alert("Preencha pelo menos nome, email e telefone!");
      return;
    }

    try {
      setSaving(true);
      
      if (editingCliente) {
        await updateCliente(editingCliente.id, formData);
        setClientes(
          clientes.map((c) => (c.id === editingCliente.id ? { ...c, ...formData } : c))
        );
        alert("Cliente atualizado com sucesso!");
      } else {
        const id = await createCliente(formData, currentUser.uid);
        const newCliente: Cliente = {
          id,
          ...formData,
          userId: currentUser.uid,
          totalPedidos: 0,
          valorTotalPedidos: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setClientes([...clientes, newCliente]);
        alert("Cliente criado com sucesso!");
      }
      
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Erro ao salvar cliente. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="clientes-content-wrapper">
          <div className="page-header">
            <h1>Clientes</h1>
            <p className="page-subtitle">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="clientes-content-wrapper">
        <div className="page-header">
          <h1>Clientes</h1>
          <p className="page-subtitle">Gerencie seus clientes e informações</p>
        </div>

        <div className="clientes-actions">
          <button className="add-btn" onClick={handleAdd}>
            <HiPlus size={20} />
            Adicionar Cliente
          </button>
        </div>

        {clientes.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum cliente cadastrado. Clique em "Adicionar Cliente" para começar.</p>
          </div>
        ) : (
          <div className="clientes-grid">
            {clientes.map((cliente) => (
              <div key={cliente.id} className="cliente-card">
                <div className="cliente-header">
                  <h3>{cliente.nome}</h3>
                  <div className="cliente-actions">
                    <button className="edit-btn" onClick={() => handleEdit(cliente)}>
                      <HiPencil size={18} />
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(cliente.id)}>
                      <HiTrash size={18} />
                    </button>
                  </div>
                </div>
                <div className="cliente-info">
                  <p><strong>Email:</strong> {cliente.email}</p>
                  <p><strong>Telefone:</strong> {cliente.telefone}</p>
                  {cliente.endereco && <p><strong>Endereço:</strong> {cliente.endereco}</p>}
                  {cliente.cidade && cliente.estado && (
                    <p><strong>Cidade/Estado:</strong> {cliente.cidade} - {cliente.estado}</p>
                  )}
                  {cliente.totalPedidos !== undefined && (
                    <p><strong>Total de Pedidos:</strong> {cliente.totalPedidos}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{editingCliente ? "Editar Cliente" : "Adicionar Cliente"}</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Nome *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="form-group">
                  <label>Telefone *</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="form-group">
                  <label>CPF/CNPJ</label>
                  <input
                    type="text"
                    value={formData.cpfCnpj}
                    onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="form-group">
                  <label>Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Endereço</label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, número, complemento"
                  />
                </div>
                <div className="form-group">
                  <label>Cidade</label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <input
                    type="text"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    placeholder="UF"
                  />
                </div>
                <div className="form-group">
                  <label>CEP</label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                    placeholder="00000-000"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Observações</label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Observações sobre o cliente"
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button className="save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Clientes;
