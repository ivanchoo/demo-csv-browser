from .core import Model, now
from sqlalchemy import (
    Column, Integer, String, DateTime
)


class ChangeLogMeta(Model):

    __tablename__ = 'changelog_meta'

    changelog_id = Column(Integer, primary_key=True)

    table_id = Column(String, nullable=False)

    filename = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), nullable=False, default=now)

    def __repr__(self):
        return '<ChangeLogMeta({}, table_id="{}")>'.\
            format(self.changelog_id, self.table_id)
