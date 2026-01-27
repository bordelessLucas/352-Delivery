import { useState, useEffect } from "react";
import { HiCog, HiPhotograph, HiCreditCard, HiTruck, HiPhone, HiUser, HiTrash, HiPencil, HiPlus, HiViewGrid } from "react-icons/hi";
import { Layout } from "../../components/layout";
import { useAuth } from "../../hooks/useAuth";
import {
  getConfiguracoes,
  updateConfigGeral,
  updateConfigAparencia,
  updateConfigPagamento,
  updateConfigEntrega,
  updateConfigContato,
  updateConfigUsuario,
  type BairroEntrega,
} from "../../services/configuracoesService";
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  type Banner,
} from "../../services/bannerService";
import "./Configuracoes.css";

const Configuracoes = () => {
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState<string>("geral");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bairros, setBairros] = useState<BairroEntrega[]>([]);
  const [editingBairro, setEditingBairro] = useState<BairroEntrega | null>(null);
  const [showBairroModal, setShowBairroModal] = useState(false);

  // Estados do formulário Geral
  const [geral, setGeral] = useState({
    nomeLoja: "",
    descricao: "",
    segmento: "",
    titulo: "",
    estado: "",
    cidade: "",
    url: "",
  });

  // Estados do formulário Aparência
  const [aparencia, setAparencia] = useState({
    fotoPerfil: "",
    capa: "",
    corLayout: "#8B4513",
    exibicao: "grade", // grade ou lista
  });

  // Estados do formulário Pagamento
  const [pagamento, setPagamento] = useState({
    aceitaDinheiro: false,
    aceitaCredito: false,
    aceitaDebito: false,
    bandeiras: "",
    aceitaPix: false,
  });

  // Estados do formulário Entrega
  const [entrega, setEntrega] = useState({
    tempoEntrega: "",
  });

  // Estados do formulário Contato
  const [contato, setContato] = useState({
    whatsapp: "",
    email: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    youtube: "",
    localizacao: "",
  });

  // Estados do formulário Usuário
  const [usuario, setUsuario] = useState({
    nomeUsuario: "",
    dataNascimento: "",
    tipoDocumento: "CPF", // CPF ou CNPJ
    numeroDocumento: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  // Estados do modal de bairro
  const [bairroForm, setBairroForm] = useState({
    nome: "",
    distancia: "",
    preco: "",
  });

  // Estados de Banners
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    titulo: "",
    imagemDesktop: "",
    imagemMobile: "",
    visivel: true,
  });
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string>("");
  const [mobilePreview, setMobilePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const sections = [
    { id: "geral", label: "Geral", icon: HiCog },
    { id: "aparencia", label: "Aparência", icon: HiPhotograph },
    { id: "banners", label: "Banners", icon: HiViewGrid },
    { id: "pagamento", label: "Pagamento", icon: HiCreditCard },
    { id: "entrega", label: "Entrega", icon: HiTruck },
    { id: "contato", label: "Contato", icon: HiPhone },
    { id: "usuario", label: "Usuário", icon: HiUser },
  ];

  // Carregar configurações do banco
  useEffect(() => {
    const loadConfiguracoes = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const config = await getConfiguracoes(currentUser.uid);
        setGeral(config.geral);
        setAparencia(config.aparencia);
        setPagamento(config.pagamento);
        setEntrega(config.entrega);
        setContato(config.contato);
        setUsuario(config.usuario);
        setBairros(config.entrega.bairros);
        
        // Carregar banners
        const bannersData = await getBanners(currentUser.uid);
        setBanners(bannersData);
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConfiguracoes();
  }, [currentUser]);

  const handleSaveGeral = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      await updateConfigGeral(currentUser.uid, geral);
      alert("Configurações gerais salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações gerais:", error);
      alert("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAparencia = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      await updateConfigAparencia(currentUser.uid, aparencia);
      alert("Configurações de aparência salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações de aparência:", error);
      alert("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePagamento = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      await updateConfigPagamento(currentUser.uid, pagamento);
      alert("Configurações de pagamento salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações de pagamento:", error);
      alert("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEntrega = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      await updateConfigEntrega(currentUser.uid, {
        tempoEntrega: entrega.tempoEntrega,
        bairros: bairros,
      });
      alert("Configurações de entrega salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações de entrega:", error);
      alert("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContato = async () => {
    if (!currentUser) return;
    
    try {
      setSaving(true);
      await updateConfigContato(currentUser.uid, contato);
      alert("Configurações de contato salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações de contato:", error);
      alert("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUsuario = async () => {
    if (!currentUser) return;
    
    if (usuario.senha && usuario.senha !== usuario.confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }
    
    try {
      setSaving(true);
      const usuarioData: any = { ...usuario };
      if (!usuario.senha) {
        delete usuarioData.senha;
      }
      delete usuarioData.confirmarSenha;
      
      await updateConfigUsuario(currentUser.uid, usuarioData);
      alert("Configurações de usuário salvas com sucesso!");
      setUsuario({ ...usuario, senha: "", confirmarSenha: "" });
    } catch (error) {
      console.error("Erro ao salvar configurações de usuário:", error);
      alert("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddBairro = () => {
    setEditingBairro(null);
    setBairroForm({ nome: "", distancia: "", preco: "" });
    setShowBairroModal(true);
  };

  const handleEditBairro = (bairro: BairroEntrega) => {
    setEditingBairro(bairro);
    setBairroForm({
      nome: bairro.nome,
      distancia: bairro.distancia.toString(),
      preco: bairro.preco.toString(),
    });
    setShowBairroModal(true);
  };

  const handleDeleteBairro = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este bairro?")) {
      setBairros(bairros.filter((b) => b.id !== id));
    }
  };

  const handleSaveBairro = () => {
    if (!bairroForm.nome || !bairroForm.distancia || !bairroForm.preco) {
      alert("Preencha todos os campos!");
      return;
    }

    if (editingBairro) {
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
    } else {
      const newBairro: BairroEntrega = {
        id: Date.now().toString(),
        nome: bairroForm.nome,
        distancia: parseFloat(bairroForm.distancia),
        preco: parseFloat(bairroForm.preco),
      };
      setBairros([...bairros, newBairro]);
    }
    setShowBairroModal(false);
    setBairroForm({ nome: "", distancia: "", preco: "" });
    setEditingBairro(null);
  };

  // Handlers de Banner
  const handleAddBanner = () => {
    setEditingBanner(null);
    setBannerForm({ titulo: "", imagemDesktop: "", imagemMobile: "", visivel: true });
    setDesktopFile(null);
    setMobileFile(null);
    setDesktopPreview("");
    setMobilePreview("");
    setShowBannerModal(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerForm({
      titulo: banner.titulo,
      imagemDesktop: banner.imagemDesktop,
      imagemMobile: banner.imagemMobile,
      visivel: banner.visivel,
    });
    setDesktopPreview(banner.imagemDesktop);
    setMobilePreview(banner.imagemMobile);
    setDesktopFile(null);
    setMobileFile(null);
    setShowBannerModal(true);
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este banner?")) {
      return;
    }

    try {
      await deleteBanner(id);
      setBanners(banners.filter((b) => b.id !== id));
      alert("Banner excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir banner:", error);
      alert("Erro ao excluir banner. Tente novamente.");
    }
  };

  const handleDesktopFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDesktopFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDesktopPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMobileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMobileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMobilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBanner = async () => {
    if (!currentUser) return;

    if (!bannerForm.titulo) {
      alert("Preencha o título do banner!");
      return;
    }

    if (!editingBanner && (!desktopFile || !mobileFile)) {
      alert("Selecione as imagens para desktop e mobile!");
      return;
    }

    try {
      setUploading(true);

      if (editingBanner) {
        await updateBanner(
          editingBanner.id!,
          {
            titulo: bannerForm.titulo,
            visivel: bannerForm.visivel,
          },
          desktopFile || undefined,
          mobileFile || undefined
        );
        alert("Banner atualizado com sucesso!");
      } else {
        await createBanner(
          {
            titulo: bannerForm.titulo,
            imagemDesktop: "",
            imagemMobile: "",
            visivel: bannerForm.visivel,
          },
          currentUser.uid,
          desktopFile!,
          mobileFile!
        );
        alert("Banner criado com sucesso!");
      }

      // Recarregar banners
      const bannersData = await getBanners(currentUser.uid);
      setBanners(bannersData);

      setShowBannerModal(false);
      setBannerForm({ titulo: "", imagemDesktop: "", imagemMobile: "", visivel: true });
      setDesktopFile(null);
      setMobileFile(null);
      setDesktopPreview("");
      setMobilePreview("");
      setEditingBanner(null);
    } catch (error) {
      console.error("Erro ao salvar banner:", error);
      alert("Erro ao salvar banner. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case "geral":
        return (
          <div className="config-section">
            <h2>Configurações Gerais</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome da Loja</label>
                <input
                  type="text"
                  value={geral.nomeLoja}
                  onChange={(e) => setGeral({ ...geral, nomeLoja: e.target.value })}
                  placeholder="Digite o nome da loja"
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={geral.descricao}
                  onChange={(e) => setGeral({ ...geral, descricao: e.target.value })}
                  placeholder="Digite a descrição"
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Segmento</label>
                <select
                  value={geral.segmento}
                  onChange={(e) => setGeral({ ...geral, segmento: e.target.value })}
                >
                  <option value="">Selecione o segmento</option>
                  <option value="restaurante">Restaurante</option>
                  <option value="lanchonete">Lanchonete</option>
                  <option value="pizzaria">Pizzaria</option>
                  <option value="hamburgueria">Hamburgueria</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={geral.titulo}
                  onChange={(e) => setGeral({ ...geral, titulo: e.target.value })}
                  placeholder="Digite o título"
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select
                  value={geral.estado}
                  onChange={(e) => setGeral({ ...geral, estado: e.target.value })}
                >
                  <option value="">Selecione o estado</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>
              <div className="form-group">
                <label>Cidade</label>
                <input
                  type="text"
                  value={geral.cidade}
                  onChange={(e) => setGeral({ ...geral, cidade: e.target.value })}
                  placeholder="Digite a cidade"
                />
              </div>
              <div className="form-group full-width">
                <label>URL</label>
                <input
                  type="url"
                  value={geral.url}
                  onChange={(e) => setGeral({ ...geral, url: e.target.value })}
                  placeholder="https://exemplo.com"
                />
              </div>
            </div>
            <div className="section-actions">
              <button className="save-btn" onClick={handleSaveGeral} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        );

      case "aparencia":
        return (
          <div className="config-section">
            <h2>Aparência</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Foto de Perfil</label>
                <input
                  type="url"
                  value={aparencia.fotoPerfil}
                  onChange={(e) => setAparencia({ ...aparencia, fotoPerfil: e.target.value })}
                  placeholder="URL da foto de perfil"
                />
                {aparencia.fotoPerfil && (
                  <img src={aparencia.fotoPerfil} alt="Preview" className="image-preview" />
                )}
              </div>
              <div className="form-group">
                <label>Capa</label>
                <input
                  type="url"
                  value={aparencia.capa}
                  onChange={(e) => setAparencia({ ...aparencia, capa: e.target.value })}
                  placeholder="URL da capa"
                />
                {aparencia.capa && (
                  <img src={aparencia.capa} alt="Preview" className="image-preview" />
                )}
              </div>
              <div className="form-group">
                <label>Cor do Layout</label>
                <div className="color-input-wrapper">
                  <input
                    type="color"
                    value={aparencia.corLayout}
                    onChange={(e) => setAparencia({ ...aparencia, corLayout: e.target.value })}
                    className="color-input"
                  />
                  <input
                    type="text"
                    value={aparencia.corLayout}
                    onChange={(e) => setAparencia({ ...aparencia, corLayout: e.target.value })}
                    placeholder="#8B4513"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Exibição</label>
                <select
                  value={aparencia.exibicao}
                  onChange={(e) => setAparencia({ ...aparencia, exibicao: e.target.value })}
                >
                  <option value="grade">Grade</option>
                  <option value="lista">Lista</option>
                </select>
              </div>
            </div>
            <div className="section-actions">
              <button className="save-btn" onClick={handleSaveAparencia} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        );

      case "banners":
        return (
          <div className="config-section">
            <h2>Banners</h2>
            
            <div className="banners-section">
              <div className="banners-header">
                <h3>Gerenciar Banners</h3>
                <button className="add-btn" onClick={handleAddBanner}>
                  <HiPlus size={20} />
                  Adicionar Banner
                </button>
              </div>

              {banners.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhum banner cadastrado. Clique em "Adicionar Banner" para começar.</p>
                </div>
              ) : (
                <div className="banners-list">
                  {banners.map((banner) => (
                    <div key={banner.id} className="banner-item">
                      <div className="banner-info">
                        <div className="banner-header-info">
                          <h4>{banner.titulo}</h4>
                          <span className={`status-badge ${banner.visivel ? "visivel" : "oculto"}`}>
                            {banner.visivel ? "Visível" : "Oculto"}
                          </span>
                        </div>
                        <div className="banner-images-preview">
                          {banner.imagemDesktop && (
                            <div className="image-preview-item">
                              <p>Desktop:</p>
                              <img src={banner.imagemDesktop} alt="Desktop" className="banner-preview-img" />
                            </div>
                          )}
                          {banner.imagemMobile && (
                            <div className="image-preview-item">
                              <p>Mobile:</p>
                              <img src={banner.imagemMobile} alt="Mobile" className="banner-preview-img" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="banner-actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditBanner(banner)}
                        >
                          <HiPencil size={18} />
                          Editar
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteBanner(banner.id!)}
                        >
                          <HiTrash size={18} />
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showBannerModal && (
              <div className="modal-overlay" onClick={() => setShowBannerModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3>{editingBanner ? "Editar Banner" : "Adicionar Banner"}</h3>
                  <div className="form-group">
                    <label>Título</label>
                    <input
                      type="text"
                      value={bannerForm.titulo}
                      onChange={(e) => setBannerForm({ ...bannerForm, titulo: e.target.value })}
                      placeholder="Digite o título do banner"
                    />
                  </div>
                  <div className="form-group">
                    <label>Imagem para Computador</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDesktopFileChange}
                    />
                    {(desktopPreview || bannerForm.imagemDesktop) && (
                      <img
                        src={desktopPreview || bannerForm.imagemDesktop}
                        alt="Preview Desktop"
                        className="image-preview"
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label>Imagem para Celulares</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMobileFileChange}
                    />
                    {(mobilePreview || bannerForm.imagemMobile) && (
                      <img
                        src={mobilePreview || bannerForm.imagemMobile}
                        alt="Preview Mobile"
                        className="image-preview"
                      />
                    )}
                  </div>
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={bannerForm.visivel}
                        onChange={(e) => setBannerForm({ ...bannerForm, visivel: e.target.checked })}
                      />
                      <span>Visível</span>
                    </label>
                  </div>
                  <div className="modal-actions">
                    <button className="cancel-btn" onClick={() => setShowBannerModal(false)}>
                      Cancelar
                    </button>
                    <button className="save-btn" onClick={handleSaveBanner} disabled={uploading}>
                      {uploading ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "pagamento":
        return (
          <div className="config-section">
            <h2>Pagamento</h2>
            <div className="form-grid">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={pagamento.aceitaDinheiro}
                    onChange={(e) =>
                      setPagamento({ ...pagamento, aceitaDinheiro: e.target.checked })
                    }
                  />
                  <span>Aceita Dinheiro?</span>
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={pagamento.aceitaCredito}
                    onChange={(e) =>
                      setPagamento({ ...pagamento, aceitaCredito: e.target.checked })
                    }
                  />
                  <span>Cartão de Crédito?</span>
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={pagamento.aceitaDebito}
                    onChange={(e) =>
                      setPagamento({ ...pagamento, aceitaDebito: e.target.checked })
                    }
                  />
                  <span>Cartão de Débito?</span>
                </label>
              </div>
              {pagamento.aceitaCredito && (
                <div className="form-group full-width">
                  <label>Quais bandeiras</label>
                  <input
                    type="text"
                    value={pagamento.bandeiras}
                    onChange={(e) => setPagamento({ ...pagamento, bandeiras: e.target.value })}
                    placeholder="Visa, Mastercard, Elo, etc."
                  />
                </div>
              )}
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={pagamento.aceitaPix}
                    onChange={(e) => setPagamento({ ...pagamento, aceitaPix: e.target.checked })}
                  />
                  <span>Aceita PIX</span>
                </label>
              </div>
            </div>
            <div className="section-actions">
              <button className="save-btn" onClick={handleSavePagamento} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        );

      case "entrega":
        return (
          <div className="config-section">
            <h2>Entrega</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Tempo de Entrega</label>
                <input
                  type="text"
                  value={entrega.tempoEntrega}
                  onChange={(e) => setEntrega({ ...entrega, tempoEntrega: e.target.value })}
                  placeholder="Ex: 30-45 minutos"
                />
              </div>
            </div>

            <div className="bairros-section">
              <div className="bairros-header">
                <h3>Bairros / Preço</h3>
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
                        <button
                          className="edit-btn"
                          onClick={() => handleEditBairro(bairro)}
                        >
                          <HiPencil size={18} />
                          Editar
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteBairro(bairro.id)}
                        >
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
                      onChange={(e) =>
                        setBairroForm({ ...bairroForm, distancia: e.target.value })
                      }
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
                    <button className="save-btn" onClick={handleSaveBairro}>
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="section-actions">
              <button className="save-btn" onClick={handleSaveEntrega} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        );

      case "contato":
        return (
          <div className="config-section">
            <h2>Contato</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>WhatsApp</label>
                <input
                  type="text"
                  value={contato.whatsapp}
                  onChange={(e) => setContato({ ...contato, whatsapp: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  value={contato.email}
                  onChange={(e) => setContato({ ...contato, email: e.target.value })}
                  placeholder="contato@exemplo.com"
                />
              </div>
              <div className="form-group">
                <label>Instagram</label>
                <input
                  type="text"
                  value={contato.instagram}
                  onChange={(e) => setContato({ ...contato, instagram: e.target.value })}
                  placeholder="@usuario"
                />
              </div>
              <div className="form-group">
                <label>Facebook</label>
                <input
                  type="text"
                  value={contato.facebook}
                  onChange={(e) => setContato({ ...contato, facebook: e.target.value })}
                  placeholder="URL do Facebook"
                />
              </div>
              <div className="form-group">
                <label>TikTok</label>
                <input
                  type="text"
                  value={contato.tiktok}
                  onChange={(e) => setContato({ ...contato, tiktok: e.target.value })}
                  placeholder="@usuario"
                />
              </div>
              <div className="form-group">
                <label>Youtube</label>
                <input
                  type="text"
                  value={contato.youtube}
                  onChange={(e) => setContato({ ...contato, youtube: e.target.value })}
                  placeholder="URL do Youtube"
                />
              </div>
              <div className="form-group full-width">
                <label>Localização (Maps)</label>
                <input
                  type="text"
                  value={contato.localizacao}
                  onChange={(e) => setContato({ ...contato, localizacao: e.target.value })}
                  placeholder="Endereço ou link do Google Maps"
                />
              </div>
            </div>
            <div className="section-actions">
              <button className="save-btn" onClick={handleSaveContato} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        );

      case "usuario":
        return (
          <div className="config-section">
            <h2>Usuário</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome do Usuário</label>
                <input
                  type="text"
                  value={usuario.nomeUsuario}
                  onChange={(e) => setUsuario({ ...usuario, nomeUsuario: e.target.value })}
                  placeholder="Digite o nome"
                />
              </div>
              <div className="form-group">
                <label>Data de Nascimento</label>
                <input
                  type="date"
                  value={usuario.dataNascimento}
                  onChange={(e) => setUsuario({ ...usuario, dataNascimento: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>CPF/CNPJ</label>
                <select
                  value={usuario.tipoDocumento}
                  onChange={(e) => setUsuario({ ...usuario, tipoDocumento: e.target.value })}
                >
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                </select>
              </div>
              <div className="form-group">
                <label>Número do documento</label>
                <input
                  type="text"
                  value={usuario.numeroDocumento}
                  onChange={(e) => setUsuario({ ...usuario, numeroDocumento: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  value={usuario.email}
                  onChange={(e) => setUsuario({ ...usuario, email: e.target.value })}
                  placeholder="usuario@exemplo.com"
                />
              </div>
              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  value={usuario.senha}
                  onChange={(e) => setUsuario({ ...usuario, senha: e.target.value })}
                  placeholder="Digite a senha"
                />
              </div>
              <div className="form-group">
                <label>Confirmar Senha</label>
                <input
                  type="password"
                  value={usuario.confirmarSenha}
                  onChange={(e) => setUsuario({ ...usuario, confirmarSenha: e.target.value })}
                  placeholder="Confirme a senha"
                />
              </div>
            </div>
            <div className="section-actions">
              <button className="save-btn" onClick={handleSaveUsuario} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="configuracoes-content-wrapper">
          <div className="page-header">
            <h1>Configurações</h1>
            <p className="page-subtitle">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="configuracoes-content-wrapper">
        <div className="page-header">
          <h1>Configurações</h1>
          <p className="page-subtitle">Personalize seu restaurante</p>
        </div>

        <div className="configuracoes-container">
          <div className="config-sidebar">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  className={`sidebar-item ${activeSection === section.id ? "active" : ""}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon size={20} />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>

          <div className="config-content">{renderSection()}</div>
        </div>
      </div>
    </Layout>
  );
};

export default Configuracoes;
