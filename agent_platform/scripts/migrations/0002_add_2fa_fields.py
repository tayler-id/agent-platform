from alembic import op
import sqlalchemy as sa

def upgrade():
    # Add 2FA related columns
    op.add_column('users', sa.Column('totp_secret', sa.String(), nullable=True))
    op.add_column('users', sa.Column('totp_enabled', sa.Boolean(), server_default='0', nullable=False))
    
    # Update existing users to have 2FA disabled by default
    op.execute("UPDATE users SET totp_enabled = 0")

def downgrade():
    # Remove 2FA columns
    op.drop_column('users', 'totp_enabled')
    op.drop_column('users', 'totp_secret')
