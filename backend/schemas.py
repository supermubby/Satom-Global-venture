from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Customer Schemas ───────────────────────────────────────────────────────────
class CustomerCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone_number: str = Field(..., min_length=5, max_length=50)

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        # Allow digits, spaces, +, -, and parentheses
        cleaned = "".join(ch for ch in v if ch.isdigit() or ch in "+-() ")
        if not cleaned:
            raise ValueError("phone_number must contain at least one digit")
        return cleaned


class CustomerResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    phone_number: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Order Schemas (Service Request) ───────────────────────────────────────────
class OrderCreate(BaseModel):
    """Create a single service request (not a cart with multiple items)."""
    customer: CustomerCreate
    service_name: str = Field(..., min_length=1, max_length=255)
    service_description: Optional[str] = None
    installation_address: str = Field(..., min_length=1, max_length=500)
    state_city: str = Field(..., min_length=1, max_length=200)
    total_price: float = Field(default=0.0, ge=0.0)
    special_instructions: Optional[str] = None


class OrderSummaryResponse(BaseModel):
    id: uuid.UUID
    customer: CustomerResponse
    service_name: str
    service_description: Optional[str] = None
    installation_address: str
    state_city: str
    total_price: float
    order_status: str
    special_instructions: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderCreatedResponse(BaseModel):
    message: str
    order_id: uuid.UUID
    order: OrderSummaryResponse


# ── Admin Auth Schemas ─────────────────────────────────────────────────────────
class AdminLoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: "AdminUserResponse"


class AdminUserResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    full_name: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminUserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=1, max_length=255)


# ── Dashboard Stats ────────────────────────────────────────────────────────────
class DashboardStats(BaseModel):
    total_orders: int
    total_revenue: float
    pending_orders: int
    confirmed_orders: int
    in_progress_orders: int
    completed_orders: int
    cancelled_orders: int
    total_customers: int


class OrderStatusUpdate(BaseModel):
    order_status: Optional[str] = None
    total_price: Optional[float] = None


class OrderStatusUpdateSimple(BaseModel):
    """Request body for the dedicated status-only PATCH endpoint."""
    status: str = Field(..., min_length=1)
