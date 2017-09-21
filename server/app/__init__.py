from flask import Flask
from .config import Config


def create_app(config=Config):
    app = Flask(__name__)

    app.config.from_object(config)

    from .models import db
    db.init_app(app)

    from .blueprints.views import blueprint as views
    app.register_blueprint(views)

    if app.debug and not app.testing:
        with app.app_context():
            db.create_all()

    return app
