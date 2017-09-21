import pytz
from .core import db, Model, now, metadata, from_datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, Table, TIMESTAMP, event, func
)
from flask_sqlalchemy import SignallingSession
from datetime import datetime


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


class ChangeLog(Model):
    """Represents an uploaded ChangeLog dataset.

    Corresponding data table is created when `ChangeLog` commits to database.
    Likewise, it drops the data table when the entry is removed.

    To query against the data table, use `ChangeLog.datatable()`.
    """
    __tablename__ = 'changelogs'

    changelog_id = Column(Integer, primary_key=True)

    tablename = Column(String, nullable=False, unique=True)

    filename = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, default=now)

    def __repr__(self):
        return '<ChangeLogMeta({}, tablename="{}")>'.\
            format(self.changelog_id, self.tablename)

    def to_dict(self):
        return {
            'changelog_id': self.changelog_id,
            'filename': self.filename,
            'created_at': from_datetime(self.created_at)
        }

    def to_details(self):
        t = self.datatable()
        dtc = func.to_char(t.c.timestamp, 'YYYY-MM-DD')
        q = db.session.query(
                dtc,
                func.count(t.c.object_id)
            )
        q = q.group_by(dtc).\
            order_by(dtc.desc())
        details = self.to_dict()
        details['series'] = q.all()
        return details

    def datatable(self):
        assert self.tablename, 'Expects ChangeLog to have a `tablename`'
        if self.tablename in metadata.tables:
            return metadata.tables[self.tablename]
        return create_changelog_table(self.tablename)

    def populate_datatable(self, rows, session=db.session):
        """Populate the `datatable` with the given csv.

        Returns the number of rows inserted"""
        return _populate_datatable(rows, self.datatable(), session)


def _populate_datatable(rows, table, session):
    n = 0
    batch = 100
    values = []
    ins = table.insert()
    tz = pytz.utc
    for row in rows:
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
    assert target.tablename
    t = create_changelog_table(target.tablename)
    t.create(bind=session.get_bind())


def _before_commit_delete_changelog(session, target):
    t = target.datatable()
    t.drop(bind=session.get_bind())
    t.metadata.remove(t)
