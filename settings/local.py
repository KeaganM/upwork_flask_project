from settings.base import *
import os

application.config["SECRET_KEY"] = "asupersecretkey"
db = Database(path="sqlite:///static/db/new_09_17_2020/database_keagans.db", create_connection=False)

DEBUG = True

