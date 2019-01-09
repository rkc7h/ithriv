"""empty message

Revision ID: 4cc603fb7056
Revises: 7974a6660a3a
Create Date: 2018-11-28 17:31:16.397906

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4cc603fb7056'
down_revision = '7974a6660a3a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('resource', sa.Column('private', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('resource', 'private')
    # ### end Alembic commands ###