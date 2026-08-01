"""add password column

Revision ID: 1d00eca17ef1
Revises: 8e877c9731d3
Create Date: 2026-08-01 17:03:10.437059

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1d00eca17ef1'
down_revision: Union[str, Sequence[str], None] = '8e877c9731d3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'admin_users',
        sa.Column('password', sa.String(length=255), nullable=True)
    )

    op.execute(
        "UPDATE admin_users SET password = 'temporary_password_change_me'"
    )

    op.alter_column(
        'admin_users',
        'password',
        nullable=False
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("admin_users", "password")