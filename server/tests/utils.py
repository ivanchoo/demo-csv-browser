from flask_testing import TestCase
from app import create_app
from app.config import Config
from app.models import db


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_ECHO = True


class AppTest(TestCase):

    def create_app(self):
        app = create_app(config=TestConfig)
        return app


class DBTest(AppTest):

    def setUp(self):
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
