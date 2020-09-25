from settings.base import *
import secrets

application.config["SECRET_KEY"] = secrets.token_hex(16)
db = Database(path="sqlite:///static/db/new_09_17_2020/database.db", create_connection=False)

DEBUG = False

