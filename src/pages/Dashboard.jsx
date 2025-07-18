import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, Gift, TrendingUp, Calendar, Award } from 'lucide-react';
import ApiService from '@/services/api';

const Dashboard = () => {
  const [resumo, setResumo] = useState(null);
  const [topClientes, setTopClientes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tentar carregar dados reais da API
      try {
        const [resumoData, topClientesData] = await Promise.all([
          ApiService.getDashboardResumo(),
          ApiService.getTopClientes()
        ]);
        
        setResumo(resumoData);
        setTopClientes(topClientesData);
      } catch (apiError) {
        console.warn('API não disponível, usando dados simulados:', apiError);
        
        // Fallback para dados simulados se a API não estiver disponível
        setResumo({
          estatisticas_gerais: {
            total_clientes: 0,
            total_visitas: 0,
            total_resgates: 0,
            campanhas_ativas: 0
          },
          estatisticas_mes: {
            visitas_mes: 0,
            novos_clientes_mes: 0,
            resgates_mes: 0,
            valor_total_mes: 0
          }
        });

        setTopClientes({
          top_pontos: [],
          top_visitas: []
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tentar novamente
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, description, trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {description && (
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Clientes"
          value={resumo?.estatisticas_gerais.total_clientes?.toLocaleString('pt-BR') || '0'}
          icon={Users}
          description={`+${resumo?.estatisticas_mes.novos_clientes_mes || 0} este mês`}
        />
        <StatCard
          title="Total de Visitas"
          value={resumo?.estatisticas_gerais.total_visitas?.toLocaleString('pt-BR') || '0'}
          icon={ShoppingCart}
          description={`${resumo?.estatisticas_mes.visitas_mes || 0} este mês`}
        />
        <StatCard
          title="Resgates Realizados"
          value={resumo?.estatisticas_gerais.total_resgates?.toLocaleString('pt-BR') || '0'}
          icon={Gift}
          description={`${resumo?.estatisticas_mes.resgates_mes || 0} este mês`}
        />
        <StatCard
          title="Campanhas Ativas"
          value={resumo?.estatisticas_gerais.campanhas_ativas || '0'}
          icon={Calendar}
          description="Campanhas em andamento"
        />
      </div>

      {/* Estatísticas do Mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Desempenho do Mês
          </CardTitle>
          <CardDescription>
            Resumo das atividades do mês atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {resumo?.estatisticas_mes.visitas_mes || 0}
              </div>
              <div className="text-sm text-gray-600">Visitas este mês</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                R$ {(resumo?.estatisticas_mes.valor_total_mes || 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2
                })}
              </div>
              <div className="text-sm text-gray-600">Valor total em compras</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {resumo?.estatisticas_mes.resgates_mes || 0}
              </div>
              <div className="text-sm text-gray-600">Brindes resgatados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Top Clientes por Pontos
            </CardTitle>
            <CardDescription>
              Clientes com maior pontuação acumulada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClientes?.top_pontos?.length > 0 ? (
                topClientes.top_pontos.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{item.cliente.nome}</div>
                        <div className="text-sm text-gray-500">CPF: {item.cliente.cpf}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{item.pontos}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        item.nivel === 'Ouro' ? 'bg-yellow-100 text-yellow-800' :
                        item.nivel === 'Prata' ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {item.nivel}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum cliente com pontos registrado
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Top Clientes por Visitas
            </CardTitle>
            <CardDescription>
              Clientes mais frequentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClientes?.top_visitas?.length > 0 ? (
                topClientes.top_visitas.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{item.cliente.nome}</div>
                        <div className="text-sm text-gray-500">CPF: {item.cliente.cpf}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{item.total_visitas}</div>
                      <div className="text-xs text-gray-500">visitas</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma visita registrada
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

