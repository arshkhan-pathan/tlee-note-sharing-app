#!/usr/bin/env python3
"""
Database initialization script for Tlee Note Sharing App
This script creates all necessary tables and inserts the initial admin user.
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from core._db import Base, engine
from models._admin import AdminUser
from core._auth import get_password_hash

def init_database():
    """Initialize the database with all tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

def create_admin_user(username: str, email: str, password: str):
    """Create the initial admin user"""
    from core._db import SessionLocal
    
    db = SessionLocal()
    try:
        # Check if admin user already exists
        existing_admin = db.query(AdminUser).first()
        if existing_admin:
            print(f"⚠️  Admin user already exists: {existing_admin.username}")
            return
        
        # Create new admin user
        hashed_password = get_password_hash(password)
        admin_user = AdminUser(
            username=username,
            email=email,
            hashed_password=hashed_password,
            is_active=True,
            is_superuser=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"✅ Admin user created successfully!")
        print(f"   Username: {username}")
        print(f"   Email: {email}")
        print(f"   ID: {admin_user.id}")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Main function to initialize database and create admin user"""
    print("🚀 Initializing Tlee Note Sharing App Database...")
    print("=" * 50)
    
    # Initialize database tables
    init_database()
    
    # Get admin credentials from user input
    print("\n📝 Creating Admin User")
    print("-" * 30)
    
    username = input("Enter admin username: ").strip()
    if not username:
        print("❌ Username cannot be empty")
        return
    
    email = input("Enter admin email: ").strip()
    if not email:
        print("❌ Email cannot be empty")
        return
    
    password = input("Enter admin password: ").strip()
    if not password:
        print("❌ Password cannot be empty")
        return
    
    if len(password) < 6:
        print("❌ Password must be at least 6 characters long")
        return
    
    # Create admin user
    create_admin_user(username, email, password)
    
    print("\n🎉 Database initialization completed!")
    print("\nNext steps:")
    print("1. Set JWT_SECRET_KEY in your .env file")
    print("2. Start your FastAPI server")
    print("3. Use the admin credentials to login at /admin/login")

if __name__ == "__main__":
    main() 