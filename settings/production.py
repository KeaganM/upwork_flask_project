from settings.base import *
import secrets
import os

application.config["SECRET_KEY"] = secrets.token_hex(16)
db = Database(path=os.environ['RR_DATABASE'], create_connection=False)

DEBUG = False

