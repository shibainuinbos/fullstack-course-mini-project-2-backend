import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables
load_dotenv()

# Retrieve database URL from environment or fallback to local SQLite
DATABASE_URL = os.getenv("DATABASE_URL")

# Self-healing: If PostgreSQL is requested but psycopg2 is not installed (common on Windows local dev hosts),
# automatically fallback to local SQLite to prevent crashes while preserving Docker PostgreSQL support.
if DATABASE_URL and DATABASE_URL.startswith("postgresql"):
    try:
        import psycopg2
    except ImportError:
        print("⚠️  Warning: PostgreSQL driver (psycopg2) not found in local environment.")
        print("👉 Automatically falling back to local SQLite database (sqlite:///./blackjack.db) for development.")
        DATABASE_URL = "sqlite:///./blackjack.db"

if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./blackjack.db"

# Special configuration required for SQLite multithreading support
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL, connect_args=connect_args)

# Create a local session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()

# Dependency to yield database sessions for requests
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
