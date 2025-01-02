-- migrate:up
INSERT INTO
    categories (name, description)
VALUES
    ('Living Room', 'Furniture for your living space'),
    ('Bedroom', 'Sleep and storage solutions'),
    ('Kitchen', 'Kitchen furniture and dining sets'),
    ('Office', 'Work from home essentials');

INSERT INTO
    products (
        category_id,
        name,
        description,
        price,
        sku,
        dimensions,
        weight
    )
VALUES
    (
        1,
        'KARLSTAD Sofa',
        '3-seat sofa, modern design',
        599.99,
        'SOF-KAR-001',
        '{"width": 180, "depth": 90, "height": 85}',
        45.5
    ),
    (
        1,
        'LACK Coffee Table',
        'Simple coffee table',
        29.99,
        'TBL-LAC-001',
        '{"width": 90, "depth": 55, "height": 45}',
        7.5
    ),
    (
        2,
        'MALM Bed Frame',
        'Queen size bed frame',
        299.99,
        'BED-MAL-001',
        '{"width": 160, "depth": 200, "height": 100}',
        65.0
    ),
    (
        2,
        'PAX Wardrobe',
        'Customizable wardrobe system',
        449.99,
        'WRD-PAX-001',
        '{"width": 150, "depth": 60, "height": 236}',
        110.0
    ),
    (
        3,
        'EKEDALEN Table',
        'Extendable dining table',
        199.99,
        'TBL-EKE-001',
        '{"width": 120, "depth": 80, "height": 75}',
        40.0
    ),
    (
        4,
        'MARKUS Chair',
        'Office chair with armrests',
        199.99,
        'CHR-MAR-001',
        '{"width": 62, "depth": 60, "height": 129}',
        18.0
    );

INSERT INTO
    stock (product_id, quantity, location)
VALUES
    (1, 15, 'Warehouse A'),
    (2, 45, 'Warehouse B'),
    (3, 10, 'Warehouse A'),
    (4, 8, 'Warehouse C'),
    (5, 20, 'Warehouse B'),
    (6, 25, 'Warehouse A');

INSERT INTO
    orders (
        customer_name,
        email,
        address,
        total_amount,
        status
    )
VALUES
    (
        'John Smith',
        'john.smith@email.com',
        '123 Main St, Springfield',
        829.97,
        'completed'
    ),
    (
        'Jane Doe',
        'jane.doe@email.com',
        '456 Oak Ave, Riverside',
        499.98,
        'pending'
    );

INSERT INTO
    order_items (order_id, product_id, quantity, price_at_time)
VALUES
    (1, 1, 1, 599.99),
    (1, 2, 1, 29.99),
    (2, 3, 1, 299.99),
    (2, 2, 2, 29.99);

-- migrate:down
TRUNCATE order_items CASCADE;

TRUNCATE orders CASCADE;

TRUNCATE stock CASCADE;

TRUNCATE products CASCADE;

TRUNCATE categories CASCADE;