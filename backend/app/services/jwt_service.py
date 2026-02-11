from datetime import datetime, timedelta, timezone
from jose import jwt

SECRET_KEY = "ODONTOEDU_SALESIANA_SECRETO"
ALGORITHM = "HS256"

def crear_token(data: dict):
    to_encode = data.copy()

    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])

    expire = datetime.now(timezone.utc) + timedelta(hours=8)

    # ✅ exp como timestamp (int)
    to_encode.update({
        "exp": int(expire.timestamp()),
        "iat": int(datetime.now(timezone.utc).timestamp())
    })

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verificar_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
