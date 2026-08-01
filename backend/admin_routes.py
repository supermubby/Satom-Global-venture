"""
Admin API routes - JWT protected admin dashboard endpoints.
"""
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select, func, case
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import AdminUser, LoginSecurity, Order, Customer, OrderStatus
from schemas import (
    AdminLoginRequest,
    AdminTokenResponse,
    AdminUserResponse,
    AdminUserCreate,
    DashboardStats,
    OrderSummaryResponse,
    OrderStatusUpdate,
    OrderStatusUpdateSimple,
    CustomerResponse,
)
from auth import hash_password, verify_password, create_access_token, get_current_admin
from rate_limiter import limiter

router = APIRouter(prefix="/api/admin", tags=["Admin"])
logger = logging.getLogger(__name__)

LOGIN_LOCKOUT_FAILURE_LIMIT = 10
LOGIN_LOCKOUT_WINDOW = timedelta(minutes=15)
LOGIN_LOCKOUT_DURATION = timedelta(minutes=15)
INVALID_LOGIN_MESSAGE = "Invalid username or password."


def _client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def _audit_login_event(
    *,
    username: str,
    client_ip: str,
    success: bool,
    event: str,
) -> None:
    logger.info(
        "admin_login_audit",
        extra={
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "username": username,
            "client_ip": client_ip,
            "success": success,
            "event": event,
        },
    )


async def _get_or_create_login_security(
    db: AsyncSession, username: str
) -> LoginSecurity:
    result = await db.execute(
        select(LoginSecurity)
        .where(LoginSecurity.username == username)
        .with_for_update()
    )
    security_record = result.scalar_one_or_none()
    if security_record:
        return security_record

    security_record = LoginSecurity(username=username)
    db.add(security_record)
    try:
        await db.flush()
        return security_record
    except IntegrityError:
        await db.rollback()
        result = await db.execute(
            select(LoginSecurity)
            .where(LoginSecurity.username == username)
            .with_for_update()
        )
        security_record = result.scalar_one()
        return security_record


def _is_locked(security_record: LoginSecurity, now: datetime) -> bool:
    return bool(security_record.locked_until and security_record.locked_until > now)


def _reset_login_security(security_record: LoginSecurity, now: datetime) -> None:
    security_record.failed_attempts = 0
    security_record.first_failed_attempt_at = None
    security_record.locked_until = None
    security_record.updated_at = now


def _record_failed_login(
    security_record: LoginSecurity, now: datetime, client_ip: str
) -> bool:
    if (
        security_record.first_failed_attempt_at is None
        or security_record.first_failed_attempt_at <= now - LOGIN_LOCKOUT_WINDOW
    ):
        security_record.failed_attempts = 1
        security_record.first_failed_attempt_at = now
    else:
        security_record.failed_attempts += 1

    security_record.last_failed_ip = client_ip
    security_record.updated_at = now

    if security_record.failed_attempts >= LOGIN_LOCKOUT_FAILURE_LIMIT:
        security_record.locked_until = now + LOGIN_LOCKOUT_DURATION
        return True
    return False


