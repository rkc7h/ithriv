"""empty message

Revision ID: d3e9fe2b05a2
Revises: 1ba46280f27d
Create Date: 2018-08-23 05:39:56.412407

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd3e9fe2b05a2'
down_revision = '1ba46280f27d'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('ithriv_user', sa.Column('division', sa.String(), nullable=True))
    op.add_column('ithriv_user', sa.Column('institutional_role', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('ithriv_user', 'institutional_role')
    op.drop_column('ithriv_user', 'division')
    # ### end Alembic commands ###
