from flask import Blueprint, jsonify
from ..models import ChangeLog, db
from sqlalchemy import func

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


@blueprint.route('/changelog/<int:changelog_id>/stats')
def changelog(changelog_id):
    """Returns a list of [('YYYY-MM-DD', int)] stats for the
    given `changelog_id`"""
    # In production, we're likely have do some check and ensure the current
    # user has access to the given `changelog_id`. Skip check for demo
    cl = ChangeLog.query.get(changelog_id)
    t = cl.datatable()
    dtc = func.to_char(t.c.timestamp, 'YYYY-MM-DD')
    q = db.session.query(
            dtc,
            func.count(t.c.object_id)
        )
    q = q.group_by(dtc).\
        order_by(dtc.desc())
    return jsonify(q.all())
