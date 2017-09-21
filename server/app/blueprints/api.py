from flask import Blueprint, jsonify, request
from ..models import ChangeLog

blueprint = Blueprint('api', __name__)


@blueprint.route('/changelogs')
def changelogs():
    """Returns a list of changelogs available in the system."""
    # In production, we're likely to filter and return **only** the changelogs
    # belonging to the current user. For demo we simply return all
    resp = [x.to_dict() for x in ChangeLog.query.all()]
    return jsonify(resp)


@blueprint.route('/changelog', methods=['POST'])
def changelog_upload():
    """Uploads a new changelog, returns the changelog details."""
    raise NotImplementedError()


@blueprint.route('/changelog/<int:changelog_id>')
def changelog(changelog_id):
    """Returns information of a given `changelog_id`:

    - No query parameters: Returns the changelog's details
    - With GET: Returns the changelog rows base on the given filters
    """
    # In production, we're likely have do some check and ensure the current
    # user has access to the given `changelog_id`. Skip check for demo
    cl = ChangeLog.query.get(changelog_id)
    if request.args:
        # Filter and return the rows
        raise NotImplementedError()
    return jsonify(cl.to_details())
