import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  ShoppingCart, 
  Calendar,
  MapPin,
  TrendingUp,
  User,
  DollarSign
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Visitas = () => {
  const [visitas, setVisitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: '',
    valor_compra: '',
    loja: ''
  });

  const lojas = [
    'Mega Loja Jabaquara',
    'Indianópolis',
    'Mascote',
    'Tatuapé',
    'Praia Grande',
    'Osasco'
  ];

  // Simular dados para desenvolvimento
  useEffect(() => {
    setTimeout(() => {
      setClientes([
        { id: 1, nome: 'Maria Silva', cpf: '12345678901' },
        { id: 2, nome: 'João Santos', cpf: '98765432101' },
        { id: 3, nome: 'Ana Costa', cpf: '45678912301' }
      ]);

      setVisitas([
        {
          id: 1,
          cliente_id: 1,
          cliente: { nome: 'Maria Silva', cpf: '12345678901' },
          data_visita: '2024-12-28T14:30:00',
          valor_compra: 150.50,
          loja: 'Mega Loja Jabaquara'
        },
        {
          id: 2,
          cliente_id: 2,
          cliente: { nome: 'João Santos', cpf: '98765432101' },
          data_visita: '2024-12-28T10:15:00',
          valor_compra: 89.90,
          loja: 'Indianópolis'
        },
        {
          id: 3,
          cliente_id: 3,
          cliente: { nome: 'Ana Costa', cpf: '45678912301' },
          data_visita: '2024-12-27T16:45:00',
          valor_compra: 220.00,
          loja: 'Mascote'
        },
        {
          id: 4,
          cliente_id: 1,
          cliente: { nome: 'Maria Silva', cpf: '12345678901' },
          data_visita: '2024-12-26T11:20:00',
          valor_compra: 75.30,
          loja: 'Mega Loja Jabaquara'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredVisitas = visitas.filter(visita =>
    visita.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visita.cliente.cpf.includes(searchTerm) ||
    (visita.loja && visita.loja.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCPF = (cpf) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simular criação de visita
    const cliente = clientes.find(c => c.id === parseInt(formData.cliente_id));
    const novaVisita = {
      id: visitas.length + 1,
      cliente_id: parseInt(formData.cliente_id),
      cliente: cliente,
      data_visita: new Date().toISOString(),
      valor_compra: parseFloat(formData.valor_compra),
      loja: formData.loja
    };

    setVisitas([novaVisita, ...visitas]);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      cliente_id: '',
      valor_compra: '',
      loja: ''
    });
  };

  // Calcular estatísticas
  const totalVisitas = visitas.length;
  const valorTotal = visitas.reduce((sum, visita) => sum + visita.valor_compra, 0);
  const valorMedio = totalVisitas > 0 ? valorTotal / totalVisitas : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Visitas</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Visitas</h1>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Visita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Registrar Nova Visita</DialogTitle>
              <DialogDescription>
                Registre uma nova compra do cliente para acumular pontos
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <Select
                  value={formData.cliente_id}
                  onValueChange={(value) => setFormData({...formData, cliente_id: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id.toString()}>
                        {cliente.nome} - {formatCPF(cliente.cpf)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valor_compra">Valor da Compra *</Label>
                <Input
                  id="valor_compra"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_compra}
                  onChange={(e) => setFormData({...formData, valor_compra: e.target.value})}
                  placeholder="0,00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="loja">Loja</Label>
                <Select
                  value={formData.loja}
                  onValueChange={(value) => setFormData({...formData, loja: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent>
                    {lojas.map((loja) => (
                      <SelectItem key={loja} value={loja}>
                        {loja}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Registrar Visita
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Visitas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalVisitas}</div>
            <p className="text-xs text-gray-600 mt-1">Visitas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(valorTotal)}</div>
            <p className="text-xs text-gray-600 mt-1">Em compras registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Valor Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(valorMedio)}</div>
            <p className="text-xs text-gray-600 mt-1">Por visita</p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de pesquisa */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por cliente, CPF ou loja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de visitas */}
      <div className="grid gap-4">
        {filteredVisitas.map((visita) => (
          <Card key={visita.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatCurrency(visita.valor_compra)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(visita.data_visita)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <User className="mr-2 h-4 w-4" />
                      <div>
                        <div className="font-medium">{visita.cliente.nome}</div>
                        <div className="text-xs text-gray-500">
                          CPF: {formatCPF(visita.cliente.cpf)}
                        </div>
                      </div>
                    </div>
                    
                    {visita.loja && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="mr-2 h-4 w-4" />
                        {visita.loja}
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Badge variant="outline" className="text-green-700 border-green-200">
                        +{Math.floor(visita.valor_compra)} pontos
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVisitas.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhuma visita encontrada
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Tente ajustar os termos de busca'
                : 'Comece registrando a primeira visita'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Visitas;

