import re
import sqlite3
from flask import Blueprint, current_app, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash
from services.auth import database
from services.rdf import NS, person_triples

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
@auth_bp.post("/register")
def register():
    # Le mot de passe est haché par Werkzeug avant écriture dans SQLite.
    data = request.get_json() or {}; email, password = data.get("email", "").strip().lower(), data.get("password", "")
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email) or len(password) < 8: raise ValueError("Email invalide ou mot de passe de moins de 8 caractères")
    con = database()
    try: cur = con.execute("INSERT INTO users(email,password_hash) VALUES (?,?)", (email, generate_password_hash(password))); con.commit()
    except sqlite3.IntegrityError: return jsonify(error="Cet email est déjà utilisé"), 409
    person_id = f"Personne{cur.lastrowid}"
    try:
        body = person_triples(person_id, {**data, "email": email})
        current_app.fuseki.update(f"PREFIX eco: <{NS}> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> INSERT DATA {{ {body} }}")
        con.execute("UPDATE users SET person_id=? WHERE id=?", (person_id, cur.lastrowid)); con.commit()
    except Exception:
        con.execute("DELETE FROM users WHERE id=?", (cur.lastrowid,)); con.commit()
        raise
    session["user_id"] = cur.lastrowid; session["person_id"] = person_id
    return jsonify(id=cur.lastrowid, email=email, person_id=person_id), 201
@auth_bp.post("/login")
def login():
    # Une connexion valide crée une session HTTP utilisée par @login_required.
    data = request.get_json() or {}; user = database().execute("SELECT * FROM users WHERE email=?", (data.get("email", "").strip().lower(),)).fetchone()
    if not user or not check_password_hash(user["password_hash"], data.get("password", "")): return jsonify(error="Identifiants invalides"), 401
    session["user_id"] = user["id"]; session["person_id"] = user["person_id"]
    return jsonify(id=user["id"], email=user["email"], person_id=user["person_id"])
@auth_bp.post("/logout")
def logout(): session.clear(); return "", 204
