from flask import Flask, redirect, url_for, render_template, request, session

from cryptography.fernet import Fernet
import os

from dotenv import load_dotenv
load_dotenv()

import asqlite
import random
import smtplib, ssl
from uuid import uuid4
import email.message
import datetime
import json

app = Flask(__name__)

app.secret_key = os.getenv("APP_SECRET_KEY")

crypto_key = os.getenv("CRYPTO_KEY")
cipher_suite = Fernet(crypto_key)

@app.route('/')
async def home():

    return render_template("home.html")

@app.route('/editor')
async def editor():

    return render_template("editor/editor.html")

# @app.route('/login')
# async def login():
#     if request.method == 'POST':
#         email = request.form['']
#         password = request.form['']
#         async with asqlite.connect("main.db") as conn:
#             async with conn.cursor() as cursor:
#                 await cursor.execute(f"SELECT * FROM accounts WHERE email = ?", email)
#                 result = await cursor.fetchone()
#         if result is None:
#             return render_template()
#         elif bytes(password, encoding='utf8') != cipher_suite.decrypt(result[2]):
#             return render_template()
#         else:
#             session["user"] = str(result[0])
#             session["email"] = str(result[2])
#             session["account_id"] = str(result[3])
#             return redirect(url_for())
#     else:
#         if "user" in session:
#             return redirect(url_for())
#         return render_template()

if __name__ == "__main__":
    app.run(debug = True)