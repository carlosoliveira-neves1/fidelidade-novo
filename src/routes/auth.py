from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from src.models.user import db, Usuario

auth_bp = Blueprint('auth', __name__)

def is_admin(usuario):
    """Verifica se o usuário é administrador"""
    return usuario and usuario.tipo in ['Administrador', 'ADMIN']

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        login = data.get('login')
        senha = data.get('senha')

        if not login or not senha:
            return jsonify({'error': 'Login e senha são obrigatórios'}), 400

        usuario = Usuario.query.filter_by(login=login, ativo=True).first()
        
        if not usuario or not usuario.check_password(senha):
            return jsonify({'error': 'Credenciais inválidas'}), 401

        # Atualizar último login
        usuario.ultimo_login = datetime.utcnow()
        db.session.commit()

        # Criar token JWT
        access_token = create_access_token(
            identity=usuario.id,
            expires_delta=timedelta(hours=8)
        )

        return jsonify({
            'access_token': access_token,
            'usuario': usuario.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        usuario = Usuario.query.get(user_id)
        
        if not usuario or not usuario.ativo:
            return jsonify({'error': 'Usuário não encontrado'}), 404

        return jsonify(usuario.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # Com JWT, o logout é feito no frontend removendo o token
    return jsonify({'message': 'Logout realizado com sucesso'}), 200

@auth_bp.route('/usuarios', methods=['GET'])
@jwt_required()
def listar_usuarios():
    try:
        user_id = get_jwt_identity()
        usuario_atual = Usuario.query.get(user_id)
        
        if not is_admin(usuario_atual):
            return jsonify({'error': 'Acesso negado'}), 403

        usuarios = Usuario.query.all()
        return jsonify([u.to_dict() for u in usuarios]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/usuarios', methods=['POST'])
@jwt_required()
def criar_usuario():
    try:
        user_id = get_jwt_identity()
        usuario_atual = Usuario.query.get(user_id)
        
        if not is_admin(usuario_atual):
            return jsonify({'error': 'Acesso negado'}), 403

        data = request.get_json()
        login = data.get('login')
        nome = data.get('nome')
        email = data.get('email')
        senha = data.get('senha')
        tipo = data.get('tipo', 'Operador')

        if not login or not nome or not senha:
            return jsonify({'error': 'Login, nome e senha são obrigatórios'}), 400

        # Verificar se login já existe
        if Usuario.query.filter_by(login=login).first():
            return jsonify({'error': 'Login já existe'}), 400

        # Verificar se email já existe (se fornecido)
        if email and Usuario.query.filter_by(email=email).first():
            return jsonify({'error': 'Email já existe'}), 400

        # Criar novo usuário
        novo_usuario = Usuario(
            login=login,
            nome=nome,
            email=email,
            tipo=tipo
        )
        novo_usuario.set_password(senha)

        db.session.add(novo_usuario)
        db.session.commit()

        return jsonify(novo_usuario.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/usuarios/<int:usuario_id>', methods=['PUT'])
@jwt_required()
def atualizar_usuario(usuario_id):
    try:
        user_id = get_jwt_identity()
        usuario_atual = Usuario.query.get(user_id)
        
        if not is_admin(usuario_atual):
            return jsonify({'error': 'Acesso negado'}), 403

        usuario = Usuario.query.get(usuario_id)
        if not usuario:
            return jsonify({'error': 'Usuário não encontrado'}), 404

        data = request.get_json()
        
        if 'nome' in data:
            usuario.nome = data['nome']
        if 'email' in data:
            # Verificar se email já existe em outro usuário
            if data['email'] and Usuario.query.filter(Usuario.email == data['email'], Usuario.id != usuario_id).first():
                return jsonify({'error': 'Email já existe'}), 400
            usuario.email = data['email']
        if 'tipo' in data:
            usuario.tipo = data['tipo']
        if 'ativo' in data:
            usuario.ativo = data['ativo']
        if 'senha' in data and data['senha']:
            usuario.set_password(data['senha'])

        db.session.commit()
        return jsonify(usuario.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/usuarios/<int:usuario_id>', methods=['DELETE'])
@jwt_required()
def deletar_usuario(usuario_id):
    try:
        user_id = get_jwt_identity()
        usuario_atual = Usuario.query.get(user_id)
        
        if not is_admin(usuario_atual):
            return jsonify({'error': 'Acesso negado'}), 403

        if usuario_id == user_id:
            return jsonify({'error': 'Não é possível deletar seu próprio usuário'}), 400

        usuario = Usuario.query.get(usuario_id)
        if not usuario:
            return jsonify({'error': 'Usuário não encontrado'}), 404

        db.session.delete(usuario)
        db.session.commit()

        return jsonify({'message': 'Usuário deletado com sucesso'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

