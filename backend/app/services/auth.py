#autenticacion
from passlib.context import CryptContext
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(p):
    return pwd.hash(p)

def get_password_hash(password: str):
    return pwd.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd.verify(plain_password, hashed_password)