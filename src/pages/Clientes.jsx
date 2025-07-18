import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  Calendar,
  Award,
  ShoppingCart,
  Users
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    sem_email: false
  });
  const { toast } = useToast();

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getClientes();
      setClientes(response.clientes || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes: " + error.message,
        variant: "destructive",
      });
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cpf.includes(searchTerm.replace(/\D/g, ''))
  );

  const getNivelByPontos = (pontos) => {
    if (pontos >= 1000) return { nivel: 'Ouro', color: 'bg-yellow-100 text-yellow-800' };
    if (pontos >= 500) return { nivel: 'Prata', color: 'bg-gray-100 text-gray-800' };
    return { nivel: 'Bronze', color: 'bg-orange-100 text-orange-800' };
  };

  const formatCPF = (cpf) => {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''), // Remove formatação do CPF
        email: formData.sem_email ? null : formData.email
      };

      if (selectedCliente) {
        await ApiService.updateCliente(selectedCliente.id, dataToSubmit);
        toast({
          title: "Sucesso",
          description: "Cliente atualizado com sucesso!",
        });
      } else {
        await ApiService.createCliente(dataToSubmit);
        toast({
          title: "Sucesso",
          description: "Cliente cadastrado com sucesso!",
        });
      }

      setShowModal(false);
      resetForm();
      loadClientes();
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      sem_email: false
    });
    setSelectedCliente(null);
  };

  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    setFormData({
      nome: cliente.nome,
      cpf: formatCPF(cliente.cpf),
      telefone: cliente.telefone,
      email: cliente.email || '',
      sem_email: cliente.sem_email
    });
    setShowModal(true);
  };

  const handleDelete = async (cliente) => {
    if (confirm(`Tem certeza que deseja excluir o cliente ${cliente.nome}?`)) {
      try {
        await ApiService.deleteCliente(cliente.id);
        toast({
          title: "Sucesso",
          description: "Cliente excluído com sucesso!",
        });
        loadClientes();
      } catch (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
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
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
              <DialogDescription>
                {selectedCliente 
                  ? 'Atualize as informações do cliente'
                  : 'Preencha os dados para cadastrar um novo cliente'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    const formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                    setFormData({...formData, cpf: formatted});
                  }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={formData.sem_email}
                  placeholder="cliente@email.com"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sem_email"
                  checked={formData.sem_email}
                  onCheckedChange={(checked) => setFormData({
                    ...formData, 
                    sem_email: checked,
                    email: checked ? '' : formData.email
                  })}
                />
                <Label htmlFor="sem_email">Cliente não possui e-mail</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Salvando...' : (selectedCliente ? 'Atualizar' : 'Cadastrar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra de pesquisa */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <div className="grid gap-4">
        {filteredClientes.map((cliente) => {
          const nivelInfo = getNivelByPontos(cliente.pontos_totais || 0);
          
          return (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {cliente.nome}
                        </h3>
                        <p className="text-sm text-gray-500">
                          CPF: {formatCPF(cliente.cpf)}
                        </p>
                      </div>
                      <Badge className={nivelInfo.color}>
                        {nivelInfo.nivel}
                      </Badge>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Phone className="mr-2 h-4 w-4" />
                        {cliente.telefone}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail className="mr-2 h-4 w-4" />
                        {cliente.sem_email ? 'Sem e-mail' : cliente.email}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {cliente.total_visitas || 0} visitas
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Award className="mr-2 h-4 w-4" />
                        {cliente.pontos_totais || 0} pontos
                      </div>
                    </div>
                    
                    {cliente.data_cadastro && (
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Calendar className="mr-1 h-3 w-3" />
                        Cadastrado em {formatDate(cliente.data_cadastro)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(cliente)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(cliente)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredClientes.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhum cliente encontrado
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Tente ajustar os termos de busca'
                : 'Comece cadastrando o primeiro cliente'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Clientes;

