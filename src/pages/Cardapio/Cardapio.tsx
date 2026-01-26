import { useState, useEffect } from "react";
import { HiPencil, HiPlus } from "react-icons/hi";
import { Layout } from "../../components/layout";
import { useAuth } from "../../hooks/useAuth";
import { useConfiguracoes } from "../../hooks/useConfiguracoes";
import { getProducts, createProduct, updateProduct } from "../../services/productService";
import "./Cardapio.css";

const defaultBg = "https://static.vecteezy.com/system/resources/previews/001/948/406/non_2x/wood-table-top-for-display-with-blurred-restaurant-background-free-photo.jpg";

export type ProductCategory = "entradas" | "pratos-principais" | "sobremesas" | "bebidas" | "drinks";

export interface CardapioProduct {
  id: string;
  name: string;
  image: string;
  ingredients: string;
  price: number;
  category: ProductCategory;
}

const categoryLabels: Record<ProductCategory, string> = {
  entradas: "Entradas",
  "pratos-principais": "Pratos Principais",
  sobremesas: "Sobremesas",
  bebidas: "Bebidas",
  drinks: "Drinks",
};

const Cardapio = () => {
  const { currentUser } = useAuth();
  const { config } = useConfiguracoes();
  const [products, setProducts] = useState<CardapioProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const restaurantBg = config?.capa || defaultBg;
  const corLayout = config?.corLayout || "#8B4513";

  useEffect(() => {
    const loadProducts = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const productsData = await getProducts(currentUser.uid);
        
        // Converter produtos do formato do serviço para o formato do Cardapio
        const produtosFiltrados = productsData.filter(p => {
          return p.visibilidade === true && p.status === "ativo";
        });
        
        const cardapioProducts = produtosFiltrados.map(p => {
          // Normalizar categoria: remover espaços extras e converter para minúsculas para comparação
          const categoriaNormalizada = (p.categoria || "").trim().toLowerCase();
          let categoriaFinal: ProductCategory = "entradas"; // padrão
          
          // Tentar encontrar correspondência exata ou parcial
          const categoriaMatch = categories.find(cat => 
            categoriaNormalizada === cat.toLowerCase() || 
            categoriaNormalizada.includes(cat.toLowerCase()) ||
            cat.toLowerCase().includes(categoriaNormalizada)
          );
          
          if (categoriaMatch) {
            categoriaFinal = categoriaMatch;
          }
          
          return {
            id: p.id,
            name: p.nome,
            image: p.fotoUrl || "",
            ingredients: p.descricao,
            price: p.preco,
            category: categoriaFinal,
          };
        });
        
        setProducts(cardapioProducts);
      } catch (error: any) {
        console.error("Erro ao carregar produtos:", error);
        console.error("Código do erro:", error?.code);
        console.error("Mensagem do erro:", error?.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [currentUser]);
  const [editingProduct, setEditingProduct] = useState<CardapioProduct | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<CardapioProduct, "id">>({
    name: "",
    image: "",
    ingredients: "",
    price: 0,
    category: "entradas",
  });
  const [priceInput, setPriceInput] = useState<string>("");

  const categories: ProductCategory[] = [
    "entradas",
    "pratos-principais",
    "sobremesas",
    "bebidas",
    "drinks",
  ];

  const handleEdit = (product: CardapioProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      image: product.image,
      ingredients: product.ingredients,
      price: product.price,
      category: product.category,
    });
    // Formata o preço para exibir no input (multiplica por 100 para ter centavos como inteiro)
    const cents = Math.round(product.price * 100).toString();
    setPriceInput(formatCurrencyInput(cents));
    setIsAddModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      image: "",
      ingredients: "",
      price: 0,
      category: "entradas",
    });
    setPriceInput("");
    setIsAddModalOpen(true);
  };

  const handleSave = async () => {
    if (!currentUser) {
      alert("Você precisa estar autenticado para salvar produtos.");
      return;
    }

    if (!formData.name || !formData.image || !formData.ingredients || formData.price <= 0) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    try {
      // Converter para o formato do serviço
      const productData = {
        nome: formData.name,
        descricao: formData.ingredients,
        preco: formData.price,
        fotoUrl: formData.image,
        categoria: formData.category,
        visibilidade: true,
        status: "ativo" as const,
      };

      if (editingProduct) {
        // Atualizar produto existente usando o serviço
        await updateProduct(editingProduct.id, productData);
      } else {
        // Criar novo produto usando o serviço
        await createProduct(productData, currentUser.uid);
      }

      // Recarregar produtos do Firebase
      const productsData = await getProducts(currentUser.uid);
      const cardapioProducts = productsData
        .filter(p => p.visibilidade && p.status === "ativo")
        .map(p => {
          // Normalizar categoria
          const categoriaNormalizada = (p.categoria || "").trim().toLowerCase();
          let categoriaFinal: ProductCategory = "entradas";
          
          const categoriaMatch = categories.find(cat => 
            categoriaNormalizada === cat.toLowerCase() || 
            categoriaNormalizada.includes(cat.toLowerCase()) ||
            cat.toLowerCase().includes(categoriaNormalizada)
          );
          
          if (categoriaMatch) {
            categoriaFinal = categoriaMatch;
          }
          
          return {
            id: p.id,
            name: p.nome,
            image: p.fotoUrl || "",
            ingredients: p.descricao,
            price: p.preco,
            category: categoriaFinal,
          };
        });
      setProducts(cardapioProducts);

      setIsAddModalOpen(false);
      setEditingProduct(null);
      setFormData({
        name: "",
        image: "",
        ingredients: "",
        price: 0,
        category: "entradas",
      });
      setPriceInput("");
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar produto. Tente novamente.");
    }
  };

  const handleCancel = () => {
    setIsAddModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      image: "",
      ingredients: "",
      price: 0,
      category: "entradas",
    });
    setPriceInput("");
  };

  const getProductsByCategory = (category: ProductCategory) => {
    return products.filter((p) => p.category === category);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  // Função para formatar valor monetário (da direita para esquerda)
  const formatCurrencyInput = (value: string): string => {
    // Remove tudo que não é número (incluindo R$ e espaços)
    const numbers = value.replace(/\D/g, "");
    
    if (numbers === "") return "";
    
    // Converte para número e divide por 100 para ter centavos
    const amount = parseInt(numbers, 10) / 100;
    
    // Formata como moeda brasileira (sem R$)
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Função para converter valor formatado de volta para número
  const parseCurrencyInput = (value: string): number => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");
    
    if (numbers === "") return 0;
    
    // Converte para número e divide por 100
    return parseInt(numbers, 10) / 100;
  };

  // Handler para mudança no input de preço
  const handlePriceChange = (value: string) => {
    setPriceInput(value);
    const numericValue = parseCurrencyInput(value);
    setFormData({
      ...formData,
      price: numericValue,
    });
  };

  return (
    <Layout>
      <div
        className="cardapio-container"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 69, 19, 0.7), rgba(139, 69, 19, 0.7)), url(${restaurantBg})`,
          backgroundColor: corLayout,
        }}
      >
        <div className="cardapio-content">
          <div className="cardapio-header">
            <h1>Cardápio</h1>
            <button className="add-product-btn" onClick={handleAdd}>
              <HiPlus size={20} />
              Adicionar Produto
            </button>
          </div>

          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <p>Carregando produtos...</p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <p>Nenhum produto encontrado.</p>
            </div>
          ) : (
            <>
              {categories.map((category) => {
                const categoryProducts = getProductsByCategory(category);
                if (categoryProducts.length === 0) return null;

                return (
                  <div key={category} className="category-section">
                    <h2 className="category-title">{categoryLabels[category]}</h2>
                    <div className="products-grid">
                      {categoryProducts.map((product) => {
                        return (
                          <div key={product.id} className="product-card">
                            <button
                              className="edit-icon-btn"
                              onClick={() => handleEdit(product)}
                              aria-label="Editar produto"
                            >
                              <HiPencil size={18} />
                            </button>
                            <div className="product-image">
                              <img src={product.image} alt={product.name} />
                            </div>
                            <div className="product-info">
                              <h3 className="product-name">{product.name}</h3>
                              <p className="product-ingredients">{product.ingredients}</p>
                              <p className="product-price">{formatPrice(product.price)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Modal de Adicionar/Editar */}
        {isAddModalOpen && (
          <div className="modal-overlay" onClick={handleCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingProduct ? "Editar Produto" : "Adicionar Produto"}</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <div className="form-group">
                  <label htmlFor="name">Nome do Produto</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Ex: Bruschetta Italiana"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="image">URL da Imagem</label>
                  <input
                    type="url"
                    id="image"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    required
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ingredients">Ingredientes</label>
                  <textarea
                    id="ingredients"
                    value={formData.ingredients}
                    onChange={(e) =>
                      setFormData({ ...formData, ingredients: e.target.value })
                    }
                    required
                    placeholder="Liste os ingredientes separados por vírgula"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">Preço</label>
                  <div className="price-input-wrapper">
                    <span className="currency-prefix">R$</span>
                    <input
                      type="text"
                      id="price"
                      value={priceInput}
                      onChange={(e) => {
                        const formatted = formatCurrencyInput(e.target.value);
                        handlePriceChange(formatted);
                      }}
                      onKeyDown={(e) => {
                        // Permite apenas números, backspace, delete, tab, escape, enter
                        if (
                          !/[0-9]/.test(e.key) &&
                          !["Backspace", "Delete", "Tab", "Escape", "Enter"].includes(e.key) &&
                          !(e.ctrlKey && ["a", "c", "v", "x"].includes(e.key.toLowerCase()))
                        ) {
                          e.preventDefault();
                        }
                      }}
                      required
                      placeholder="0,00"
                      className="price-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="category">Categoria</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as ProductCategory,
                      })
                    }
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {categoryLabels[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={handleCancel}>
                    Cancelar
                  </button>
                  <button type="submit" className="save-btn">
                    {editingProduct ? "Salvar Alterações" : "Adicionar"}
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

export default Cardapio;

