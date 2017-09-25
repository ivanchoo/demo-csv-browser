from flask import Blueprint, jsonify, request, abort, current_app
from ..models import ChangeLog, db
from sqlalchemy import func
import arrow

PAGESIZE = 20
STATSIZE = 50

blueprint = Blueprint('api', __name__)


def check_permission(changelog_id):
    # In production, we're likely have do some check and ensure the current
    # user has access to the given `changelog_id`. Skip check for demo
    pass


@blueprint.route('/changelogs')
def changelogs():
    """Returns a list of changelogs available in the system."""
    # In production, we're likely to filter and return **only** the changelogs
    # belonging to the current user. For demo we simply return all
    check_permission()
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
    check_permission(changelog_id)
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


@blueprint.route('/changelog/<int:changelog_id>/results')
def changelog_results(changelog_id):
    check_permission(changelog_id)
    cl = ChangeLog.query.get(changelog_id)
    t = cl.datatable()
    q = db.session.query(
            t.c.object_id,
            func.to_char(t.c.timestamp, 'YYYY-MM-DDThh:mm:SS'),
            t.c.object_type,
            t.c.object_changes
        )
    q = _apply_changelog_filters_or_raise(t, q, request.args)
    page = int(request.args.get('page', 0))
    q = q.order_by(t.c.timestamp.asc()).\
        limit(PAGESIZE).\
        offset(page * PAGESIZE)
    resp = [
        {'id': id, 'datetime': dt, 'object_type': ot, 'changes': changes}
        for id, dt, ot, changes in q.all()
    ]
    return jsonify(resp)


@blueprint.route('/changelog/<int:changelog_id>/results/stats')
def changelog_results_stats(changelog_id):
    check_permission(changelog_id)
    resp = {}
    cl = ChangeLog.query.get(changelog_id)
    t = cl.datatable()
    object_type_c = func.count(t.c.object_id)
    q = db.session.query(
            t.c.object_type,
            object_type_c
        )
    q = _apply_changelog_filters_or_raise(t, q, request.args).\
        group_by(t.c.object_type).\
        order_by(object_type_c.desc()).\
        limit(STATSIZE)
    resp['object_types'] = q.all()
    object_c = func.concat(t.c.object_type, ':', t.c.object_id)
    q = db.session.query(
            object_c,
            object_type_c
        )
    q = _apply_changelog_filters_or_raise(t, q, request.args).\
        group_by(object_c).\
        order_by(object_type_c.desc()).\
        limit(STATSIZE)
    resp['objects'] = q.all()
    return jsonify(resp)


def from_datetime(dt):
    if not dt:
        return None
    return arrow.get(dt, 'YYYY-MM-DDTHH:mm:ss').datetime


def _apply_changelog_filters_or_raise(*args):
    try:
        return _apply_changelog_filters(*args)
    except Exception as e:
        current_app.logger.error(e)
        abort(400)


def _apply_changelog_filters(table, query, args):
    from_ = from_datetime(args.get('from'))
    to = from_datetime(args.get('to'))
    target = args.get('target')
    if from_:
        query = query.filter(table.c.timestamp >= from_)
    if to:
        query = query.filter(table.c.timestamp <= to)
    if target:
        if ':' in target:
            object_type, object_id = target.split(':')
        else:
            object_type = target
            object_id = None
        if object_type:
            query = query.filter(table.c.object_type == object_type)
        if object_id:
            query = query.filter(table.c.object_id == object_id)
    return query
