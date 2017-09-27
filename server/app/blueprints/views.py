import requests
from flask import (
    Blueprint, render_template, current_app, Response,
    stream_with_context
)

blueprint = Blueprint('views', __name__)


@blueprint.route('/')
def index():
    return render_template('index.html')


@blueprint.route('/lib/<path:filename>')
def lib(filename):
    """Proxy to frontend webpack server,
    else proxies `static/lib` in production."""
    if current_app.debug:
        url = '{endpoint}/lib/{filename}'.format(
            endpoint=current_app.config.get(
                'DEV_FRONTEND_URI'), filename=filename)
        req = requests.get(url, stream=True)
        return Response(
            stream_with_context(req.iter_content(chunk_size=2048)),
            content_type=req.headers['content-type']
        )
    else:
        return current_app.send_static_file('lib/{}'.format(filename))
