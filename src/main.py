import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from src.models.user import db, Usuario, TipoUsuarioEnum
from src.routes.user import user_bp
from src.routes.cliente import cliente_bp
from src.routes.visita import visita_bp
from src.routes.campanha import campanha_bp
from src.routes.resgate import resgate_bp
from src.routes.dashboard import dashboard_bp
from src.routes.auth import auth_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string-change-in-production'

# Configurar CORS para permitir comunicação com o frontend
CORS(app)

# Configurar JWT
jwt = JWTManager(app)

# Registrar blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(cliente_bp, url_prefix='/api')
app.register_blueprint(visita_bp, url_prefix='/api')
app.register_blueprint(campanha_bp, url_prefix='/api')
app.register_blueprint(resgate_bp, url_prefix='/api')
app.register_blueprint(dashboard_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Configurar banco de dados PostgreSQL
DATABASE_URL = "postgresql://postgres:190702Carlos*@fidelidade.chkyii4u8guo.sa-east-1.rds.amazonaws.com:5432/postgres"
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def create_admin_user():
    """Criar usuário administrador padrão se não existir"""
    admin = Usuario.query.filter_by(login='Admin').first()
    if not admin:
        admin = Usuario(
            login='Admin',
            nome='Administrador do Sistema',
            email='admin@megaloja.com',
            tipo='ADMIN'  # Usando valor do enum
        )
        admin.set_password('Mudar@1234')
        db.session.add(admin)
        db.session.commit()
        print("Usuário administrador criado: Login=Admin, Senha=Mudar@1234")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
            create_admin_user()
            print("Conectado ao banco PostgreSQL com sucesso!")
        except Exception as e:
            print(f"Erro ao conectar com o banco: {e}")
    
    app.run(host='0.0.0.0', port=5000, debug=True)

