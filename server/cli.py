import click
from app import create_app
from app.models import db
from sqlalchemy import MetaData


@click.group(chain=True)
@click.pass_context
def cli(ctx):
    pass


@cli.command()
def initdb():
    """Initialize database."""
    click.echo(
        'Preparing recreate the database, all existing data will be lost.')
    if not click.confirm('Do you want to continue?'):
        return
    app = create_app()
    with app.app_context():
        meta = MetaData()
        meta.reflect(bind=db.engine)
        for table in reversed(meta.sorted_tables):
            click.echo(' • Dropping {}'.format(table.name))
            table.drop(db.engine)
        db.create_all()
        click.echo('Done!')


if __name__ == '__main__':
    cli(obj={})
