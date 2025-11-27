import { useState } from "react";
import { HiPencil, HiPlus } from "react-icons/hi";
import { Layout } from "../../components/layout";
import "./Cardapio.css";

const restaurantBg = "https://static.vecteezy.com/system/resources/previews/001/948/406/non_2x/wood-table-top-for-display-with-blurred-restaurant-background-free-photo.jpg";

export type ProductCategory = "entradas" | "pratos-principais" | "sobremesas" | "bebidas" | "drinks";

export interface Product {
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

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Bruschetta Italiana",
    image: "https://www.divvino.com.br/blog/wp-content/uploads/2024/03/receitas-de-bruschettas-capa.jpg",
    ingredients: "Pão italiano, tomate, manjericão, alho, azeite",
    price: 18.90,
    category: "entradas",
  },
  {
    id: "2",
    name: "Carpaccio de Salmão",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    ingredients: "Salmão fresco, rúcula, alcaparras, limão",
    price: 32.50,
    category: "entradas",
  },
  {
    id: "3",
    name: "Risotto de Camarão",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400",
    ingredients: "Arroz arbóreo, camarões, queijo parmesão, vinho branco",
    price: 45.90,
    category: "pratos-principais",
  },
  {
    id: "4",
    name: "Filé Mignon ao Molho Madeira",
    image: "https://sabores-new.s3.amazonaws.com/public/2024/11/bife-ao-molho-madeira.jpg",
    ingredients: "Filé mignon, molho madeira, batatas rústicas",
    price: 58.90,
    category: "pratos-principais",
  },
  {
    id: "5",
    name: "Tiramisu",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400",
    ingredients: "Biscoito champanhe, café, mascarpone, cacau",
    price: 22.90,
    category: "sobremesas",
  },
  {
    id: "6",
    name: "Brownie com Sorvete",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400",
    ingredients: "Brownie, sorvete de baunilha, calda de chocolate",
    price: 19.90,
    category: "sobremesas",
  },
  {
    id: "7",
    name: "Água Mineral",
    image: "https://www.delgo.com.br/imagens/como-e-feito-o-envase-de-agua-mineral.jpg",
    ingredients: "Água mineral natural",
    price: 4.50,
    category: "bebidas",
  },
  {
    id: "8",
    name: "Refrigerante",
    image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
    ingredients: "Refrigerante gelado",
    price: 6.90,
    category: "bebidas",
  },
  {
    id: "9",
    name: "Caipirinha",
    image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=400",
    ingredients: "Cachaça, limão, açúcar, gelo",
    price: 15.90,
    category: "drinks",
  },
  {
    id: "10",
    name: "Mojito",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400",
    ingredients: "Rum, hortelã, limão, água com gás",
    price: 18.90,
    category: "drinks",
  },
];

const Cardapio = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Product, "id">>({
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

  const handleEdit = (product: Product) => {
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

  const handleSave = () => {
    if (!formData.name || !formData.image || !formData.ingredients || formData.price <= 0) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? { ...formData, id: editingProduct.id }
            : p
        )
      );
    } else {
      const newProduct: Product = {
        ...formData,
        id: Date.now().toString(),
      };
      setProducts([...products, newProduct]);
    }

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

          {categories.map((category) => {
            const categoryProducts = getProductsByCategory(category);
            if (categoryProducts.length === 0) return null;

            return (
              <div key={category} className="category-section">
                <h2 className="category-title">{categoryLabels[category]}</h2>
                <div className="products-grid">
                  {categoryProducts.map((product) => (
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
                  ))}
                </div>
              </div>
            );
          })}
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

