"""add_new_columns

Revision ID: f733ec8a472c
Revises: f733ec8a472b
Create Date: 2025-05-11 01:02:59.125705

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func


# revision identifiers, used by Alembic.
revision = 'f733ec8a472c'
down_revision = 'f733ec8a472b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    ### Create specialisations table ###
    op.add_column('specialisations',
        sa.Column(
            'created_at',
            sa.DateTime(),
            nullable=False,
            server_default=func.now() # Sets default value at database level
        )
    )
    # Add updated_at column to specialisations table
    op.add_column('specialisations',
        sa.Column(
            'updated_at',
            sa.DateTime(),
            nullable=False,
            server_default=func.now(), # Sets default value at database level for creation
            server_onupdate=func.now() # Sets value at database level on update
        )
    )

    op.add_column('courses',
        sa.Column(
            'created_at',
            sa.DateTime(),
            nullable=False,
            server_default=func.now() # Sets default value at database level
        )
    )
    op.add_column('courses',
        sa.Column(
            'updated_at',
            sa.DateTime(),
            nullable=False,
            server_default=func.now(), # Sets default value at database level for creation
            server_onupdate=func.now() # Sets value at database level on update
        )
    )

    op.add_column('certificates',
        sa.Column(
            'created_at',
            sa.DateTime(),
            nullable=False,
            server_default=func.now() # Sets default value at database level
        )
    )

    op.add_column('certificates',
        sa.Column(
            'updated_at',
            sa.DateTime(),
            nullable=False,
            server_default=func.now(), # Sets default value at database level for creation  
            server_onupdate=func.now() # Sets value at database level on update
        )
    )
    
def downgrade() -> None:
    # ### Drop tables in reverse order of creation to respect foreign key constraints ###
    op.drop_column('specialisations', 'updated_at')
    op.drop_column('specialisations', 'created_at')
    op.drop_column('courses', 'updated_at')
    op.drop_column('courses', 'created_at')
    op.drop_column('certificates', 'updated_at')
    op.drop_column('certificates', 'created_at')
