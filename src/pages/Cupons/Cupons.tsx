import { useState, useEffect } from "react";
import { HiPencil, HiPlus, HiTrash, HiCalendar, HiTag } from "react-icons/hi";
import { FaPercent, FaDollarSign } from "react-icons/fa";
import { Layout } from "../../components/layout";
import { useAuth } from "../../hooks/useAuth";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../../services/couponService";
import "./Cupons.css";

const restaurantBg = "https://static.vecteezy.com/system/resources/previews/001/948/406/non_2x/wood-table-top-for-display-with-blurred-restaurant-background-free-photo.jpg";

export type DiscountType = "percentual" | "fixo";

export interface Coupon {
  id: string;
  codigo: string;
  tipoDesconto: DiscountType;
  valorDesconto: number;
  dataValidade: Date;
  limiteUso: number;
  usosAtuais: number;
  valorMinimo?: number;
  ativo: boolean;
}

const tipoLabels: Record<DiscountType, string> = {
  percentual: "Percentual",
  fixo: "Valor Fixo",
};

const Cupons = () => {
  const { currentUser } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Coupon, "id" | "usosAtuais">>({
    codigo: "",
    tipoDesconto: "percentual",
    valorDesconto: 0,
    dataValidade: new Date(),
    limiteUso: 0,
    valorMinimo: 0,
    ativo: true,
  });
  const [discountInput, setDiscountInput] = useState<string>("");
  const [minValueInput, setMinValueInput] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  // Carregar cupons do Firebase
  useEffect(() => {
    const loadCoupons = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Carregando cupons para usuário:", currentUser.uid);
        const couponsData = await getCoupons(currentUser.uid);
        console.log("Cupons carregados:", couponsData.length);
        setCoupons(couponsData);
      } catch (error: any) {
        console.error("Erro ao carregar cupons:", error);
        console.error("Código do erro:", error?.code);
        console.error("Mensagem do erro:", error?.message);
        console.error("Stack do erro:", error?.stack);
        
        // Mensagem de erro mais específica
        let errorMessage = "Erro ao carregar cupons. Tente novamente.";
        
        if (error?.code === "failed-precondition" || error?.code === 9) {
          errorMessage = "É necessário criar um índice no Firestore. Verifique o console do navegador para o link.";
        } else if (error?.code === "permission-denied" || error?.code === 7) {
          errorMessage = "Permissão negada. Verifique as regras do Firestore no console do Firebase.";
        } else if (error?.message) {
          errorMessage = `Erro: ${error.message}`;
        }
        
        // Não mostrar alert se for apenas lista vazia (sem erro real)
        if (error?.code !== "permission-denied" && error?.code !== "failed-precondition") {
          alert(errorMessage);
        } else {
          // Se for erro de permissão ou índice, apenas logar
          console.warn(errorMessage);
        }
        
        // Sempre definir lista vazia em caso de erro para não travar a UI
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };

    loadCoupons();
  }, [currentUser]);

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      codigo: coupon.codigo,
      tipoDesconto: coupon.tipoDesconto,
      valorDesconto: coupon.valorDesconto,
      dataValidade: coupon.dataValidade,
      limiteUso: coupon.limiteUso,
      valorMinimo: coupon.valorMinimo || 0,
      ativo: coupon.ativo,
    });
    setDiscountInput(coupon.valorDesconto.toString());
    setMinValueInput(coupon.valorMinimo ? coupon.valorMinimo.toString() : "");
    setIsAddModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCoupon(null);
    setFormData({
      codigo: "",
      tipoDesconto: "percentual",
      valorDesconto: 0,
      dataValidade: new Date(),
      limiteUso: 0,
      valorMinimo: 0,
      ativo: true,
    });
    setDiscountInput("");
    setMinValueInput("");
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este cupom?")) {
      return;
    }

    try {
      await deleteCoupon(id);
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch (error: any) {
      console.error("Erro ao deletar cupom:", error);
      
      let errorMessage = "Erro ao deletar cupom. Tente novamente.";
      if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      alert("Você precisa estar autenticado para criar cupons.");
      return;
    }

    if (!formData.codigo || formData.valorDesconto <= 0 || formData.limiteUso <= 0) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    if (formData.tipoDesconto === "percentual" && formData.valorDesconto > 100) {
      alert("O desconto percentual não pode ser maior que 100%.");
      return;
    }

    try {
      setSaving(true);

      if (editingCoupon) {
        // Atualizar cupom existente
        await updateCoupon(editingCoupon.id, formData);
        setCoupons(
          coupons.map((c) =>
            c.id === editingCoupon.id
              ? { ...formData, id: editingCoupon.id, usosAtuais: editingCoupon.usosAtuais }
              : c
          )
        );
      } else {
        // Criar novo cupom
        const newCouponId = await createCoupon(formData, currentUser.uid);
        const newCoupon: Coupon = {
          ...formData,
          id: newCouponId,
          usosAtuais: 0,
        };
        setCoupons([...coupons, newCoupon]);
      }

      setIsAddModalOpen(false);
      setEditingCoupon(null);
      setFormData({
        codigo: "",
        tipoDesconto: "percentual",
        valorDesconto: 0,
        dataValidade: new Date(),
        limiteUso: 0,
        valorMinimo: 0,
        ativo: true,
      });
      setDiscountInput("");
      setMinValueInput("");
    } catch (error: any) {
      console.error("Erro ao salvar cupom:", error);
      
      let errorMessage = "Erro ao salvar cupom. Tente novamente.";
      if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsAddModalOpen(false);
    setEditingCoupon(null);
    setFormData({
      codigo: "",
      tipoDesconto: "percentual",
      valorDesconto: 0,
      dataValidade: new Date(),
      limiteUso: 0,
      valorMinimo: 0,
      ativo: true,
    });
    setDiscountInput("");
    setMinValueInput("");
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const isExpired = (date: Date): boolean => {
    return new Date(date) < new Date();
  };

  const isUsageLimitReached = (coupon: Coupon): boolean => {
    return coupon.usosAtuais >= coupon.limiteUso;
  };

  const getCouponStatus = (coupon: Coupon): string => {
    if (!coupon.ativo) return "Inativo";
    if (isExpired(coupon.dataValidade)) return "Expirado";
    if (isUsageLimitReached(coupon)) return "Limite Atingido";
    return "Ativo";
  };

  const getStatusClass = (coupon: Coupon): string => {
    if (!coupon.ativo) return "status-inativo";
    if (isExpired(coupon.dataValidade)) return "status-expirado";
    if (isUsageLimitReached(coupon)) return "status-limitado";
    return "status-ativo";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const activeCoupons = coupons.filter((c) => c.ativo && !isExpired(c.dataValidade) && !isUsageLimitReached(c));
  const inactiveCoupons = coupons.filter((c) => !c.ativo || isExpired(c.dataValidade) || isUsageLimitReached(c));

  return (
    <Layout>
      <div
        className="cupons-container"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 69, 19, 0.7), rgba(139, 69, 19, 0.7)), url(${restaurantBg})`,
        }}
      >
        <div className="cupons-content">
          <div className="cupons-header">
            <h1>Cupons</h1>
            <button className="add-coupon-btn" onClick={handleAdd}>
              <HiPlus size={20} />
              Adicionar Cupom
            </button>
          </div>

          {/* Cupons Ativos */}
          {activeCoupons.length > 0 && (
            <div className="coupons-section">
              <h2 className="section-title">Cupons Ativos</h2>
              <div className="coupons-grid">
                {activeCoupons.map((coupon) => (
                  <div key={coupon.id} className="coupon-card">
                    <div className="coupon-header">
                      <div className="coupon-code">
                        <HiTag size={20} />
                        <span>{coupon.codigo}</span>
                      </div>
                      <div className={`coupon-status ${getStatusClass(coupon)}`}>
                        {getCouponStatus(coupon)}
                      </div>
                    </div>
                    <div className="coupon-info">
                      <div className="coupon-info-item">
                        {coupon.tipoDesconto === "percentual" ? (
                          <FaPercent size={18} />
                        ) : (
                          <FaDollarSign size={18} />
                        )}
                        <span>
                          {coupon.tipoDesconto === "percentual"
                            ? `${coupon.valorDesconto}% OFF`
                            : `${formatCurrency(coupon.valorDesconto)} OFF`}
                        </span>
                      </div>
                      <div className="coupon-info-item">
                        <HiCalendar size={18} />
                        <span>Válido até: {formatDate(coupon.dataValidade)}</span>
                      </div>
                      {coupon.valorMinimo && coupon.valorMinimo > 0 && (
                        <div className="coupon-info-item">
                          <span>Valor mínimo: {formatCurrency(coupon.valorMinimo)}</span>
                        </div>
                      )}
                      <div className="coupon-usage">
                        <span>
                          Usos: {coupon.usosAtuais} / {coupon.limiteUso}
                        </span>
                        <div className="usage-bar">
                          <div
                            className="usage-progress"
                            style={{
                              width: `${(coupon.usosAtuais / coupon.limiteUso) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="coupon-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(coupon)}
                        aria-label="Editar cupom"
                      >
                        <HiPencil size={16} />
                        Editar
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(coupon.id)}
                        aria-label="Excluir cupom"
                      >
                        <HiTrash size={16} />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cupons Inativos/Expirados */}
          {inactiveCoupons.length > 0 && (
            <div className="coupons-section">
              <h2 className="section-title">Cupons Inativos/Expirados</h2>
              <div className="coupons-grid">
                {inactiveCoupons.map((coupon) => (
                  <div key={coupon.id} className="coupon-card coupon-inactive">
                    <div className="coupon-header">
                      <div className="coupon-code">
                        <HiTag size={20} />
                        <span>{coupon.codigo}</span>
                      </div>
                      <div className={`coupon-status ${getStatusClass(coupon)}`}>
                        {getCouponStatus(coupon)}
                      </div>
                    </div>
                    <div className="coupon-info">
                      <div className="coupon-info-item">
                        {coupon.tipoDesconto === "percentual" ? (
                          <FaPercent size={18} />
                        ) : (
                          <FaDollarSign size={18} />
                        )}
                        <span>
                          {coupon.tipoDesconto === "percentual"
                            ? `${coupon.valorDesconto}% OFF`
                            : `${formatCurrency(coupon.valorDesconto)} OFF`}
                        </span>
                      </div>
                      <div className="coupon-info-item">
                        <HiCalendar size={18} />
                        <span>Válido até: {formatDate(coupon.dataValidade)}</span>
                      </div>
                      {coupon.valorMinimo && coupon.valorMinimo > 0 && (
                        <div className="coupon-info-item">
                          <span>Valor mínimo: {formatCurrency(coupon.valorMinimo)}</span>
                        </div>
                      )}
                      <div className="coupon-usage">
                        <span>
                          Usos: {coupon.usosAtuais} / {coupon.limiteUso}
                        </span>
                        <div className="usage-bar">
                          <div
                            className="usage-progress"
                            style={{
                              width: `${(coupon.usosAtuais / coupon.limiteUso) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="coupon-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(coupon)}
                        aria-label="Editar cupom"
                      >
                        <HiPencil size={16} />
                        Editar
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(coupon.id)}
                        aria-label="Excluir cupom"
                      >
                        <HiTrash size={16} />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="no-coupons">
              <p>Carregando cupons...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="no-coupons">
              <p>Nenhum cupom cadastrado. Clique em "Adicionar Cupom" para criar um novo.</p>
            </div>
          ) : null}
        </div>

        {/* Modal de Adicionar/Editar */}
        {isAddModalOpen && (
          <div className="modal-overlay" onClick={handleCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingCoupon ? "Editar Cupom" : "Adicionar Cupom"}</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <div className="form-group">
                  <label htmlFor="codigo">Código do Cupom</label>
                  <input
                    type="text"
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) =>
                      setFormData({ ...formData, codigo: e.target.value.toUpperCase() })
                    }
                    required
                    placeholder="Ex: DESCONTO10"
                    maxLength={20}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tipoDesconto">Tipo de Desconto</label>
                  <select
                    id="tipoDesconto"
                    value={formData.tipoDesconto}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        tipoDesconto: e.target.value as DiscountType,
                        valorDesconto: 0,
                      });
                      setDiscountInput("");
                    }}
                    required
                  >
                    <option value="percentual">Percentual (%)</option>
                    <option value="fixo">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="valorDesconto">
                    {formData.tipoDesconto === "percentual" ? "Percentual de Desconto (%)" : "Valor do Desconto (R$)"}
                  </label>
                  <input
                    type="number"
                    id="valorDesconto"
                    value={discountInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDiscountInput(value);
                      setFormData({
                        ...formData,
                        valorDesconto: parseFloat(value) || 0,
                      });
                    }}
                    required
                    min="0"
                    max={formData.tipoDesconto === "percentual" ? "100" : undefined}
                    step={formData.tipoDesconto === "percentual" ? "1" : "0.01"}
                    placeholder={formData.tipoDesconto === "percentual" ? "Ex: 10" : "Ex: 15.00"}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dataValidade">Data de Validade</label>
                  <input
                    type="date"
                    id="dataValidade"
                    value={formData.dataValidade.toISOString().split("T")[0]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dataValidade: new Date(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="limiteUso">Limite de Usos</label>
                  <input
                    type="number"
                    id="limiteUso"
                    value={formData.limiteUso}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        limiteUso: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                    min="1"
                    placeholder="Ex: 100"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="valorMinimo">Valor Mínimo do Pedido (R$) - Opcional</label>
                  <input
                    type="number"
                    id="valorMinimo"
                    value={minValueInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      setMinValueInput(value);
                      setFormData({
                        ...formData,
                        valorMinimo: parseFloat(value) || 0,
                      });
                    }}
                    min="0"
                    step="0.01"
                    placeholder="Ex: 50.00"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) =>
                        setFormData({ ...formData, ativo: e.target.checked })
                      }
                    />
                    <span>Cupom Ativo</span>
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={handleCancel}>
                    Cancelar
                  </button>
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? "Salvando..." : editingCoupon ? "Salvar Alterações" : "Adicionar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cupons;
