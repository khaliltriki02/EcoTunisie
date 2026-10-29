import sqlite3
from functools import wraps
from flask import current_app, jsonify, session
def database():
    # SQLite est réservé aux comptes ; les données touristiques restent dans Fuseki.
    connection = sqlite3.connect(current_app.config["DATABASE"]); connection.row_factory = sqlite3.Row
    connection.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, person_id TEXT UNIQUE)")
    columns = {row[1] for row in connection.execute("PRAGMA table_info(users)")}
    if "person_id" not in columns:
        # SQLite ne permet pas d'ajouter une contrainte UNIQUE via ALTER TABLE.
        connection.execute("ALTER TABLE users ADD COLUMN person_id TEXT")
        connection.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_person_id ON users(person_id)")
        connection.commit()
    else:
        connection.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_person_id ON users(person_id)")
        connection.commit()
    return connection
def login_required(fn):
    # Protège les écritures RDF (POST, PUT, DELETE) par une session Flask.
    @wraps(fn)
    def wrapped(*args, **kwargs):
        if "user_id" not in session: return jsonify(error="Authentification requise"), 401
        return fn(*args, **kwargs)
    return wrapped
