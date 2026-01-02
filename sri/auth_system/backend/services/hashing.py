from passlib.hash import bcrypt

MAX_BCRYPT_LEN = 72


def _safe_truncate(password: str) -> str:
    """
    bcrypt only supports 72 bytes. Anything longer crashes or produces
    invalid hashes. We truncate before hashing & verification so behavior
    is consistent across create-user, login, and reset-password.
    """
    if password is None:
        raise ValueError("Password cannot be empty")

    password = password.strip()

    encoded = password.encode("utf-8")

    if len(encoded) > MAX_BCRYPT_LEN:
        encoded = encoded[:MAX_BCRYPT_LEN]

    return encoded.decode("utf-8", errors="ignore")


def hash_password(password: str) -> str:
    password = _safe_truncate(password)
    return bcrypt.using(rounds=12).hash(password)


def verify_password(password: str, stored_hash: str) -> bool:
    password = _safe_truncate(password)
    return bcrypt.verify(password, stored_hash)
