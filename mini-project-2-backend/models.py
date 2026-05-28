from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False, unique=True)
    balance = Column(Integer, default=1000, nullable=False)

    # One-to-many relationship with cascade delete
    logs = relationship("GameLog", back_populates="player", cascade="all, delete-orphan")

class GameLog(Base):
    __tablename__ = "game_logs"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id", ondelete="CASCADE"), nullable=False)
    
    # Store serialized card lists as JSON strings
    player_hand = Column(String, nullable=False)
    dealer_hand = Column(String, nullable=False)
    
    player_score = Column(Integer, nullable=False)
    dealer_score = Column(Integer, nullable=False)
    bet = Column(Integer, nullable=False)
    outcome = Column(String, nullable=False) # "win", "lose", "push", "blackjack"
    profit = Column(Integer, nullable=False) # positive for wins, negative for losses
    note = Column(String, nullable=True) # Custom annotations/notes for CRUD updating
    
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationship back to parent player
    player = relationship("Player", back_populates="logs")
