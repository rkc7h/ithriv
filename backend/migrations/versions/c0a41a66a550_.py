"""empty message

Revision ID: c0a41a66a550
Revises: df7e4df7d800
Create Date: 2018-08-27 10:56:15.829348

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'c0a41a66a550'
down_revision = 'df7e4df7d800'
branch_labels = None
depends_on = None


def upgrade():

    op.alter_column('resource_attachment', 'name', new_column_name='file_name')
    op.add_column('resource_attachment', sa.Column('checksum', sa.Integer(), nullable=True))
    op.add_column('resource_attachment', sa.Column('date_modified', sa.DateTime(), nullable=True))
    op.add_column('resource_attachment', sa.Column('display_name', sa.String(), nullable=True))
    op.add_column('resource_attachment', sa.Column('mime_type', sa.String(), nullable=True))
    op.add_column('resource_attachment', sa.Column('size', sa.Integer(), nullable=True))


def downgrade():
    op.alter_column('resource_attachment', 'file_name', new_column_name='name')
    op.add_column('resource_attachment', sa.Column('name', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.drop_column('resource_attachment', 'size')
    op.drop_column('resource_attachment', 'mime_type')
    op.drop_column('resource_attachment', 'display_name')
    op.drop_column('resource_attachment', 'date_modified')
    op.drop_column('resource_attachment', 'checksum')
