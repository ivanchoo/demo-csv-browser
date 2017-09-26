import pytz
from .core import db, Model, now, metadata, from_datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, Table, TIMESTAMP, event, func
)
from sqlalchemy.ext.hybrid import hybrid_property
from flask_sqlalchemy import SignallingSession
from datetime import datetime
from enum import Enum


def create_changelog_table(tablename, metadata=metadata):
    """Base template for data table of change logs"""
    assert metadata
    table = Table(
        tablename, metadata,
        Column('object_id', Integer, index=True),
        Column('timestamp', TIMESTAMP(timezone=True), index=True),
        Column('object_type', String, index=True),
        Column('object_changes', String, index=True),
        keep_existing=True
    )
    return table


class ChangeLogStatus(Enum):
    PENDING = 1
    READY = 2
    ERROR = 3


class ChangeLog(Model):
    """Represents an uploaded ChangeLog dataset.

    Corresponding data table is created when `ChangeLog` commits to database.
    Likewise, it drops the data table when the entry is removed.

    To query against the data table, use `ChangeLog.datatable()`.
    """
    __tablename__ = 'changelogs'

    changelog_id = Column(Integer, primary_key=True)

    filename = Column(String, nullable=True)

    status = Column(Integer, nullable=False)

    created_at = Column(DateTime(timezone=True), nullable=False, default=now)

    @hybrid_property
    def tablename(self):
        return self.changelog_id and \
            'changelogs{}'.format(self.changelog_id) or None

    @tablename.expression
    def tablename(cls):
        return func.concat('changelogs', cls.changelog_id)

    @hybrid_property
    def is_ready(self):
        return self.status == ChangeLogStatus.READY.value

    @is_ready.expression
    def is_ready(self):
        return self.status == ChangeLogStatus.READY.value

    @hybrid_property
    def is_pending(self):
        return self.status == ChangeLogStatus.PENDING.value

    @is_pending.expression
    def is_pending(self):
        return self.status == ChangeLogStatus.PENDING.value

    @hybrid_property
    def is_error(self):
        return self.status == ChangeLogStatus.ERROR.value

    @is_error.expression
    def is_error(self):
        return self.status == ChangeLogStatus.ERROR.value

    def set_ready(self):
        self.status = ChangeLogStatus.READY.value

    def set_error(self):
        self.status = ChangeLogStatus.ERROR.value

    def __repr__(self):
        return '<ChangeLogMeta({})>'.format(self.changelog_id)

    def to_dict(self):
        return {
            'changelog_id': self.changelog_id,
            'filename': self.filename,
            'created_at': from_datetime(self.created_at)
        }

    def to_stats(self):
        """Returns a list of [('YYYY-MM-DD', int)] statistics for number of
        logs for each day."""
        t = self.datatable()
        dtc = func.to_char(t.c.timestamp, 'YYYY-MM-DD')
        q = db.session.query(
                dtc,
                func.count(t.c.object_id)
            )
        q = q.group_by(dtc).\
            order_by(dtc.desc())
        return q.all()

    def datatable(self):
        tablename = self.tablename
        assert tablename, 'Expects ChangeLog to have a `tablename`'
        if tablename in metadata.tables:
            return metadata.tables[tablename]
        return create_changelog_table(tablename)

    def populate_datatable(self, rows, session=db.session):
        """Populate the `datatable` with the given csv.

        Returns the number of rows inserted"""
        return _populate_datatable(rows, self.datatable(), session)


@event.listens_for(ChangeLog, 'init')
def receive_init(target, args, kwargs):
    target.status = ChangeLogStatus.PENDING.value


def _populate_datatable(rows, table, session):
    n = 0
    batch = 100
    values = []
    ins = table.insert()
    tz = pytz.utc
    for row in rows:
        if not row:
            continue
        item = {
            'object_id': row[0],
            'timestamp': datetime.fromtimestamp(int(row[1]), tz),
            'object_type': row[2],
            'object_changes': row[3]
        }
        values.append(item)
        n += 1
        if n % batch == 0:
            session.execute(ins, values)
            values = []
    if values:
        session.execute(ins, values)
    return n


@event.listens_for(SignallingSession, 'before_commit')
def _before_commit(session):
    for target in session.new:
        if isinstance(target, ChangeLog):
            # dynamically create data table for new ChangeLog entries
            _before_commit_insert_changelog(session, target)
    for target in session.deleted:
        if isinstance(target, ChangeLog):
            # dynamically remove data table for delete ChangeLog entries
            _before_commit_delete_changelog(session, target)


def _before_commit_insert_changelog(session, target):
    session.flush()
    tablename = target.tablename
    assert tablename, 'Expects tablename at before_commit for insert'
    t = create_changelog_table(tablename)
    t.create(bind=session.get_bind())


def _before_commit_delete_changelog(session, target):
    session.flush()
    t = target.datatable()
    t.drop(bind=session.get_bind())
    t.metadata.remove(t)
