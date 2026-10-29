import re
import sqlite3
from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash
from services.auth import database

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
@auth_bp.post("/register")
def register():
    # Le mot de passe est haché par Werkzeug avant écriture dans SQLite.
    data = request.get_json() or {}; email, password = data.get("email", "").strip().lower(), data.get("password", "")
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email) or len(password) < 8: raise ValueError("Email invalide ou mot de passe de moins de 8 caractères")
    con = database()
    try: cur = con.execute("INSERT INTO users(email,password_hash) VALUES (?,?)", (email, generate_password_hash(password))); con.commit()
    except sqlite3.IntegrityError: return jsonify(error="Cet email est déjà utilisé"), 409
    session["user_id"] = cur.lastrowid; return jsonify(id=cur.lastrowid, email=email), 201
@auth_bp.post("/login")
def login():
    # Une connexion valide crée une session HTTP utilisée par @login_required.
    data = request.get_json() or {}; user = database().execute("SELECT * FROM users WHERE email=?", (data.get("email", "").strip().lower(),)).fetchone()
    if not user or not check_password_hash(user["password_hash"], data.get("password", "")): return jsonify(error="Identifiants invalides"), 401
    session["user_id"] = user["id"]; return jsonify(id=user["id"], email=user["email"])
@auth_bp.post("/logout")
def logout(): session.clear(); return "", 204
