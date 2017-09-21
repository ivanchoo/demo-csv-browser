from flask import Blueprint

blueprint = Blueprint('api', __name__)


@blueprint.route('/')
def index():
    return 'It works!'
