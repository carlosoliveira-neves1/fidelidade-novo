const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

// Função para obter o token de autenticação
const getAuthToken = () => {
  return localStorage.getItem('token');
};

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Adicionar token de autenticação se disponível
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Se o token expirou, redirecionar para login
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Métodos para Autenticação
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getUsuarios() {
    return this.request('/auth/usuarios');
  }

  async createUsuario(data) {
    return this.request('/auth/usuarios', {
      method: 'POST',
      body: data,
    });
  }

  async updateUsuario(id, data) {
    return this.request(`/auth/usuarios/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteUsuario(id) {
    return this.request(`/auth/usuarios/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para Clientes
  async getClientes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/clientes${queryString ? `?${queryString}` : ''}`);
  }

  async getCliente(id) {
    return this.request(`/clientes/${id}`);
  }

  async createCliente(data) {
    return this.request('/clientes', {
      method: 'POST',
      body: data,
    });
  }

  async updateCliente(id, data) {
    return this.request(`/clientes/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteCliente(id) {
    return this.request(`/clientes/${id}`, {
      method: 'DELETE',
    });
  }

  async buscarClientePorCpf(cpf) {
    return this.request(`/clientes/buscar-cpf/${cpf}`);
  }

  // Métodos para Visitas
  async getVisitas(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/visitas${queryString ? `?${queryString}` : ''}`);
  }

  async getVisitasCliente(clienteId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/visitas/cliente/${clienteId}${queryString ? `?${queryString}` : ''}`);
  }

  async createVisita(data) {
    return this.request('/visitas', {
      method: 'POST',
      body: data,
    });
  }

  async updateVisita(id, data) {
    return this.request(`/visitas/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteVisita(id) {
    return this.request(`/visitas/${id}`, {
      method: 'DELETE',
    });
  }

  async getPontosCliente(clienteId) {
    return this.request(`/pontos/cliente/${clienteId}`);
  }

  // Métodos para Campanhas
  async getCampanhas(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/campanhas${queryString ? `?${queryString}` : ''}`);
  }

  async getCampanha(id) {
    return this.request(`/campanhas/${id}`);
  }

  async createCampanha(data) {
    return this.request('/campanhas', {
      method: 'POST',
      body: data,
    });
  }

  async updateCampanha(id, data) {
    return this.request(`/campanhas/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteCampanha(id) {
    return this.request(`/campanhas/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para Produtos
  async getProdutos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/produtos${queryString ? `?${queryString}` : ''}`);
  }

  async createProduto(data) {
    return this.request('/produtos', {
      method: 'POST',
      body: data,
    });
  }

  // Métodos para Brindes
  async getBrindes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/brindes${queryString ? `?${queryString}` : ''}`);
  }

  async createBrinde(data) {
    return this.request('/brindes', {
      method: 'POST',
      body: data,
    });
  }

  async updateBrinde(id, data) {
    return this.request(`/brindes/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteBrinde(id) {
    return this.request(`/brindes/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para Resgates
  async getResgates(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/resgates${queryString ? `?${queryString}` : ''}`);
  }

  async getResgatesCliente(clienteId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/resgates/cliente/${clienteId}${queryString ? `?${queryString}` : ''}`);
  }

  async createResgate(data) {
    return this.request('/resgates', {
      method: 'POST',
      body: data,
    });
  }

  async entregarBrinde(resgateId) {
    return this.request(`/resgates/${resgateId}/entregar`, {
      method: 'PUT',
    });
  }

  async cancelarResgate(resgateId) {
    return this.request(`/resgates/${resgateId}/cancelar`, {
      method: 'PUT',
    });
  }

  async verificarElegibilidade(data) {
    return this.request('/resgates/verificar-elegibilidade', {
      method: 'POST',
      body: data,
    });
  }

  async getBrindesDisponiveis(clienteId) {
    return this.request(`/resgates/brindes-disponiveis/${clienteId}`);
  }

  async buscarPorVoucher(voucher) {
    return this.request(`/resgates/voucher/${voucher}`);
  }

  // Métodos para Dashboard
  async getDashboardResumo() {
    return this.request('/dashboard/resumo');
  }

  async getTopClientes() {
    return this.request('/dashboard/top-clientes');
  }

  async getVisitasPorPeriodo(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/dashboard/visitas-periodo${queryString ? `?${queryString}` : ''}`);
  }

  async getDistribuicaoNiveis() {
    return this.request('/dashboard/distribuicao-niveis');
  }

  async getResgatesPorStatus() {
    return this.request('/dashboard/resgates-status');
  }

  // Métodos para Relatórios
  async getRelatorioClientesDetalhado(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/relatorios/clientes-detalhado${queryString ? `?${queryString}` : ''}`);
  }

  async getRelatorioCampanhasPerformance() {
    return this.request('/relatorios/campanhas-performance');
  }

  async getRelatorioVisitas(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/relatorio/visitas${queryString ? `?${queryString}` : ''}`);
  }
}

export default new ApiService();

