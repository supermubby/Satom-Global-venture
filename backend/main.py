import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import APP_TITLE, APP_VERSION
from database import get_db, init_db, async_session_factory
from models import Customer, Order, OrderStatus
from schemas import OrderCreate, OrderCreatedResponse, OrderSummaryResponse, CustomerResponse
from admin_routes import router as admin_router


# ── Lifespan (replaces deprecated on_event) ────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    await init_db()
    yield


# ── FastAPI Application ────────────────────────────────────────────────────────
app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173","https://satom-global-venture.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include Routers ────────────────────────────────────────────────────────────
app.include_router(admin_router)


# ── Helper: build full response from an Order ORM object ──────────────────────
async def _build_order_response(order: Order) -> OrderSummaryResponse:
    """Load relationships and return a fully populated response model."""
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


# ── POST /api/orders ──────────────────────────────────────────────────────────
@app.post("/api/orders", response_model=OrderCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_order(payload: OrderCreate) -> OrderCreatedResponse:
    """
    Create a new service/installation request.
    Each order represents a single service request (not a cart with multiple items).
    All database writes happen inside a single atomic transaction.
    """
    async with async_session_factory() as session:
        async with session.begin():
            # ── 1. Resolve or create Customer ─────────────────────────────
            email = payload.customer.email
            phone = payload.customer.phone_number

            result = await session.execute(
                select(Customer).where(
                    (Customer.email == email) | (Customer.phone_number == phone)
                )
            )
            existing_customer = result.scalar_one_or_none()

            if existing_customer:
                customer = existing_customer
            else:
                customer = Customer(
                    full_name=payload.customer.full_name,
                    email=email,
                    phone_number=phone,
                )
                session.add(customer)
                await session.flush()  # get customer.id

            # ── 2. Create Order (single service request) ──────────────────
            order = Order(
                customer_id=customer.id,
                service_name=payload.service_name,
                service_description=payload.service_description,
                installation_address=payload.installation_address,
                state_city=payload.state_city,
                total_price=round(payload.total_price, 2),
                order_status=OrderStatus.pending,
                special_instructions=payload.special_instructions,
            )
            session.add(order)
            await session.flush()

            # Ensure relationship is populated for the response
            order.customer = customer

        # ── Build and return response ─────────────────────────────────────
        summary = await _build_order_response(order)

        return OrderCreatedResponse(
            message="Order created successfully",
            order_id=order.id,
            order=summary,
        )