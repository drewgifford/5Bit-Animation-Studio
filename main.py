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
import glob
from PIL import Image

app = Flask(__name__)

app.secret_key = os.getenv("APP_SECRET_KEY")

crypto_key = bytes(os.getenv("CRYPTO_KEY"), encoding='utf8')
print(crypto_key)
cipher_suite = Fernet(crypto_key)

@app.route('/')
async def home():
    user = {}
    if 'email' in session:
        user['email'] = session['email']
        return render_template("home.html", user=user)
    else:
        return render_template("home.html", user=user)

@app.route('/editor')
async def editor():
    user = {}
    
    return render_template("editor/editor.html", user=user)

@app.route('/about')
async def about():
    user = {}

    return render_template('about.html', user=user)

### Account Routing ###

@app.route('/login', methods=['GET', 'POST'])
async def login():

    error = {}

    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        async with asqlite.connect("main.db") as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(f"SELECT * FROM accounts WHERE email = ?", email)
                result = await cursor.fetchone()
        if result is None:
            error['email'] = 'That email is not registered in our system.'
            return render_template("login.html", error=error)
        elif bytes(password, encoding='utf8') != cipher_suite.decrypt(result[1]):
            error['password'] = 'Password is incorrect.'
            return render_template("login.html", error=error)
        else:
            session["user"] = str(result[0])
            session["email"] = str(result[2])
            session["account_id"] = str(result[3])
            return redirect(url_for("home"))
    else:
        if "user" in session:
            return redirect(url_for("home"))
        return render_template("login.html", error=error)

@app.route('/signup', methods=['GET', 'POST'])
async def signup():

    error = {}

    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirmPassword']
        username = request.form['username']
        async with asqlite.connect("main.db") as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(f"SELECT * FROM accounts WHERE email = ?", email)
                result = await cursor.fetchone()
                if result is not None:
                    error['email'] = 'That email is already registered in our system.'
                    return render_template("signup.html", error=error)
                elif password == confirm_password:
                    ciphered_text = cipher_suite.encrypt(bytes(password, encoding='utf8'))
                    sql = ("INSERT INTO accounts(email, password, username) VALUES(?,?,?)")
                    val = (str(email), ciphered_text, str(username))
                    await cursor.execute(sql, val)
                    return redirect(url_for("home"))
                else:
                    error["confirmPassword"] = 'Passwords must match.'
                    return render_template("signup.html", error=error)
    else:
        return render_template("signup.html", error=error)

@app.route('/logout', methods=['GET', 'POST'])
async def logout():
    session.pop('email', None)
    session.pop('user', None)
    session.pop('account_id', None)
    return redirect(url_for("login"))




@app.route('/boardToImage', methods=['GET', 'POST'])
async def boardToImage():

    if request.method == 'POST':
        obj = request.get_json()
        print(obj)

    return "hello world"
        


if __name__ == "__main__":
    app.run(debug = True)