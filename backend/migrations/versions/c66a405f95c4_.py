"""empty message

Revision ID: c66a405f95c4
Revises: 4cc603fb7056
Create Date: 2018-12-04 16:13:10.229087

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c66a405f95c4'
down_revision = '4cc603fb7056'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('icon',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('url', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('institution',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('domain', sa.String(), nullable=True),
    sa.Column('hide_availability', sa.Boolean(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('category',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('brief_description', sa.String(), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('parent_id', sa.Integer(), nullable=True),
    sa.Column('color', sa.String(), nullable=True),
    sa.Column('image', sa.String(), nullable=True),
    sa.Column('display_order', sa.Integer(), nullable=True),
    sa.Column('icon_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['icon_id'], ['icon.id'], ),
    sa.ForeignKeyConstraint(['parent_id'], ['category.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('ithriv_user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('eppn', sa.String(), nullable=True),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('display_name', sa.String(), nullable=True),
    sa.Column('password', sa.Binary(), nullable=True),
    sa.Column('role', sa.String(), nullable=True),
    sa.Column('email_verified', sa.Boolean(), nullable=False),
    sa.Column('institution_id', sa.Integer(), nullable=True),
    sa.Column('institutional_role', sa.String(), nullable=True),
    sa.Column('division', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['institution_id'], ['institution.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('type',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('icon_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['icon_id'], ['icon.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('email_log',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('type', sa.String(), nullable=True),
    sa.Column('tracking_code', sa.String(), nullable=True),
    sa.Column('viewed', sa.Boolean(), nullable=True),
    sa.Column('date_viewed', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['ithriv_user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('resource',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('last_updated', sa.DateTime(), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('owner', sa.String(), nullable=True),
    sa.Column('contact_email', sa.String(), nullable=True),
    sa.Column('contact_phone', sa.String(), nullable=True),
    sa.Column('contact_notes', sa.String(), nullable=True),
    sa.Column('website', sa.String(), nullable=True),
    sa.Column('cost', sa.String(), nullable=True),
    sa.Column('type_id', sa.Integer(), nullable=True),
    sa.Column('institution_id', sa.Integer(), nullable=True),
    sa.Column('approved', sa.String(), nullable=True),
    sa.Column('private', sa.Boolean(), nullable=True),
    sa.ForeignKeyConstraint(['institution_id'], ['institution.id'], ),
    sa.ForeignKeyConstraint(['type_id'], ['type.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('availability',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('resource_id', sa.Integer(), nullable=True),
    sa.Column('institution_id', sa.Integer(), nullable=True),
    sa.Column('available', sa.Boolean(), nullable=True),
    sa.ForeignKeyConstraint(['institution_id'], ['institution.id'], ),
    sa.ForeignKeyConstraint(['resource_id'], ['resource.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('favorite',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('resource_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['resource_id'], ['resource.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['ithriv_user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('resource_category',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('resource_id', sa.Integer(), nullable=False),
    sa.Column('category_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['category_id'], ['category.id'], ),
    sa.ForeignKeyConstraint(['resource_id'], ['resource.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('uploaded_file',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('file_name', sa.String(), nullable=True),
    sa.Column('display_name', sa.String(), nullable=True),
    sa.Column('date_modified', sa.DateTime(), nullable=True),
    sa.Column('mime_type', sa.String(), nullable=True),
    sa.Column('size', sa.Integer(), nullable=True),
    sa.Column('md5', sa.String(), nullable=True),
    sa.Column('url', sa.String(), nullable=True),
    sa.Column('resource_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['resource_id'], ['resource.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('uploaded_file')
    op.drop_table('resource_category')
    op.drop_table('favorite')
    op.drop_table('availability')
    op.drop_table('resource')
    op.drop_table('email_log')
    op.drop_table('type')
    op.drop_table('ithriv_user')
    op.drop_table('category')
    op.drop_table('institution')
    op.drop_table('icon')
    # ### end Alembic commands ###
