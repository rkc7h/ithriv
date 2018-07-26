"""empty message

Revision ID: e90fc725c5ab
Revises: 4ba139a7fa04
Create Date: 2018-07-09 15:47:35.762956

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e90fc725c5ab'
down_revision = '4ba139a7fa04'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('resource', sa.Column('approved', sa.Boolean(), nullable=True))
    op.add_column('resource', sa.Column('contact_email', sa.String(), nullable=True))
    op.add_column('resource', sa.Column('contact_notes', sa.String(), nullable=True))
    op.add_column('resource', sa.Column('contact_phone', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('resource', 'contact_phone')
    op.drop_column('resource', 'contact_notes')
    op.drop_column('resource', 'contact_email')
    op.drop_column('resource', 'approved')
    # ### end Alembic commands ###