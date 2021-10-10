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
import math
from PIL import Image
import bleach

app = Flask(__name__)

app.secret_key = os.getenv("APP_SECRET_KEY")

crypto_key = bytes(os.getenv("CRYPTO_KEY"), encoding='utf8')
print(crypto_key)
cipher_suite = Fernet(crypto_key)

@app.route('/')
async def home():
    user = {}

    async with asqlite.connect("main.db") as conn:
        async with conn.cursor() as cursor:
            await cursor.execute('SELECT art_id, title, author_id FROM arts ORDER BY art_id DESC')
            results = await cursor.fetchall()
            print(results)

            arts = []
            for result in results:

                art = {}
                art['id'] = result['art_id']

                await cursor.execute('SELECT username FROM accounts WHERE account_id = ?', result['author_id'])
                author = await cursor.fetchone()

                art['author'] = author[0]
                art['title'] = result['title']

                arts.append(art)

            print(arts)

            if 'email' in session:
                user['account_id'] = session['account_id']
                user['email'] = session['email']
                user['username'] = session['user']
                return render_template("home.html", user=user, arts=arts)
            else:
                return render_template("home.html", user=user, arts=arts)

@app.route('/delete/<art_id>', methods=['GET','POST'])
async def delete(art_id):
    user = {}
    if 'email' in session:
        user['account_id'] = session['account_id']
        user['email'] = session['email']
        user['username'] = session['user']
        async with asqlite.connect("main.db") as conn:
            async with conn.cursor() as cursor:
                await cursor.execute('SELECT * FROM arts WHERE author_id = ? and art_id = ?', user['account_id'], int(art_id))
                result = await cursor.fetchone()
                if int(session['account_id']) == int(result[2]):
                    await cursor.execute('DELETE FROM arts WHERE art_id = ?', int(art_id))
                    return redirect(url_for("profile"))
                else:
                    return redirect(url_for("profile"))
    else:
        return redirect(url_for("profile"))

@app.route('/profile')
async def profile():
    user = {}
    if 'email' in session:
        user['account_id'] = session['account_id']
        user['email'] = session['email']
        user['username'] = session['user']
        
        async with asqlite.connect("main.db") as conn:
            async with conn.cursor() as cursor:
                await cursor.execute('SELECT art_id, title, author_id FROM arts WHERE author_id = ? ORDER BY art_id DESC', user['account_id'])
                results = await cursor.fetchall()

                arts = []
                for result in results:

                    art = {}
                    art['id'] = result['art_id']

                    await cursor.execute('SELECT username FROM accounts WHERE account_id = ?', result['author_id'])
                    author = await cursor.fetchone()

                    art['author'] = author[0]
                    art['title'] = result['title']

                    arts.append(art)

                return render_template("profile.html", user=user, arts=arts)

    else:
        return redirect(url_for("login"))

@app.route('/editor/<cloned_id>', methods=['GET', 'POST'])
@app.route('/editor/', methods=['GET', 'POST'])
@app.route('/editor', methods=['GET', 'POST'])
async def editor(cloned_id=None):
    user = {}
    
    if 'email' in session:
        user['account_id'] = session['account_id']
        user['email'] = session['email']
        user['username'] = session['user']
        return render_template("editor/editor.html", user=user, cloned_id=cloned_id)
    else:
        return redirect(url_for("login"))

@app.route('/editor/submit', methods=['GET', 'POST'])
async def submit():
    if 'email' in session:
        if request.method == 'POST':
            async with asqlite.connect("main.db") as conn:
                async with conn.cursor() as cursor:
                    request_json = request.get_json()


                    print(request_json)
                    title = request_json['title']

                    if(bleach.clean(str(title)) == ""):
                        title = "Untitled Animation"

                    sql = ("INSERT INTO arts(title, author_id, pixels, timing) VALUES(?,?,?,?)")
                    val = (bleach.clean(str(title)), int(session['account_id']), str(request_json['frames']), int(request_json['timing']))
                    await cursor.execute(sql, val)



                    await cursor.execute(f"SELECT last_insert_rowid()")
                    ident = (await cursor.fetchone())[0]

                    print("CURRENT ID", ident)
                    
                    # GENERATE GIF
                    await boardToImage(ident, request_json['frames'], int(request_json['timing']))

                    return f'/view/{ident}'


@app.route('/about')
async def about():
    user = {}
    if 'email' in session:
        user['account_id'] = session['account_id']
        user['email'] = session['email']
        user['username'] = session['user']
        return render_template("about.html", user=user)
    else:
        return render_template("about.html", user=user)

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


@app.route('/view/<art_id>', methods=['GET', 'POST'])
async def view(art_id):
    user = {}
    if 'email' in session:
        user['account_id'] = session['account_id']
        user['email'] = session['email']
        user['username'] = session['user']

        return render_template("view.html", user=user, art_id=art_id)
    else:
        return render_template('view.html', user=user, art_id=art_id)

@app.route('/view/get/<art_id>', methods=['GET'])
async def viewGet(art_id):
    art = {}
    if 'email' in session:
        async with asqlite.connect("main.db") as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(f"SELECT * FROM arts WHERE art_id = ?", art_id)
                result = await cursor.fetchone()
                await cursor.execute(f"SELECT username FROM accounts WHERE account_id = ?", int(result[2]))
                author = await cursor.fetchone()
                art['title'] = str(result[1])
                art['author'] = str(author[0])
                art['frames'] = result[3]
                art['timing'] = result[4]
        return art
    else:
        async with asqlite.connect("main.db") as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(f"SELECT * FROM arts WHERE art_id = ?", art_id)
                result = await cursor.fetchone()
                await cursor.execute(f"SELECT username FROM accounts WHERE account_id = ?", int(result[2]))
                author = await cursor.fetchone()
                art['title'] = str(result[1])
                art['author'] = str(author[0])
                art['frames'] = result[3]
                art['timing'] = result[4]
        return art
    


# This function ensures that the colors people select MUST be one of the 16 predefined colors. No hacking
COLORS = (
    (0,0,0),
    (0,0,170),
    (0,170,0),
    (0,170,170),
    (170,0,0),
    (170,85,0),
    (170,170,170),
    (85,85,85),
    (85,85,255),
    (85,255,85),
    (85,255,255),
    (255,85,85),
    (255,85,255),
    (255,255,85),
    (255,255,255)
)
def closest_color(rgb):
    r, g, b = rgb
    color_diffs = []
    for color in COLORS:
        cr, cg, cb = color
        color_diff = math.sqrt(abs(r - cr)**2 + abs(g - cg)**2 + abs(b - cb)**2)
        color_diffs.append((color_diff, color))
    return min(color_diffs)[1]

@app.route('/boardToImage', methods=['GET', 'POST'])
async def boardToImage(id, obj, timing):
    images = []

    width = 32

    for i in range(len(obj)):
        im = Image.new('P', (width, width), (0,0,0))
        for x in range(32):
            for y in range(32):
                im.putpixel((x,y), closest_color((obj[i][x][y][0], obj[i][x][y][1], obj[i][x][y][2])))
        images.append(im)

    images[0].save(f'./static/gif/{id}.gif',
        save_all = True,
        append_images = images[1:],
        duration = timing,
        loop = 0
    )

    return "hello world"
        


if __name__ == "__main__":
    app.run(port=80, host='0.0.0.0')