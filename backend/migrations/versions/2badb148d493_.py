"""empty message

Revision ID: 2badb148d493
Revises: 8a0e295af33c
Create Date: 2018-07-17 10:36:15.115326

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2badb148d493'
down_revision = '8a0e295af33c'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('resource', 'approved', sa.String())
    pass


def downgrade():
    op.alter_column('resource', 'approved', sa.Boolean())
    pass
