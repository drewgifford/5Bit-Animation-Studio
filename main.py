from flask import Flask, redirect, url_for, render_template, request, sessions

from cryptography.fernet import Fernet
import os

from dotenv import load_dotenv
load_dotenv()

import sqlite3
import random
import smtplib, ssl
from uuid import uuid4
import email.message
import datetime
import json

app = Flask(__name__)

app.secret_key = os.getenv("APP_SECRET_KEY")


@app.route('/')
def home():
    # CONNECT TO DATABASE
    db = sqlite3.connect('main.db')
    cursor = db.cursor()

    return render_template("home.html")

@app.route('/editor')
def editor():
    # CONNECT TO DATABASE
    db = sqlite3.connect('main.db')
    cursor = db.cursor()

    return render_template("editor/editor.html")

if __name__ == "__main__":
    app.run(debug = True)