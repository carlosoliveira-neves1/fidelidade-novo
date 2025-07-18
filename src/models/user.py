from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class TipoUsuarioEnum(Enum):
    ADMIN = "Administrador"
    OPERADOR = "Operador"
    VISUALIZADOR = "Visualizador"

# Modelo de usuário para autenticação (tabela usuarios)
class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String(50), unique=True, nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    senha_hash = db.Column(db.String(255), nullable=False)
    tipo = db.Column(db.String(20), default='Operador')
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    ultimo_login = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f'<Usuario {self.login}>'

    def set_password(self, password):
        self.senha_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.senha_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'login': self.login,
            'nome': self.nome,
            'email': self.email,
            'tipo': self.tipo,
            'ativo': self.ativo,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'ultimo_login': self.ultimo_login.isoformat() if self.ultimo_login else None
        }

# Modelo de clientes (tabela clientes)
class Cliente(db.Model):
    __tablename__ = 'clientes'
    
    id = db.Column(db.Integer, primary_key=True)
    cpf = db.Column(db.String(11), unique=True, nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    telefone = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(120), nullable=True)
    sem_email = db.Column(db.Boolean, default=False)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    visitas = db.relationship('Visita', backref='cliente', lazy=True)
    pontos = db.relationship('Ponto', backref='cliente', lazy=True)
    resgates = db.relationship('Resgate', backref='cliente', lazy=True)

    def __repr__(self):
        return f'<Cliente {self.nome}>'

    def to_dict(self):
        total_pontos = sum([p.pontos_acumulados for p in self.pontos])
        return {
            'id': self.id,
            'cpf': self.cpf,
            'nome': self.nome,
            'telefone': self.telefone,
            'email': self.email,
            'sem_email': self.sem_email,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'total_visitas': len(self.visitas),
            'pontos_totais': total_pontos,
            'nivel_atual': self.get_nivel(total_pontos)
        }

    def get_nivel(self, pontos):
        if pontos >= 1000:
            return "Ouro"
        elif pontos >= 500:
            return "Prata"
        else:
            return "Bronze"

# Modelo de visitas (tabela visitas)
class Visita(db.Model):
    __tablename__ = 'visitas'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    data_visita = db.Column(db.DateTime, default=datetime.utcnow)
    valor_compra = db.Column(db.Numeric(10, 2), nullable=False)
    loja = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return f'<Visita {self.id} - Cliente {self.cliente_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'cliente_nome': self.cliente.nome if self.cliente else None,
            'data_visita': self.data_visita.isoformat() if self.data_visita else None,
            'valor_compra': float(self.valor_compra),
            'loja': self.loja,
            'pontos_gerados': int(float(self.valor_compra))
        }

# Modelo de pontos (tabela pontos)
class Ponto(db.Model):
    __tablename__ = 'pontos'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    pontos_acumulados = db.Column(db.Integer, nullable=False)
    nivel_atual = db.Column(db.String(20), nullable=False)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Ponto {self.cliente_id} - {self.pontos_acumulados}>'

    def to_dict(self):
        return {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'pontos_acumulados': self.pontos_acumulados,
            'nivel_atual': self.nivel_atual,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

# Modelo de campanhas (tabela campanhas)
class Campanha(db.Model):
    __tablename__ = 'campanhas'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    loja = db.Column(db.String(50), nullable=False)
    data_inicio = db.Column(db.DateTime, nullable=False)
    data_fim = db.Column(db.DateTime, nullable=False)
    ativa = db.Column(db.Boolean, default=True)
    threshold_visitas = db.Column(db.Integer, nullable=False)
    fator_pontuacao = db.Column(db.Numeric(3, 2), nullable=False)

    # Relacionamentos
    brindes = db.relationship('Brinde', backref='campanha', lazy=True)

    def __repr__(self):
        return f'<Campanha {self.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'loja': self.loja,
            'data_inicio': self.data_inicio.isoformat() if self.data_inicio else None,
            'data_fim': self.data_fim.isoformat() if self.data_fim else None,
            'ativa': self.ativa,
            'threshold_visitas': self.threshold_visitas,
            'fator_pontuacao': float(self.fator_pontuacao)
        }

# Modelo de brindes (tabela brindes)
class Brinde(db.Model):
    __tablename__ = 'brindes'
    
    id = db.Column(db.Integer, primary_key=True)
    produto_id = db.Column(db.Integer, db.ForeignKey('produtos.id'), nullable=False)
    campanha_id = db.Column(db.Integer, db.ForeignKey('campanhas.id'), nullable=False)
    nivel = db.Column(db.String(20), nullable=False)
    quantidade_disponivel = db.Column(db.Integer, nullable=False)

    # Relacionamentos
    resgates = db.relationship('Resgate', backref='brinde', lazy=True)

    def __repr__(self):
        return f'<Brinde {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'produto_id': self.produto_id,
            'produto_nome': self.produto.nome if self.produto else None,
            'campanha_id': self.campanha_id,
            'campanha_nome': self.campanha.nome if self.campanha else None,
            'nivel': self.nivel,
            'quantidade_disponivel': self.quantidade_disponivel
        }

# Modelo de produtos (tabela produtos)
class Produto(db.Model):
    __tablename__ = 'produtos'
    
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(50), unique=True, nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text, nullable=True)
    url_imagem = db.Column(db.String(255), nullable=True)

    # Relacionamentos
    brindes = db.relationship('Brinde', backref='produto', lazy=True)

    def __repr__(self):
        return f'<Produto {self.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'sku': self.sku,
            'nome': self.nome,
            'descricao': self.descricao,
            'url_imagem': self.url_imagem
        }

# Modelo de resgates (tabela resgates)
class Resgate(db.Model):
    __tablename__ = 'resgates'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    brinde_id = db.Column(db.Integer, db.ForeignKey('brindes.id'), nullable=False)
    data_resgate = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='Pendente')
    voucher_codigo = db.Column(db.String(50), unique=True, nullable=False)
    data_entrega = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f'<Resgate {self.voucher_codigo}>'

    def to_dict(self):
        return {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'cliente_nome': self.cliente.nome if self.cliente else None,
            'brinde_id': self.brinde_id,
            'produto_nome': self.brinde.produto.nome if self.brinde and self.brinde.produto else None,
            'data_resgate': self.data_resgate.isoformat() if self.data_resgate else None,
            'status': self.status,
            'voucher_codigo': self.voucher_codigo,
            'data_entrega': self.data_entrega.isoformat() if self.data_entrega else None
        }

# Tabela user (parece ser uma tabela adicional no diagrama)
class User(db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }

