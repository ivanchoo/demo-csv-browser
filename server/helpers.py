import click
from app.utils import csv_writer
from app.samples import create_samples, create_headers

OBJECT_TYPES = ('Order', 'Product', 'Invoice')
PRODUCT_TYPES = ('Laptop', 'Camera', 'Phone', 'Computer', 'Watch', 'Tablet')
STATUS_TYPES = ('paid', 'unpaid')


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
def samples(f, rows):
    """Create random data and output as csv to the given `file` path."""
    assert rows, 'Expects non zero rows'
    if not f:
        writer = csv_writer(click.get_text_stream('stdout'))
        writer.writerow(create_headers())
        for row in create_samples(rows):
            writer.writerow(row)
    else:
        with f.open() as fp:
            writer = csv_writer(fp)
            writer.writerow(create_headers())
            for row in create_samples(rows):
                writer.writerow(row)


if __name__ == '__main__':
    cli(obj={})
