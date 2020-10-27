import secrets
import os

SECRET_KEY = secrets.token_hex(16)
SQLALCHEMY_DATABASE_URI = os.environ['RR_DATABASE']
DEBUG = False

