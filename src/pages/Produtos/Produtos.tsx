import { useState, useEffect } from "react";
import { HiPencil, HiPlus, HiTrash, HiEye, HiEyeOff, HiDuplicate, HiX } from "react-icons/hi";
import { Layout } from "../../components/layout";
import { useAuth } from "../../hooks/useAuth";
import { useConfiguracoes } from "../../hooks/useConfiguracoes";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getGlobalVariations,
  createGlobalVariation,
  updateGlobalVariation,
  deleteGlobalVariation,
  type Product,
  type ProductVariation,
  type VariationItem,
  type GlobalVariation,
} from "../../services/productService";
import "./Produtos.css";

const defaultBg = "https://static.vecteezy.com/system/resources/previews/001/948/406/non_2x/wood-table-top-for-display-with-blurred-restaurant-background-free-photo.jpg";

const Produtos = () => {
  const { currentUser } = useAuth();
  const { config } = useConfiguracoes();
  const [products, setProducts] = useState<Product[]>([]);
  const [globalVariations, setGlobalVariations] = useState<GlobalVariation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Garantir que sempre tenha valores padrão
  const restaurantBg = (config && config.capa) ? config.capa : defaultBg;
  const corLayout = (config && config.corLayout) ? config.corLayout : "#8B4513";
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGlobalVariationModalOpen, setIsGlobalVariationModalOpen] = useState(false);
  const [editingGlobalVariation, setEditingGlobalVariation] = useState<GlobalVariation | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<Omit<Product, "id" | "userId" | "createdAt" | "updatedAt">>({
    nome: "",
    descricao: "",
    preco: 0,
    fotoUrl: "",
    categoria: "",
    visibilidade: true,
    status: "ativo",
    variacaoGlobal: undefined,
    variacaoUnitaria: undefined,
  });

  const [globalVariationForm, setGlobalVariationForm] = useState<Omit<GlobalVariation, "id">>({
    nome: "",
    escolhaMinima: 0,
    escolhaMaxima: 1,
    itens: [],
    visibilidade: true,
  });

  const [expandedVariations, setExpandedVariations] = useState<Set<string>>(new Set());

  // Debug: monitorar mudanças no estado de produtos
  useEffect(() => {
    console.log("Estado de produtos atualizado:", products.length, "produtos");
    if (products.length > 0) {
      console.log("Primeiro produto:", products[0]);
    }
  }, [products]);

  // Carregar produtos e variações globais
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Carregando produtos e variações para usuário:", currentUser.uid);
        const [productsData, variationsData] = await Promise.all([
          getProducts(currentUser.uid),
          getGlobalVariations(currentUser.uid),
        ]);
        console.log("Produtos carregados:", productsData.length);
        console.log("Produtos carregados (detalhes):", productsData);
        console.log("Variações carregadas:", variationsData.length);
        setProducts(productsData);
        setGlobalVariations(variationsData);
        console.log("Estado atualizado com", productsData.length, "produtos");
      } catch (error: any) {
        console.error("Erro ao carregar dados:", error);
        console.error("Código do erro:", error?.code);
        console.error("Mensagem do erro:", error?.message);
        setProducts([]);
        setGlobalVariations([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      nome: "",
      descricao: "",
      preco: 0,
      fotoUrl: "",
      categoria: "",
      visibilidade: true,
      status: "ativo",
      variacaoGlobal: undefined,
      variacaoUnitaria: undefined,
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nome: product.nome,
      descricao: product.descricao,
      preco: product.preco,
      fotoUrl: product.fotoUrl || "",
      categoria: product.categoria,
      visibilidade: product.visibilidade,
      status: product.status,
      variacaoGlobal: product.variacaoGlobal,
      variacaoUnitaria: product.variacaoUnitaria,
    });
    setIsAddModalOpen(true);
  };

  const handleCopy = async (product: Product) => {
    if (!currentUser) return;
    
    try {
      const newProduct: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
        ...product,
        nome: `${product.nome} (Cópia)`,
        userId: currentUser.uid,
      };
      const newId = await createProduct(newProduct, currentUser.uid);
      const productsData = await getProducts(currentUser.uid);
      setProducts(productsData);
    } catch (error: any) {
      console.error("Erro ao copiar produto:", error);
      alert("Erro ao copiar produto. Tente novamente.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) {
      return;
    }

    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (error: any) {
      console.error("Erro ao deletar produto:", error);
      alert("Erro ao deletar produto. Tente novamente.");
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      const newStatus = product.status === "ativo" ? "inativo" : "ativo";
      await updateProduct(product.id, { status: newStatus });
      setProducts(
        products.map((p) =>
          p.id === product.id ? { ...p, status: newStatus } : p
        )
      );
    } catch (error: any) {
      console.error("Erro ao alterar status:", error);
      alert("Erro ao alterar status. Tente novamente.");
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      alert("Você precisa estar autenticado para criar produtos.");
      return;
    }

    if (!formData.nome || !formData.categoria || formData.preco <= 0) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setSaving(true);

      // Limpar variações vazias antes de salvar
      // Uma variação só é válida se tiver itens com pelo menos um nome preenchido
      const hasValidGlobalVariation = formData.variacaoGlobal && 
        formData.variacaoGlobal.itens && 
        formData.variacaoGlobal.itens.length > 0 &&
        formData.variacaoGlobal.itens.some(item => item.nome && item.nome.trim() !== "");
      
      const hasValidUnitaryVariation = formData.variacaoUnitaria && 
        formData.variacaoUnitaria.itens && 
        formData.variacaoUnitaria.itens.length > 0 &&
        formData.variacaoUnitaria.itens.some(item => item.nome && item.nome.trim() !== "");

      const productToSave = {
        ...formData,
        variacaoGlobal: hasValidGlobalVariation ? formData.variacaoGlobal : undefined,
        variacaoUnitaria: hasValidUnitaryVariation ? formData.variacaoUnitaria : undefined,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productToSave);
        console.log("Produto atualizado, recarregando lista...");
        const productsData = await getProducts(currentUser.uid);
        console.log("Produtos recarregados após atualização:", productsData.length);
        setProducts(productsData);
      } else {
        const newProductId = await createProduct(productToSave, currentUser.uid);
        console.log("Produto criado com ID:", newProductId);
        console.log("Recarregando lista de produtos...");
        const productsData = await getProducts(currentUser.uid);
        console.log("Produtos recarregados após criação:", productsData.length);
        console.log("Produtos recarregados (detalhes):", productsData);
        setProducts(productsData);
      }

      setIsAddModalOpen(false);
      setEditingProduct(null);
      // Reset form
      setFormData({
        nome: "",
        descricao: "",
        preco: 0,
        fotoUrl: "",
        categoria: "",
        visibilidade: true,
        status: "ativo",
        variacaoGlobal: undefined,
        variacaoUnitaria: undefined,
      });
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error);
      console.error("Código do erro:", error?.code);
      console.error("Mensagem do erro:", error?.message);
      
      let errorMessage = "Erro ao salvar produto. Tente novamente.";
      if (error?.code === "permission-denied" || error?.code === 7) {
        errorMessage = "Permissão negada. Verifique as regras do Firestore.";
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsAddModalOpen(false);
    setEditingProduct(null);
  };

  // Funções para variações globais
  const handleAddGlobalVariation = () => {
    setEditingGlobalVariation(null);
    setGlobalVariationForm({
      nome: "",
      escolhaMinima: 0,
      escolhaMaxima: 1,
      itens: [],
      visibilidade: true,
    });
    setIsGlobalVariationModalOpen(true);
  };

  const handleEditGlobalVariation = (variation: GlobalVariation) => {
    setEditingGlobalVariation(variation);
    setGlobalVariationForm({
      nome: variation.nome,
      escolhaMinima: variation.escolhaMinima,
      escolhaMaxima: variation.escolhaMaxima,
      itens: variation.itens,
      visibilidade: variation.visibilidade,
    });
    setIsGlobalVariationModalOpen(true);
  };

  const handleSaveGlobalVariation = async () => {
    if (!currentUser) return;

    if (!globalVariationForm.nome || globalVariationForm.itens.length === 0) {
      alert("Por favor, preencha o nome e adicione pelo menos um item.");
      return;
    }

    try {
      setSaving(true);
      if (editingGlobalVariation?.id) {
        await updateGlobalVariation(editingGlobalVariation.id, globalVariationForm);
      } else {
        await createGlobalVariation(globalVariationForm, currentUser.uid);
      }
      const variationsData = await getGlobalVariations(currentUser.uid);
      setGlobalVariations(variationsData);
      setIsGlobalVariationModalOpen(false);
      setEditingGlobalVariation(null);
    } catch (error: any) {
      console.error("Erro ao salvar variação global:", error);
      alert("Erro ao salvar variação global. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGlobalVariation = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta variação global?")) {
      return;
    }

    try {
      await deleteGlobalVariation(id);
      setGlobalVariations(globalVariations.filter((v) => v.id !== id));
    } catch (error: any) {
      console.error("Erro ao deletar variação global:", error);
      alert("Erro ao deletar variação global. Tente novamente.");
    }
  };

  const addVariationItem = (variationType: "global" | "unitaria" | "formGlobal") => {
    if (variationType === "formGlobal") {
      setGlobalVariationForm({
        ...globalVariationForm,
        itens: [
          ...globalVariationForm.itens,
          { nome: "", descricao: "", precoAdicional: 0 },
        ],
      });
    } else {
      const key = variationType === "global" ? "variacaoGlobal" : "variacaoUnitaria";
      const currentVariation = formData[key];
      
      if (!currentVariation) {
        const newVariation: ProductVariation = {
          nome: variationType === "global" ? "Variação Global" : "Variação Unitária",
          escolhaMinima: 0,
          escolhaMaxima: 1,
          itens: [{ nome: "", descricao: "", precoAdicional: 0 }],
        };
        setFormData({ ...formData, [key]: newVariation });
      } else {
        setFormData({
          ...formData,
          [key]: {
            ...currentVariation,
            itens: [
              ...currentVariation.itens,
              { nome: "", descricao: "", precoAdicional: 0 },
            ],
          },
        });
      }
    }
  };

  const removeVariationItem = (index: number, variationType: "global" | "unitaria" | "formGlobal") => {
    if (variationType === "formGlobal") {
      setGlobalVariationForm({
        ...globalVariationForm,
        itens: globalVariationForm.itens.filter((_, i) => i !== index),
      });
    } else {
      const key = variationType === "global" ? "variacaoGlobal" : "variacaoUnitaria";
      const currentVariation = formData[key];
      if (currentVariation) {
        setFormData({
          ...formData,
          [key]: {
            ...currentVariation,
            itens: currentVariation.itens.filter((_, i) => i !== index),
          },
        });
      }
    }
  };

  const updateVariationItem = (
    index: number,
    field: keyof VariationItem,
    value: string | number,
    variationType: "global" | "unitaria" | "formGlobal"
  ) => {
    if (variationType === "formGlobal") {
      const newItens = [...globalVariationForm.itens];
      newItens[index] = { ...newItens[index], [field]: value };
      setGlobalVariationForm({ ...globalVariationForm, itens: newItens });
    } else {
      const key = variationType === "global" ? "variacaoGlobal" : "variacaoUnitaria";
      const currentVariation = formData[key];
      if (currentVariation) {
        const newItens = [...currentVariation.itens];
        newItens[index] = { ...newItens[index], [field]: value };
        setFormData({
          ...formData,
          [key]: { ...currentVariation, itens: newItens },
        });
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const toggleVariationExpansion = (productId: string) => {
    const newExpanded = new Set(expandedVariations);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedVariations(newExpanded);
  };

  return (
    <Layout>
      <div
        className="produtos-container"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 69, 19, 0.7), rgba(139, 69, 19, 0.7)), url(${restaurantBg})`,
          backgroundColor: corLayout,
        }}
      >
        <div className="produtos-content">
          <div className="produtos-header">
            <h1>Produtos</h1>
            <div className="header-actions">
              <button className="add-global-variation-btn" onClick={handleAddGlobalVariation}>
                <HiPlus size={20} />
                Nova Variação Global
              </button>
              <button className="add-product-btn" onClick={handleAdd}>
                <HiPlus size={20} />
                Novo Produto
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-message">
              <p>Carregando produtos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>Nenhum produto cadastrado. Clique em "Novo Produto" para criar um novo.</p>
              {process.env.NODE_ENV === 'development' && (
                <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                  Debug: Total de produtos no estado: {products.length}
                </p>
              )}
            </div>
          ) : (
            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Visibilidade</th>
                    <th>Status</th>
                    <th>Preço</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.nome}</td>
                      <td>{product.categoria}</td>
                      <td>
                        <span className={`visibility-badge ${product.visibilidade ? "visible" : "hidden"}`}>
                          {product.visibilidade ? (
                            <>
                              <HiEye size={16} /> Visível
                            </>
                          ) : (
                            <>
                              <HiEyeOff size={16} /> Oculto
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${product.status}`}>
                          {product.status === "ativo" ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td>{formatCurrency(product.preco)}</td>
                      <td>
                        <div className="product-actions">
                          <button
                            className="action-btn desativar-btn"
                            onClick={() => handleToggleStatus(product)}
                            title={product.status === "ativo" ? "Desativar" : "Ativar"}
                          >
                            {product.status === "ativo" ? "Desativar" : "Ativar"}
                          </button>
                          <button
                            className="action-btn copiar-btn"
                            onClick={() => handleCopy(product)}
                            title="Copiar"
                          >
                            <HiDuplicate size={16} />
                          </button>
                          <button
                            className="action-btn editar-btn"
                            onClick={() => handleEdit(product)}
                            title="Editar"
                          >
                            <HiPencil size={16} />
                          </button>
                          <button
                            className="action-btn excluir-btn"
                            onClick={() => handleDelete(product.id)}
                            title="Excluir"
                          >
                            <HiTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Variações Globais */}
          {globalVariations.length > 0 && (
            <div className="global-variations-section">
              <h2 className="section-title">Variações Globais</h2>
              <div className="global-variations-grid">
                {globalVariations.map((variation) => (
                  <div key={variation.id} className="global-variation-card">
                    <div className="variation-header">
                      <h3>{variation.nome}</h3>
                      <div className="variation-actions">
                        <button
                          className="action-btn editar-btn"
                          onClick={() => handleEditGlobalVariation(variation)}
                        >
                          <HiPencil size={16} />
                        </button>
                        <button
                          className="action-btn excluir-btn"
                          onClick={() => variation.id && handleDeleteGlobalVariation(variation.id)}
                        >
                          <HiTrash size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="variation-info">
                      <p>
                        <strong>Escolha:</strong> {variation.escolhaMinima} - {variation.escolhaMaxima}
                      </p>
                      <p>
                        <strong>Visibilidade:</strong> {variation.visibilidade ? "Visível" : "Oculta"}
                      </p>
                      <p>
                        <strong>Itens:</strong> {variation.itens.length}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal de Adicionar/Editar Produto */}
        {isAddModalOpen && (
          <div className="modal-overlay" onClick={handleCancel}>
            <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{editingProduct ? "Editar Produto" : "Novo Produto"}</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="categoria">Categoria *</label>
                    <input
                      type="text"
                      id="categoria"
                      value={formData.categoria}
                      onChange={(e) =>
                        setFormData({ ...formData, categoria: e.target.value })
                      }
                      required
                      placeholder="Ex: Bebidas, Comidas, Sobremesas"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="nome">Nome *</label>
                    <input
                      type="text"
                      id="nome"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      required
                      placeholder="Nome do produto"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="descricao">Descrição</label>
                  <textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    rows={3}
                    placeholder="Descrição do produto"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="preco">Preço *</label>
                    <input
                      type="number"
                      id="preco"
                      value={formData.preco}
                      onChange={(e) =>
                        setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })
                      }
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fotoUrl">Foto do Produto (URL)</label>
                    <input
                      type="url"
                      id="fotoUrl"
                      value={formData.fotoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, fotoUrl: e.target.value })
                      }
                      placeholder="https://exemplo.com/foto.jpg"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.visibilidade}
                        onChange={(e) =>
                          setFormData({ ...formData, visibilidade: e.target.checked })
                        }
                      />
                      <span>Visível</span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as "ativo" | "inativo" })
                      }
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                </div>

                {/* Variação Global */}
                <div className="variation-section">
                  <h3>Variação Global</h3>
                  {formData.variacaoGlobal ? (
                    <div className="variation-content">
                      <div className="variation-header-form">
                        <input
                          type="text"
                          value={formData.variacaoGlobal.nome}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              variacaoGlobal: {
                                ...formData.variacaoGlobal!,
                                nome: e.target.value,
                              },
                            })
                          }
                          placeholder="Nome da Variação GLOBAL"
                        />
                        <button
                          type="button"
                          className="remove-variation-btn"
                          onClick={() => setFormData({ ...formData, variacaoGlobal: undefined })}
                        >
                          <HiX size={20} />
                        </button>
                      </div>
                      <div className="variation-controls">
                        <div className="form-group">
                          <label>Escolha Mínima</label>
                          <input
                            type="number"
                            value={formData.variacaoGlobal.escolhaMinima}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                variacaoGlobal: {
                                  ...formData.variacaoGlobal!,
                                  escolhaMinima: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            min="0"
                          />
                        </div>
                        <div className="form-group">
                          <label>Escolha Máxima</label>
                          <input
                            type="number"
                            value={formData.variacaoGlobal.escolhaMaxima}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                variacaoGlobal: {
                                  ...formData.variacaoGlobal!,
                                  escolhaMaxima: parseInt(e.target.value) || 1,
                                },
                              })
                            }
                            min="1"
                          />
                        </div>
                      </div>
                      {formData.variacaoGlobal.itens.map((item, index) => (
                        <div key={index} className="variation-item">
                          <input
                            type="text"
                            value={item.nome}
                            onChange={(e) =>
                              updateVariationItem(index, "nome", e.target.value, "global")
                            }
                            placeholder="Nome do item"
                          />
                          <input
                            type="text"
                            value={item.descricao || ""}
                            onChange={(e) =>
                              updateVariationItem(index, "descricao", e.target.value, "global")
                            }
                            placeholder="Descrição"
                          />
                          <input
                            type="number"
                            value={item.precoAdicional}
                            onChange={(e) =>
                              updateVariationItem(
                                index,
                                "precoAdicional",
                                parseFloat(e.target.value) || 0,
                                "global"
                              )
                            }
                            placeholder="Preço Adicional"
                            step="0.01"
                          />
                          <button
                            type="button"
                            className="remove-item-btn"
                            onClick={() => removeVariationItem(index, "global")}
                          >
                            <HiX size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-item-btn"
                        onClick={() => addVariationItem("global")}
                      >
                        <HiPlus size={16} />
                        Adicionar Item
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="add-variation-btn"
                      onClick={() => addVariationItem("global")}
                    >
                      Adicionar Variação Global
                    </button>
                  )}
                </div>

                {/* Variação Unitária */}
                <div className="variation-section">
                  <h3>Variação Unitária</h3>
                  {formData.variacaoUnitaria ? (
                    <div className="variation-content">
                      <div className="variation-header-form">
                        <input
                          type="text"
                          value={formData.variacaoUnitaria.nome}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              variacaoUnitaria: {
                                ...formData.variacaoUnitaria!,
                                nome: e.target.value,
                              },
                            })
                          }
                          placeholder="Nome da Variação Unitária"
                        />
                        <button
                          type="button"
                          className="remove-variation-btn"
                          onClick={() => setFormData({ ...formData, variacaoUnitaria: undefined })}
                        >
                          <HiX size={20} />
                        </button>
                      </div>
                      <div className="variation-controls">
                        <div className="form-group">
                          <label>Escolha Mínima</label>
                          <input
                            type="number"
                            value={formData.variacaoUnitaria.escolhaMinima}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                variacaoUnitaria: {
                                  ...formData.variacaoUnitaria!,
                                  escolhaMinima: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            min="0"
                          />
                        </div>
                        <div className="form-group">
                          <label>Escolha Máxima</label>
                          <input
                            type="number"
                            value={formData.variacaoUnitaria.escolhaMaxima}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                variacaoUnitaria: {
                                  ...formData.variacaoUnitaria!,
                                  escolhaMaxima: parseInt(e.target.value) || 1,
                                },
                              })
                            }
                            min="1"
                          />
                        </div>
                      </div>
                      {formData.variacaoUnitaria.itens.map((item, index) => (
                        <div key={index} className="variation-item">
                          <input
                            type="text"
                            value={item.nome}
                            onChange={(e) =>
                              updateVariationItem(index, "nome", e.target.value, "unitaria")
                            }
                            placeholder="Nome do item"
                          />
                          <input
                            type="text"
                            value={item.descricao || ""}
                            onChange={(e) =>
                              updateVariationItem(index, "descricao", e.target.value, "unitaria")
                            }
                            placeholder="Descrição"
                          />
                          <input
                            type="number"
                            value={item.precoAdicional}
                            onChange={(e) =>
                              updateVariationItem(
                                index,
                                "precoAdicional",
                                parseFloat(e.target.value) || 0,
                                "unitaria"
                              )
                            }
                            placeholder="Preço Adicional"
                            step="0.01"
                          />
                          <button
                            type="button"
                            className="remove-item-btn"
                            onClick={() => removeVariationItem(index, "unitaria")}
                          >
                            <HiX size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-item-btn"
                        onClick={() => addVariationItem("unitaria")}
                      >
                        <HiPlus size={16} />
                        Adicionar Item
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="add-variation-btn"
                      onClick={() => addVariationItem("unitaria")}
                    >
                      Adicionar Variação Unitária
                    </button>
                  )}
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={handleCancel}>
                    Cancelar
                  </button>
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? "Salvando..." : editingProduct ? "Salvar Alterações" : "Salvar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Variação Global */}
        {isGlobalVariationModalOpen && (
          <div className="modal-overlay" onClick={() => setIsGlobalVariationModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>
                {editingGlobalVariation ? "Editar Variação Global" : "Nova Variação Global"}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveGlobalVariation();
                }}
              >
                <div className="form-group">
                  <label htmlFor="variationName">Nome da Variação *</label>
                  <input
                    type="text"
                    id="variationName"
                    value={globalVariationForm.nome}
                    onChange={(e) =>
                      setGlobalVariationForm({ ...globalVariationForm, nome: e.target.value })
                    }
                    required
                    placeholder="Nome da Variação"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="escolhaMinima">Escolha Mínima</label>
                    <input
                      type="number"
                      id="escolhaMinima"
                      value={globalVariationForm.escolhaMinima}
                      onChange={(e) =>
                        setGlobalVariationForm({
                          ...globalVariationForm,
                          escolhaMinima: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="escolhaMaxima">Escolha Máxima</label>
                    <input
                      type="number"
                      id="escolhaMaxima"
                      value={globalVariationForm.escolhaMaxima}
                      onChange={(e) =>
                        setGlobalVariationForm({
                          ...globalVariationForm,
                          escolhaMaxima: parseInt(e.target.value) || 1,
                        })
                      }
                      min="1"
                    />
                  </div>
                </div>

                <div className="variation-items-section">
                  <h3>Itens da Variação</h3>
                  {globalVariationForm.itens.map((item, index) => (
                    <div key={index} className="variation-item">
                      <input
                        type="text"
                        value={item.nome}
                        onChange={(e) =>
                          updateVariationItem(index, "nome", e.target.value, "formGlobal")
                        }
                        placeholder="Nome do item"
                        required
                      />
                      <input
                        type="text"
                        value={item.descricao || ""}
                        onChange={(e) =>
                          updateVariationItem(index, "descricao", e.target.value, "formGlobal")
                        }
                        placeholder="Descrição"
                      />
                      <input
                        type="number"
                        value={item.precoAdicional}
                        onChange={(e) =>
                          updateVariationItem(
                            index,
                            "precoAdicional",
                            parseFloat(e.target.value) || 0,
                            "formGlobal"
                          )
                        }
                        placeholder="Preço Adicional"
                        step="0.01"
                      />
                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() => removeVariationItem(index, "formGlobal")}
                      >
                        <HiX size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={() => addVariationItem("formGlobal")}
                  >
                    <HiPlus size={16} />
                    Adicionar Item
                  </button>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={globalVariationForm.visibilidade}
                      onChange={(e) =>
                        setGlobalVariationForm({
                          ...globalVariationForm,
                          visibilidade: e.target.checked,
                        })
                      }
                    />
                    <span>Visibilidade</span>
                  </label>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setIsGlobalVariationModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? "Salvando..." : editingGlobalVariation ? "Salvar Alterações" : "Adicionar"}
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

export default Produtos;
