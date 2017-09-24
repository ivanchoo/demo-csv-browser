from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

Model = db.Model

metadata = db.metadata

now = datetime.utcnow


def from_datetime(dt):
    return dt.strftime('%Y-%m-%dT%H:%M:%S')


def to_datetime(iso):
    raise NotImplementedError()
