import click
import csv
import random
import json
from datetime import datetime, timedelta

OBJECT_TYPES = ('Order', 'Product', 'Invoice')
PRODUCT_TYPES = ('Laptop', 'Camera', 'Phone', 'Computer', 'Watch', 'Tablet')
STATUS_TYPES = ('paid', 'unpaid')

csv.register_dialect(
    'escaped', escapechar='\\',
    doublequote=False, quoting=csv.QUOTE_NONNUMERIC
)


@click.group(chain=True)
@click.pass_context
def cli(ctx):
    pass


@cli.command()
@click.option(
    '-f', type=click.File('w'),
    help='File path to output, default to stdout')
@click.option(
    '--rows', default=100, type=int, help='Number of rows, default to 100')
def data(f, rows):
    """Create random data and output as csv to the given `file` path."""
    assert rows, 'Expects non zero rows'
    csv_kwargs = {
        'dialect': 'escaped'
    }
    if not f:
        writer = csv.writer(click.get_text_stream('stdout'), **csv_kwargs)
        _write_csv(writer, rows)
    else:
        with f.open() as fp:
            writer = csv.writer(fp, **csv_kwargs)
            # click.echo(dir(fp))
            _write_csv(writer, rows)


def _write_csv(writer, rows):
    dt = datetime.utcnow()
    for i in range(rows):
        type_ = random.choice(OBJECT_TYPES)
        writer.writerow((
            rows - i,  # id is in reverse order, since we time travel backwards
            int(dt.timestamp()),  # timestamp sans microseconds
            type_,
            _sample_changes(type_, i)
        ))
        td = timedelta(
            seconds=random.randint(300, 28800),
            days=random.randint(0, 100) < 20 and 1 or 0
        )
        dt = dt - td


def _sample_changes(type_, uid):
    if type_ == 'Product':
        changes = {
            'name': random.choice(PRODUCT_TYPES),
            'price': random.randint(100, 10000),
            'stock_levels': random.randint(1, 100)
        }
    elif type_ == 'Order':
        changes = {
            'customer_name': 'Customer %s' % uid,
            'customer_address': 'Address %s' % uid,
            'status': random.choice(STATUS_TYPES)
        }
    elif type_ == 'Invoice':
        changes = {
            'order_id': uid % 1000,
            'product_ids': [
                random.randint(1000, 100000)
                for x in range(random.randint(1, 4))
            ],
            'status': random.choice(STATUS_TYPES),
            'total': random.randint(20, 2000)
        }
    else:
        raise RuntimeError('Unsupported object type %s' % type_)
    return json.dumps(changes)

if __name__ == '__main__':
    cli(obj={})
