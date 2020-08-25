from flask import Flask
from flask_bootstrap import Bootstrap
from utils.database import Database

application = Flask(__name__)

application.config["SECRET_KEY"] = "asupersecretkey"

db = Database(path="sqlite:///static/db/database_mock_old.db",create_connection=False)


Bootstrap(application)





import routes