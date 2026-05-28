from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
import json

class Card(BaseModel):
    suit: str
    value: str
    score: int

class PlayerCreate(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    balance: int = Field(1000, ge=10, le=100000)

class PlayerUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=1, max_length=50)
    balance: Optional[int] = Field(None, ge=0)

class PlayerResponse(BaseModel):
    id: int
    username: str
    balance: int

    model_config = {"from_attributes": True}

class GameLogCreate(BaseModel):
    player_hand: List[Card]
    dealer_hand: List[Card]
    player_score: int
    dealer_score: int
    bet: int
    outcome: str # "win", "lose", "push", "blackjack"
    profit: int
    note: Optional[str] = None

class GameLogUpdateNote(BaseModel):
    note: str = Field(..., max_length=200)

class GameLogResponse(BaseModel):
    id: int
    player_id: int
    player_hand: List[Card]
    dealer_hand: List[Card]
    player_score: int
    dealer_score: int
    bet: int
    outcome: str
    profit: int
    note: Optional[str]
    timestamp: datetime

    # Beautiful Pydantic validator to auto-decode the JSON string from DB into a List of Cards
    @field_validator("player_hand", "dealer_hand", mode="before")
    @classmethod
    def parse_json_hand(cls, value):
        if isinstance(value, str):
            try:
                return json.loads(value)
            except Exception:
                return []
        return value

    model_config = {"from_attributes": True}

class StatsResponse(BaseModel):
    total_games: int
    wins: int
    losses: int
    pushes: int
    win_rate: float
    net_profit: int
    high_streak: int
    max_winnings: int
    blackjacks_count: int
