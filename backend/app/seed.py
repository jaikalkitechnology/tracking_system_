"""Development seed script.

Populates the database with a realistic but fake dataset: users of every
role, sample products, a courier, a warehouse, a customer with an order,
a shipment, and its tracking history.

Usage:
    python -m app.seed
"""
from datetime import date, timedelta

from app.core.security import hash_password
from app.database.database import SessionLocal
from app.models.address import Address
from app.models.courier import Courier, CourierStatus
from app.models.customer import Customer, CustomerStatus
from app.models.order import Order, OrderStatus, PaymentStatus
from app.models.order_item import OrderItem
from app.models.product import Product, ProductStatus
from app.models.shipment import ShipmentStatus
from app.models.user import User, UserRole, UserStatus
from app.models.warehouse import Warehouse, WarehouseStatus
from app.services.shipment_service import create_shipment
from app.services.tracking_service import change_shipment_status
from app.schemas.shipment import ShipmentCreate


def seed():
    db = SessionLocal()
    try:
        if db.query(User).filter(User.email == "superadmin@example.com").first():
            print("Seed data already present, skipping.")
            return

        users = [
            User(
                name="Ava Superadmin",
                email="superadmin@example.com",
                phone="+919800000001",
                password_hash=hash_password("Password@123"),
                role=UserRole.SUPER_ADMIN,
                status=UserStatus.ACTIVE,
            ),
            User(
                name="Noah Admin",
                email="admin@example.com",
                phone="+919800000002",
                password_hash=hash_password("Password@123"),
                role=UserRole.ADMIN,
                status=UserStatus.ACTIVE,
            ),
            User(
                name="Mia Manager",
                email="manager@example.com",
                phone="+919800000003",
                password_hash=hash_password("Password@123"),
                role=UserRole.MANAGER,
                status=UserStatus.ACTIVE,
            ),
            User(
                name="Leo Warehouse",
                email="warehouse@example.com",
                phone="+919800000004",
                password_hash=hash_password("Password@123"),
                role=UserRole.WAREHOUSE,
                status=UserStatus.ACTIVE,
            ),
            User(
                name="Riya Customer",
                email="customer@example.com",
                phone="+919800000005",
                password_hash=hash_password("Password@123"),
                role=UserRole.CUSTOMER,
                status=UserStatus.ACTIVE,
            ),
        ]
        db.add_all(users)
        db.flush()

        customer_user = users[4]
        customer = Customer(
            user_id=customer_user.id,
            customer_code="CUST000001",
            name=customer_user.name,
            email=customer_user.email,
            phone=customer_user.phone,
            status=CustomerStatus.ACTIVE,
        )
        db.add(customer)
        db.flush()

        shipping_address = Address(
            customer_id=customer.id,
            address_line1="221B Baker Street",
            address_line2="Near Central Park",
            city="Thane",
            state="Maharashtra",
            pincode="400601",
            country="India",
            latitude=19.2183,
            longitude=72.9781,
        )
        db.add(shipping_address)
        db.flush()

        products = [
            Product(sku="SKU-TSHIRT-001", name="Classic Cotton T-Shirt", description="100% cotton crew neck t-shirt.", price=499.00, weight=0.2, status=ProductStatus.ACTIVE),
            Product(sku="SKU-SHOES-002", name="Running Shoes", description="Lightweight running shoes.", price=2499.00, weight=0.9, status=ProductStatus.ACTIVE),
            Product(sku="SKU-BAG-003", name="Laptop Backpack", description="Water-resistant 15-inch laptop backpack.", price=1799.00, weight=0.8, status=ProductStatus.ACTIVE),
            Product(sku="SKU-BOTTLE-004", name="Steel Water Bottle", description="1L insulated steel bottle.", price=699.00, weight=0.4, status=ProductStatus.ACTIVE),
        ]
        db.add_all(products)
        db.flush()

        warehouse = Warehouse(
            name="Mumbai Central Warehouse",
            code="WH-MUM-01",
            address="Plot 12, MIDC Industrial Area",
            city="Mumbai",
            state="Maharashtra",
            pincode="400072",
            latitude=19.0760,
            longitude=72.8777,
            status=WarehouseStatus.ACTIVE,
        )
        db.add(warehouse)

        courier = Courier(
            name="QuickShip Logistics",
            code="QUICKSHIP",
            phone="+911800000099",
            email="ops@quickship.example.com",
            api_url="https://api.quickship.example.com",
            api_key="sample_dev_api_key_never_use_in_prod",
            status=CourierStatus.ACTIVE,
        )
        db.add(courier)
        db.flush()

        order = Order(
            order_number="ORD-20260901-000001",
            customer_id=customer.id,
            shipping_address_id=shipping_address.id,
            billing_address_id=shipping_address.id,
            payment_status=PaymentStatus.PAID,
            order_status=OrderStatus.CONFIRMED,
            total_amount=0,
        )
        db.add(order)
        db.flush()

        total = 0.0
        for product, qty in [(products[0], 2), (products[2], 1)]:
            item_total = float(product.price) * qty
            total += item_total
            db.add(OrderItem(order_id=order.id, product_id=product.id, quantity=qty, price=product.price, total=item_total))
        order.total_amount = total
        db.flush()

        shipment = create_shipment(
            db,
            order,
            ShipmentCreate(
                order_id=order.id,
                courier_id=courier.id,
                warehouse_id=warehouse.id,
                weight=1.2,
                shipping_cost=79.0,
                estimated_delivery_date=date.today() + timedelta(days=3),
                origin="Mumbai",
                destination="Thane",
            ),
        )

        for status, location, description in [
            (ShipmentStatus.PACKED, "Mumbai Central Warehouse", "Your order has been packed."),
            (ShipmentStatus.PICKED_UP, "Mumbai Central Warehouse", "Shipment picked up by courier."),
            (ShipmentStatus.IN_TRANSIT, "Mumbai Hub", "Shipment is in transit."),
            (ShipmentStatus.ARRIVED_AT_HUB, "Thane Hub", "Arrived at Thane Hub."),
            (ShipmentStatus.OUT_FOR_DELIVERY, "Thane", "Out for delivery."),
        ]:
            change_shipment_status(db, shipment, status, location=location, description=description)

        db.commit()
        print("Seed data created successfully.")
        print("Login credentials (all use password: Password@123):")
        for u in users:
            print(f"  {u.role.value:<12} -> {u.email}")
        print(f"Sample tracking number: {shipment.tracking_number}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
