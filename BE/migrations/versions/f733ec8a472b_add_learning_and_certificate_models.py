"""add_learning_and_certificate_models

Revision ID: f733ec8a472b
Revises: 59628dea39ff
Create Date: 2025-05-11 01:02:59.125705

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func


# revision identifiers, used by Alembic.
revision = 'f733ec8a472b'
down_revision = '59628dea39ff'
branch_labels = None
depends_on = None


def upgrade() -> None:
    ### Create specialisations table ###
    op.create_table('specialisations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.Unicode(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_specialisations'))
    )
    op.create_index(op.f('ix_specialisations_id'), 'specialisations', ['id'], unique=False)
    op.create_index(op.f('ix_specialisations_name'), 'specialisations', ['name'], unique=True)

    # ### Create courses table ###
    op.create_table('courses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.Unicode(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('specialisation_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['specialisation_id'], ['specialisations.id'], name=op.f('fk_courses_specialisation_id_specialisations')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_courses'))
    )
    op.create_index(op.f('ix_courses_id'), 'courses', ['id'], unique=False)
    op.create_index(op.f('ix_courses_name'), 'courses', ['name'], unique=False) # Assuming name isn't globally unique for courses

    ### Create user_courses association table ###
    op.create_table('user_courses',
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=False),
        sa.Column('enrolled_at', sa.DateTime(), server_default=func.now(), nullable=True),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], name=op.f('fk_user_courses_course_id_courses'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], name=op.f('fk_user_courses_user_id_user'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id', 'course_id', name=op.f('pk_user_courses'))
    )

    ### Create user_specialisations association table ###
    op.create_table('user_specialisations',
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('specialisation_id', sa.Integer(), nullable=False),
        sa.Column('enrolled_at', sa.DateTime(), server_default=func.now(), nullable=True),
        sa.ForeignKeyConstraint(['specialisation_id'], ['specialisations.id'], name=op.f('fk_user_specialisations_specialisation_id_specialisations'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], name=op.f('fk_user_specialisations_user_id_user'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id', 'specialisation_id', name=op.f('pk_user_specialisations'))
    )

    ### Create certificates table ###
    op.create_table('certificates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('issue_date', sa.DateTime(), server_default=func.now(), nullable=False),
        sa.Column('certificate_url', sa.Unicode(length=255), nullable=True),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('course_id', sa.Integer(), nullable=True),
        sa.Column('specialisation_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], name=op.f('fk_certificates_course_id_courses')),
        sa.ForeignKeyConstraint(['specialisation_id'], ['specialisations.id'], name=op.f('fk_certificates_specialisation_id_specialisations')),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], name=op.f('fk_certificates_user_id_user'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_certificates')),
        sa.UniqueConstraint('certificate_url', name=op.f('uq_certificates_certificate_url')),
        sa.CheckConstraint(
            '(course_id IS NOT NULL AND specialisation_id IS NULL) OR (course_id IS NULL AND specialisation_id IS NOT NULL)',
            name=op.f('ck_certificates_target_not_null_exclusive')
        )
    )
    op.create_index(op.f('ix_certificates_id'), 'certificates', ['id'], unique=False)


def downgrade() -> None:
    # ### Drop tables in reverse order of creation to respect foreign key constraints ###
    op.drop_index(op.f('ix_certificates_id'), table_name='certificates')
    op.drop_table('certificates') # Drops check constraint, unique constraint implicitly

    op.drop_table('user_specialisations')
    op.drop_table('user_courses')

    op.drop_index(op.f('ix_courses_name'), table_name='courses')
    op.drop_index(op.f('ix_courses_id'), table_name='courses')
    op.drop_table('courses')

    op.drop_index(op.f('ix_specialisations_name'), table_name='specialisations')
    op.drop_index(op.f('ix_specialisations_id'), table_name='specialisations')
    op.drop_table('specialisations')
