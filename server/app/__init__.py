from flask import Flask


def create_app():
    app = Flask(__name__)

    from .config import Config
    app.config.from_object(Config)

    from .models import db
    db.init_app(app)

    from .blueprints.views import blueprint as views
    app.register_blueprint(views)

    if app.debug:
        with app.app_context():
            db.create_all(check_first=True)

    return app
