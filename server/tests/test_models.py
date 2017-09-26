import os
from .utils import DBTest
from app.models import (db, ChangeLog)
from app.utils import csv_reader
from sqlalchemy import func


class ModelsTest(DBTest):

    def test_changelogs(self):
        cl = ChangeLog(filename='test')
        db.session.add(cl)
        db.session.commit()

        assert cl in db.session
        assert cl.changelog_id
        table = cl.datatable()
        assert table.exists(bind=db.session.get_bind())

        csvfile = os.path.join(
            os.path.dirname(os.path.realpath(__file__)),
            '..', 'data', 'x10.csv'
        )
        assert os.path.exists(csvfile)
        assert os.path.isfile(csvfile)
        with open(csvfile, 'r') as fp:
            reader = csv_reader(fp)
            cl.populate_datatable(reader, session=db.session)
        db.session.commit()

        assert db.session.query(func.count(table.c.object_id)).scalar() == 10

        changelog_id = cl.changelog_id
        # Note: we need to remove the session to release the lock to `table`
        # else postgresql will enter a dead lock
        db.session.remove()

        cl = ChangeLog.query.get(changelog_id)
        assert cl
        db.session.delete(cl)
        db.session.commit()

        assert not ChangeLog.query.get(changelog_id)
        assert not table.exists(bind=db.session.get_bind())
