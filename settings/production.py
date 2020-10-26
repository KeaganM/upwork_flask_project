import secrets
import os

SECRET_KEY = secrets.token_hex(16)
# db = Database(path=os.environ['RR_DATABASE'], create_connection=False)
SQLALCHEMY_DATABASE_URI = os.environ['RR_DATABASE']
DEBUG = False

