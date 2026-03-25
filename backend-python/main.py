"""
Igreja Connect API - Python FastAPI
Backend moderno e gratuito para Render/Railway
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import mysql.connector
from mysql.connector import pooling
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

# Configuração do banco
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'igreja_connect'),
    'port': int(os.getenv('DB_PORT', 3306)),
}

# Pool de conexões
connection_pool = pooling.MySQLConnectionPool(
    pool_name="igreja_pool",
    pool_size=10,
    **db_config
)

def get_db_connection():
    return connection_pool.get_connection()

# App FastAPI
app = FastAPI(
    title="Igreja Connect API",
    description="API para gestão de igrejas",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models Pydantic
class ChurchCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    address: Optional[dict] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None
    theme_primary_color: Optional[str] = "#1e40af"
    theme_secondary_color: Optional[str] = "#f59e0b"
    admin: dict

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str
    church_id: Optional[int] = None

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

# Rotas
@app.get("/")
def root():
    return {
        "status": "OK",
        "message": "Igreja Connect API - Python FastAPI",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "uptime": "running"}

@app.get("/api/church")
def list_churches():
    """Listar todas as igrejas ativas"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM churches WHERE is_active = 1 ORDER BY name")
        churches = cursor.fetchall()
        cursor.close()
        conn.close()
        return {"success": True, "data": churches}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/church/{slug}")
def get_church(slug: str):
    """Buscar igreja por slug"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM churches WHERE slug = %s AND is_active = 1 LIMIT 1",
            (slug,)
        )
        church = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not church:
            raise HTTPException(status_code=404, detail="Church not found")
        
        return {"success": True, "data": church}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/church", status_code=status.HTTP_201_CREATED)
def create_church(church: ChurchCreate):
    """Criar nova igreja"""
    try:
        # Validações
        errors = []
        if len(church.name) < 5:
            errors.append("Nome deve ter pelo menos 5 caracteres")
        if len(church.slug) < 3:
            errors.append("Subdomínio deve ter pelo menos 3 caracteres")
        if not church.slug.replace('-', '').isalnum():
            errors.append("Subdomínio inválido")
        if len(church.admin.get('password', '')) < 6:
            errors.append("Senha deve ter 6+ caracteres")
        if church.admin.get('password') != church.admin.get('confirmPassword'):
            errors.append("Senhas não conferem")
        
        if errors:
            raise HTTPException(status_code=400, detail={"errors": errors})
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar slug duplicado
        cursor.execute("SELECT id FROM churches WHERE slug = %s LIMIT 1", (church.slug,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            raise HTTPException(status_code=409, detail="Subdomínio já em uso")
        
        # Inserir igreja
        cursor.execute("""
            INSERT INTO churches (
                name, slug, description, email, phone, whatsapp,
                address_street, address_number, address_complement,
                address_neighborhood, address_city, address_state, address_zip,
                facebook_url, instagram_url, youtube_url,
                theme_primary_color, theme_secondary_color,
                plan_type, is_active, is_verified, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'free', 1, 0, NOW())
        """, (
            church.name, church.slug, church.description, church.email,
            church.phone, church.whatsapp,
            church.address.get('street') if church.address else None,
            church.address.get('number') if church.address else None,
            church.address.get('complement') if church.address else None,
            church.address.get('neighborhood') if church.address else None,
            church.address.get('city') if church.address else None,
            church.address.get('state') if church.address else None,
            church.address.get('zip') if church.address else None,
            church.facebook_url, church.instagram_url, church.youtube_url,
            church.theme_primary_color, church.theme_secondary_color
        ))
        
        church_id = cursor.lastrowid
        
        # Inserir administrador
        hashed = bcrypt.hashpw(church.admin['password'].encode(), bcrypt.gensalt())
        cursor.execute("""
            INSERT INTO usuarios_admin (church_id, name, email, password, role, is_active, created_at)
            VALUES (%s, %s, %s, %s, 'admin', 1, NOW())
        """, (church_id, church.admin['name'], church.admin['email'], hashed.decode()))
        
        # Inserir assinatura
        cursor.execute("""
            INSERT INTO subscriptions (church_id, plan_type, status, current_period_start, current_period_end, trial_end_date, created_at)
            VALUES (%s, 'free', 'trial', DATE(NOW()), DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), NOW())
        """, (church_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "success": True,
            "message": "Igreja criada com sucesso!",
            "data": {
                "church_id": church_id,
                "slug": church.slug,
                "url": f"https://{church.slug}.ccjv.com.br",
                "admin_url": f"https://{church.slug}.ccjv.com.br/login",
                "trial_days": 30
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/contact", status_code=status.HTTP_201_CREATED)
def send_contact(message: ContactMessage):
    """Enviar mensagem de contato"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO contact_messages (church_id, name, email, phone, message, created_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
        """, (message.church_id, message.name, message.email, message.phone, message.message))
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"success": True, "message": "Mensagem enviada com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login")
def login(credentials: AdminLogin):
    """Login de administrador"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM usuarios_admin WHERE email = %s AND is_active = 1 LIMIT 1",
            (credentials.email,)
        )
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            conn.close()
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
        
        # Verificar senha
        if not bcrypt.checkpw(credentials.password.encode(), user['password'].encode()):
            cursor.close()
            conn.close()
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
        
        cursor.close()
        conn.close()
        
        # Token simples (em produção use JWT)
        import base64
        import json
        token_data = {
            "id": user['id'],
            "email": user['email'],
            "church_id": user['church_id'],
            "role": user['role']
        }
        token = base64.b64encode(json.dumps(token_data).encode()).decode()
        
        return {
            "success": True,
            "message": "Login realizado com sucesso!",
            "data": {
                "user": {
                    "id": user['id'],
                    "name": user['name'],
                    "email": user['email'],
                    "role": user['role'],
                    "church_id": user['church_id']
                },
                "token": token
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv('PORT', 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
