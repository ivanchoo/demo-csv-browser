from flask import Blueprint, jsonify, request, abort, current_app, Response
from ..models import ChangeLog, db
from ..utils import csv_reader, csv_writer, LineBuffer
from ..samples import create_samples, create_headers
from sqlalchemy import func
from functools import reduce, wraps
from time import sleep
import arrow
import tempfile
import os
import random


PAGESIZE = 20
STATSIZE = 50
LATENCY = 0  # For testing and dev

blueprint = Blueprint('api', __name__)


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # In production, we're likely have do some check and ensure the current
        # user has access to the given endpoint
        if LATENCY:
            sleep(LATENCY)
        return f(*args, **kwargs)

    return decorated


@blueprint.route('/changelogs')
@login_required
def changelogs():
    """Returns a list of changelogs available in the system."""
    # In production, we're likely to filter and return **only** the changelogs
    # belonging to the current user. For demo we simply return all
    q = ChangeLog.query.filter(ChangeLog.is_ready)
    return jsonify([x.to_dict() for x in q.all()])


@blueprint.route('/changelog', methods=['POST'])
@login_required
def changelog_upload():
    """Uploads a new changelog file, returns the changelog details."""
    file_ = request.files.get('changelog')
    if not file_ or not file_.filename:
        abort(404)
    # In production, we should upload the data file to a blob service
    # and create the ChangeLog entry with status as PENDING.
    # This way we can load the data into the table via a background task
    # without holding up the response.
    tmp = tempfile.NamedTemporaryFile(delete=False)
    tmpfile = tmp.name
    file_.save(tmpfile)
    cl = ChangeLog(filename=file_.filename)
    db.session.add(cl)
    db.session.commit()
    try:
        # For demo we simply perform the ETL here
        with open(tmpfile, 'r') as fp:
            reader = csv_reader(fp)
            cl.populate_datatable(reader, session=db.session)
        cl.set_ready()
        db.session.commit()
        return jsonify(cl.to_dict())
    except:
        current_app.logger.exception('Changelog file upload failed')
        db.session.rollback()
        cl.set_error()
        db.session.commit()
        abort(500)
    finally:
        if tmpfile and os.path.exists(tmpfile):
            os.remove(tmpfile)


@blueprint.route('/changelog/sample')
@login_required
def changelog_sample():
    """Downloads a sample changelog file with random data."""
    rows = random.randint(300, 30000)
    filename = 'sample-{}-rows.csv'.format(rows)
    stream = _stream_csv(create_samples(rows), create_headers())
    resp = Response(stream, mimetype='text/csv')
    resp.headers['Content-Disposition'] = \
        'attachment; filename={}'.format(filename)
    return resp


@blueprint.route('/changelog/<int:changelog_id>/stats')
@login_required
def changelog(changelog_id):
    """Returns a list of [('YYYY-MM-DD', int)] stats for the
    given `changelog_id`"""
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


@blueprint.route('/changelog/<int:changelog_id>/objects')
@login_required
def changelog_results(changelog_id):
    cl = ChangeLog.query.get(changelog_id)
    t = cl.datatable()
    q = db.session.query(
            t.c.object_id,
            func.to_char(t.c.timestamp, 'YYYY-MM-DD"T"HH24:MI:SS'),
            t.c.object_type,
            t.c.object_changes
        )
    q = _apply_changelog_filters_or_raise(t, q, request.args)
    page = int(request.args.get('page', 0))
    size = int(request.args.get('size', PAGESIZE))
    q = q.order_by(t.c.timestamp.asc()).\
        limit(size).\
        offset(max(0, page - 1) * size)
    resp = [
        {'id': id, 'datetime': dt, 'object_type': ot, 'changes': changes}
        for id, dt, ot, changes in q.all()
    ]
    return jsonify(resp)


@blueprint.route('/changelog/<int:changelog_id>/objects/stats')
@login_required
def changelog_results_stats(changelog_id):
    resp = {}
    # Fetch the counts grouped by `object_type`.
    # This gives a snapshot of the overall `object_type` distribution, the top
    # `object_type` and also we derive the total counts here.
    # Note that we don't limit the results here as `object_type` typically
    # has limited variety
    cl = ChangeLog.query.get(changelog_id)
    t = cl.datatable()
    object_type_c = func.count(t.c.object_id)
    q = db.session.query(
            t.c.object_type,
            object_type_c
        )
    q = _apply_changelog_filters_or_raise(t, q, request.args).\
        group_by(t.c.object_type).\
        order_by(object_type_c.desc())
    resp['object_types'] = q.all()
    resp['total'] = reduce(lambda x, y: x + y[1], resp['object_types'], 0)
    q = db.session.query(
            func.concat(t.c.object_type, ':', t.c.object_id),
            object_type_c
        )
    q = _apply_changelog_filters_or_raise(t, q, request.args).\
        group_by(t.c.object_type, t.c.object_id).\
        order_by(object_type_c.desc()).\
        limit(STATSIZE)
    resp['objects'] = q.all()
    return jsonify(resp)


def _stream_csv(rows, headers=None):
    buffer = LineBuffer()
    writer = csv_writer(buffer)
    if headers:
        writer.writerow(headers)
        yield buffer.read()
    for row in rows:
        writer.writerow(row)
        yield buffer.read()


def _from_datetime(dt):
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
    from_ = _from_datetime(args.get('from'))
    to = _from_datetime(args.get('to'))
    target = args.get('target')
    if from_:
        query = query.filter(table.c.timestamp >= from_)
    if to:
        query = query.filter(table.c.timestamp <= to)
    if target:
        if ':' in target:
            object_type, object_id = target.split(':')
            try:
                object_id = int(object_id)
            except:
                object_id = 0
        else:
            object_type = target
            object_id = None
        if object_type:
            query = query.filter(table.c.object_type.ilike(object_type))
        if object_id is not None:
            query = query.filter(table.c.object_id == object_id)
    return query
