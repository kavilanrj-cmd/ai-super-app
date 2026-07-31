"""initial schema baseline

Revision ID: 0001
Revises:
Create Date: 2026-07-31

This baseline creates the full schema for a fresh deployment. Table
definitions are sourced from the SQLAlchemy models so the schema always
matches the application (no existing models were modified).
"""
from alembic import op

from app.core.database import Base
from app.models import user, chat, document, job, task, resume, report, notification, meeting, setting, analytics  # noqa: F401

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
