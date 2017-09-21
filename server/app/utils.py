import csv

csv.register_dialect(
    'escaped', escapechar='\\',
    doublequote=False, quoting=csv.QUOTE_NONNUMERIC
)


def csv_reader(fp, dialect='escaped'):
    """Returns a csv reader from stream-like `fp` with the correct dialet."""
    if not dialect:
        dialect = csv.Sniffer().sniff(fp.read(1024))
        fp.seek(0)
    return csv.reader(fp, dialect)


def csv_writer(fp, dialect='escaped', **kwargs):
    return csv.writer(fp, dialect=dialect, **kwargs)
