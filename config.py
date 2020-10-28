current_settings = 'local'

if current_settings == 'local':
    from settings.local import *
else:
    from settings.production import *

from flask import Flask
from flask_bootstrap import Bootstrap
from utils.database import Database

application = Flask(__name__)
application.config["SECRET_KEY"] = SECRET_KEY

db = Database(path=SQLALCHEMY_DATABASE_URI,create_connection=False)

Bootstrap(application)

import routes
