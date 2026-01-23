import { useState, useEffect } from "react";
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import { Layout } from "../../components/layout";
import { useAuth } from "../../hooks/useAuth";
import {
  getDelivery,
  updateDelivery,
  addBairro,
  updateBairro,
  removeBairro,
  type BairroDelivery,
} from "../../services/deliveryService";
import "./Delivery.css";

const Delivery = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tempoEntrega, setTempoEntrega] = useState("");
  const [bairros, setBairros] = useState<BairroDelivery[]>([]);
  const [showBairroModal, setShowBairroModal] = useState(false);
  const [editingBairro, setEditingBairro] = useState<BairroDelivery | null>(null);
  
  const [bairroForm, setBairroForm] = useState({
    nome: "",
    distancia: "",
    preco: "",
  });

  useEffect(() => {
    const loadDelivery = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const delivery = await getDelivery(currentUser.uid);
        setTempoEntrega(delivery.config.tempoEntrega);
        setBairros(delivery.config.bairros);
      } catch (error) {
        console.error("Erro ao carregar delivery:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDelivery();
  }, [currentUser]);

  const handleSaveTempoEntrega = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      await updateDelivery(currentUser.uid, { tempoEntrega });
      alert("Tempo de entrega salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar tempo de entrega:", error);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddBairro = () => {
    setEditingBairro(null);
    setBairroForm({ nome: "", distancia: "", preco: "" });
    setShowBairroModal(true);
  };

  const handleEditBairro = (bairro: BairroDelivery) => {
    setEditingBairro(bairro);
    setBairroForm({
      nome: bairro.nome,
      distancia: bairro.distancia.toString(),
      preco: bairro.preco.toString(),
    });
    setShowBairroModal(true);
  };

  const handleDeleteBairro = async (id: string) => {
    if (!currentUser) return;
    
    if (!window.confirm("Tem certeza que deseja excluir este bairro?")) {
      return;
    }

    try {
      await removeBairro(currentUser.uid, id);
      setBairros(bairros.filter((b) => b.id !== id));
      alert("Bairro excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir bairro:", error);
      alert("Erro ao excluir bairro. Tente novamente.");
    }
  };

  const handleSaveBairro = async () => {
    if (!currentUser) return;
    
    if (!bairroForm.nome || !bairroForm.distancia || !bairroForm.preco) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      setSaving(true);
      
      if (editingBairro) {
        await updateBairro(currentUser.uid, editingBairro.id, {
          nome: bairroForm.nome,
          distancia: parseFloat(bairroForm.distancia),
          preco: parseFloat(bairroForm.preco),
        });
        setBairros(
          bairros.map((b) =>
            b.id === editingBairro.id
              ? {
                  ...b,
                  nome: bairroForm.nome,
                  distancia: parseFloat(bairroForm.distancia),
                  preco: parseFloat(bairroForm.preco),
                }
              : b
          )
        );
        alert("Bairro atualizado com sucesso!");
      } else {
        await addBairro(currentUser.uid, {
          nome: bairroForm.nome,
          distancia: parseFloat(bairroForm.distancia),
          preco: parseFloat(bairroForm.preco),
        });
        const newBairro: BairroDelivery = {
          id: Date.now().toString(),
          nome: bairroForm.nome,
          distancia: parseFloat(bairroForm.distancia),
          preco: parseFloat(bairroForm.preco),
        };
        setBairros([...bairros, newBairro]);
        alert("Bairro adicionado com sucesso!");
      }
      
      setShowBairroModal(false);
      setBairroForm({ nome: "", distancia: "", preco: "" });
      setEditingBairro(null);
    } catch (error) {
      console.error("Erro ao salvar bairro:", error);
      alert("Erro ao salvar bairro. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="delivery-content-wrapper">
          <div className="page-header">
            <h1>Delivery</h1>
            <p className="page-subtitle">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="delivery-content-wrapper">
        <div className="page-header">
          <h1>Delivery</h1>
          <p className="page-subtitle">Configure opções de entrega</p>
        </div>

        <div className="delivery-section">
          <h2>Tempo de Entrega</h2>
          <div className="form-group">
            <label>Tempo de Entrega</label>
            <input
              type="text"
              value={tempoEntrega}
              onChange={(e) => setTempoEntrega(e.target.value)}
              placeholder="Ex: 30-45 minutos"
            />
          </div>
          <div className="section-actions">
            <button className="save-btn" onClick={handleSaveTempoEntrega} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>

        <div className="bairros-section">
          <div className="bairros-header">
            <h2>Bairros / Preço</h2>
            <button className="add-btn" onClick={handleAddBairro}>
              <HiPlus size={20} />
              Adicionar Bairro
            </button>
          </div>

          {bairros.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum bairro cadastrado. Clique em "Adicionar Bairro" para começar.</p>
            </div>
          ) : (
            <div className="bairros-list">
              {bairros.map((bairro) => (
                <div key={bairro.id} className="bairro-item">
                  <div className="bairro-info">
                    <h4>{bairro.nome}</h4>
                    <p>Distância: {bairro.distancia} km</p>
                    <p>Preço: R$ {bairro.preco.toFixed(2)}</p>
                  </div>
                  <div className="bairro-actions">
                    <button className="edit-btn" onClick={() => handleEditBairro(bairro)}>
                      <HiPencil size={18} />
                      Editar
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteBairro(bairro.id)}>
                      <HiTrash size={18} />
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showBairroModal && (
          <div className="modal-overlay" onClick={() => setShowBairroModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{editingBairro ? "Editar Bairro" : "Adicionar Bairro"}</h3>
              <div className="form-group">
                <label>Nome do bairro</label>
                <input
                  type="text"
                  value={bairroForm.nome}
                  onChange={(e) => setBairroForm({ ...bairroForm, nome: e.target.value })}
                  placeholder="Digite o nome do bairro"
                />
              </div>
              <div className="form-group">
                <label>Distância (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bairroForm.distancia}
                  onChange={(e) => setBairroForm({ ...bairroForm, distancia: e.target.value })}
                  placeholder="Digite a distância"
                />
              </div>
              <div className="form-group">
                <label>Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={bairroForm.preco}
                  onChange={(e) => setBairroForm({ ...bairroForm, preco: e.target.value })}
                  placeholder="Digite o preço"
                />
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowBairroModal(false)}>
                  Cancelar
                </button>
                <button className="save-btn" onClick={handleSaveBairro} disabled={saving}>
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

export default Delivery;
