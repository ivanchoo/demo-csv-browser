import random
import json
from datetime import datetime, timedelta

OBJECT_TYPES = ('Order', 'Product', 'Invoice')
PRODUCT_TYPES = ('Laptop', 'Camera', 'Phone', 'Computer', 'Watch', 'Tablet')
STATUS_TYPES = ('paid', 'unpaid')


def create_headers():
    return ('object_id', 'object_type', 'timestamp', 'object_changes')


def create_samples(rows):
    """Generate `rows` of sample data."""
    dt = datetime.utcnow()
    for i in range(rows):
        type_ = random.choice(OBJECT_TYPES)
        yield (
            rows - i,  # id is in reverse order, since we time travel backwards
            type_,
            int(dt.timestamp()),  # timestamp sans microseconds
            _create_sample_changes(type_, i)
        )
        td = timedelta(
            seconds=random.randint(300, 28800),
            days=random.randint(0, 100) < 20 and 1 or 0
        )
        dt = dt - td


def _create_sample_changes(type_, uid):
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
