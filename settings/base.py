from flask import Flask
from flask_bootstrap import Bootstrap
from utils.database import Database

application = Flask(__name__,template_folder='../templates',static_folder='../static')

Bootstrap(application)


