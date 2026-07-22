import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Enum as SAEnum,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base
import enum


# ── Enums ──────────────────────────────────────────────────────────────────────
class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"
    successful = "successful"


# ── Helper: UUID primary key ───────────────────────────────────────────────────
def uuid_pk() -> UUID:
    return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ── Customers ──────────────────────────────────────────────────────────────────
class Customer(Base):
    __tablename__ = "customers"

    id = uuid_pk()
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone_number = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    # relationships
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Customer {self.full_name} ({self.email})>"


# ── Orders (Service/Installation Requests) ─────────────────────────────────────
class Order(Base):
    """
    Represents a single solar installation or energy service request.
    Each order is a standalone service request (not a cart with multiple items).
    """
    __tablename__ = "orders"

    id = uuid_pk()
    customer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
    )
    # Service/package details
    service_name = Column(String(255), nullable=False)
    service_description = Column(Text, nullable=True)
    # Customer info (denormalized for convenience)
    installation_address = Column(String(500), nullable=False)
    state_city = Column(String(200), nullable=False)
    # Pricing
    total_price = Column(Float, nullable=False, default=0.0)
    # Status
    order_status = Column(
        SAEnum(OrderStatus, name="order_status_enum", create_constraint=True),
        default=OrderStatus.pending,
        nullable=False,
    )
    # Special instructions
    special_instructions = Column(Text, nullable=True)
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    # relationships
    customer = relationship("Customer", back_populates="orders")

    def __repr__(self) -> str:
        return f"<Order {self.id} – {self.service_name} – {self.order_status}>"


# ── Admin Users ──────────────────────────────────────────────────────────────────
class AdminUser(Base):
    __tablename__ = "admin_users"

    id = uuid_pk()
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<AdminUser {self.username} ({self.email})>"