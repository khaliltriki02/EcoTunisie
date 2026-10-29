import sqlite3
from functools import wraps
from flask import current_app, jsonify, session
def database():
    # SQLite est réservé aux comptes ; les données touristiques restent dans Fuseki.
    connection = sqlite3.connect(current_app.config["DATABASE"]); connection.row_factory = sqlite3.Row
    connection.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL)")
    return connection
def login_required(fn):
    # Protège les écritures RDF (POST, PUT, DELETE) par une session Flask.
    @wraps(fn)
    def wrapped(*args, **kwargs):
        if "user_id" not in session: return jsonify(error="Authentification requise"), 401
        return fn(*args, **kwargs)
    return wrapped