# ── Auth ───────────────────────────────────────────────────────────────────────
@router.post("/login", response_model=AdminTokenResponse)
@limiter.limit("5/minute")
async def admin_login(
    request: Request,
    payload: AdminLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate an admin user and return a JWT token."""
   
    now = datetime.now(timezone.utc)
    client_ip = _client_ip(request)
    username = payload.username

    security_record = await _get_or_create_login_security(db, username)

    if _is_locked(security_record, now):
        _audit_login_event(
            username=username,
            client_ip=client_ip,
            success=False,
            event="locked_login_blocked",
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=INVALID_LOGIN_MESSAGE,
        )

    if security_record.locked_until and security_record.locked_until <= now:
        _reset_login_security(security_record, now)
        _audit_login_event(
            username=username,
            client_ip=client_ip,
            success=False,
            event="account_unlocked",
        )

    result = await db.execute(
        select(AdminUser).where(AdminUser.username == username)
    )
    admin = result.scalar_one_or_none()
    all_admins = await db.execute(select(AdminUser))
    print("Admins in DB:", [a.username for a in all_admins.scalars().all()], flush=True)
    print("===== LOGIN =====", flush=True)
    print("Username repr:", repr(payload.username), flush=True)
    print("Length:", len(payload.username), flush=True)
    print("Admin found:", admin is not None, flush=True)
    
    if admin:
     print("DB Username:", admin.username, flush=True)
     print("DB Email:", admin.email, flush=True)
     print("Stored Hash:", admin.hashed_password, flush=True)
     print(
        "Password Valid:",
        verify_password(payload.password, admin.hashed_password),
        flush=True,
        )
    

    if not admin or not verify_password(payload.password, admin.hashed_password):
        locked = _record_failed_login(security_record, now, client_ip)
        _audit_login_event(
            username=username,
            client_ip=client_ip,
            success=False,
            event="account_locked" if locked else "invalid_credentials",
        )
        raise HTTPException(
            status_code=(
                status.HTTP_429_TOO_MANY_REQUESTS
                if locked
                else status.HTTP_401_UNAUTHORIZED
            ),
            detail=INVALID_LOGIN_MESSAGE,
        )

    if not admin.is_active:
        _audit_login_event(
            username=username,
            client_ip=client_ip,
            success=False,
            event="disabled_account",
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is disabled",
        )

    _reset_login_security(security_record, now)
    _audit_login_event(
        username=username,
        client_ip=client_ip,
        success=True,
        event="login_success",
    )

    token = create_access_token(data={"sub": str(admin.id)})
    return AdminTokenResponse(
        access_token=token,
        admin=AdminUserResponse.model_validate(admin),
    )


@router.get("/me", response_model=AdminUserResponse)
async def get_me(admin: AdminUser = Depends(get_current_admin)):
    """Return the currently authenticated admin's profile."""
    return AdminUserResponse.model_validate(admin)

@router.post("/seed", status_code=201)
async def seed_admin(
    payload: AdminUserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new admin user (seeding). In production, protect this behind
    an existing admin auth or disable it."""
    # Check if username or email already exists
    result = await db.execute(
        select(AdminUser).where(
            (AdminUser.username == payload.username) |
            (AdminUser.email == payload.email)
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already exists",
        )

    admin = AdminUser(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        password = payload.password,
        full_name=payload.full_name,
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    return {"message": "Admin user created", "admin_id": str(admin.id)}


# ── Dashboard Stats ────────────────────────────────────────────────────────────
@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Return aggregate dashboard statistics."""
    # Total orders & customers
    total_orders_result = await db.execute(select(func.count(Order.id)))
    total_orders = total_orders_result.scalar() or 0

    total_customers_result = await db.execute(select(func.count(Customer.id)))
    total_customers = total_customers_result.scalar() or 0

    # Total revenue (sum of total_price for all non-cancelled orders)
    revenue_result = await db.execute(
        select(func.coalesce(func.sum(Order.total_price), 0.0)).where(
            Order.order_status != OrderStatus.cancelled
        )
    )
    total_revenue = float(revenue_result.scalar() or 0.0)

    # Order status counts
    pending_result = await db.execute(
        select(func.count(Order.id)).where(Order.order_status == OrderStatus.pending)
    )
    pending_orders = pending_result.scalar() or 0

    confirmed_result = await db.execute(
        select(func.count(Order.id)).where(Order.order_status == OrderStatus.confirmed)
    )
    confirmed_orders = confirmed_result.scalar() or 0

    in_progress_result = await db.execute(
        select(func.count(Order.id)).where(Order.order_status == OrderStatus.in_progress)
    )
    in_progress_orders = in_progress_result.scalar() or 0

    completed_result = await db.execute(
        select(func.count(Order.id)).where(Order.order_status == OrderStatus.completed)
    )
    completed_orders = completed_result.scalar() or 0

    cancelled_result = await db.execute(
        select(func.count(Order.id)).where(Order.order_status == OrderStatus.cancelled)
    )
    cancelled_orders = cancelled_result.scalar() or 0

    return DashboardStats(
        total_orders=total_orders,
        total_revenue=round(total_revenue, 2),
        pending_orders=pending_orders,
        confirmed_orders=confirmed_orders,
        in_progress_orders=in_progress_orders,
        completed_orders=completed_orders,
        cancelled_orders=cancelled_orders,
        total_customers=total_customers,
    )


# ── Helper to build order response ─────────────────────────────────────────────
async def _build_order_response(order: Order) -> OrderSummaryResponse:
    """Convert an Order ORM object to a response model."""
    return OrderSummaryResponse(
        id=order.id,
        customer=CustomerResponse(
            id=order.customer.id,
            full_name=order.customer.full_name,
            email=order.customer.email,
            phone_number=order.customer.phone_number,
            created_at=order.customer.created_at,
        ),
        service_name=order.service_name,
        service_description=order.service_description,
        installation_address=order.installation_address,
        state_city=order.state_city,
        total_price=order.total_price,
        order_status=order.order_status.value if hasattr(order.order_status, "value") else order.order_status,
        special_instructions=order.special_instructions,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


# ── Orders ─────────────────────────────────────────────────────────────────────
@router.get("/orders", response_model=List[OrderSummaryResponse])
async def list_orders(
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all service requests with customer details."""
    result = await db.execute(
        select(Order)
        .order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()

    response_orders = []
    for order in orders:
        await db.refresh(order, ["customer"])
        response_orders.append(await _build_order_response(order))
    return response_orders


@router.get("/orders/{order_id}", response_model=OrderSummaryResponse)
async def get_order(
    order_id: uuid.UUID,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get a single service request by ID."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    await db.refresh(order, ["customer"])
    return await _build_order_response(order)


@router.patch("/orders/{order_id}", response_model=OrderSummaryResponse)
async def update_order_status(
    order_id: uuid.UUID,
    payload: OrderStatusUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update order status and/or total price."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if payload.order_status:
        # Validate status value
        valid_statuses = [s.value for s in OrderStatus]
        if payload.order_status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid order_status. Must be one of: {valid_statuses}",
            )
        order.order_status = OrderStatus(payload.order_status)

    if payload.total_price is not None:
        if payload.total_price < 0:
            raise HTTPException(
                status_code=400,
                detail="total_price must be non-negative",
            )
        order.total_price = round(payload.total_price, 2)

    await db.commit()
    await db.refresh(order, ["customer"])
    return await _build_order_response(order)


@router.patch("/orders/{order_id}/status")
async def update_order_status_only(
    order_id: uuid.UUID,
    payload: OrderStatusUpdateSimple,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Dedicated endpoint to update only the order status.
    Only allows: pending, successful.
    Returns 400 for invalid status, 404 if order not found.
    """
    allowed_statuses = {"pending", "completed"}
    if payload.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{payload.status}'. Allowed values: {', '.join(sorted(allowed_statuses))}",
        )

    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.order_status = OrderStatus(payload.status)
    await db.commit()
    await db.refresh(order, ["customer"])

    return {
        "message": "Order status updated successfully",
        "order": await _build_order_response(order),
    }


@router.delete("/orders/{order_id}", status_code=204)
async def delete_order(
    order_id: uuid.UUID,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete a service request."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    await db.delete(order)
    await db.commit()


# ── Customers ──────────────────────────────────────────────────────────────────
@router.get("/customers", response_model=List[CustomerResponse])
async def list_customers(
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all customers."""
    result = await db.execute(
        select(Customer).order_by(Customer.created_at.desc())
    )
    customers = result.scalars().all()
    return [CustomerResponse.model_validate(c) for c in customers]


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: uuid.UUID,
    admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get a single customer."""
    result = await db.execute(select(Customer).where(Customer.id == customer_id))
    customer = result.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return CustomerResponse.model_validate(customer)