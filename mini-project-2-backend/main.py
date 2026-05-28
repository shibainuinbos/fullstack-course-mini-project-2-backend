from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import datetime
from typing import List

from database import get_db, engine, SessionLocal
from models import Base, Player, GameLog
from schemas import (
    PlayerCreate, PlayerUpdate, PlayerResponse,
    GameLogCreate, GameLogUpdateNote, GameLogResponse,
    StatsResponse
)

# Create tables in the database if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Blackjack Casino Royale API", version="1.0.0")

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to seed default data if database is empty
@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    try:
        if db.query(Player).count() == 0:
            # Seed 3 distinct player profiles
            p1 = Player(username="Dongchao (High Roller)", balance=5250)
            p2 = Player(username="Alice (Card Counter)", balance=1650)
            p3 = Player(username="Beginner Bob", balance=400)
            db.add_all([p1, p2, p3])
            db.commit()
            db.refresh(p1)
            db.refresh(p2)
            db.refresh(p3)
            
            # Seed 5 sample logs for Dongchao
            logs_p1 = [
                GameLog(
                    player_id=p1.id,
                    player_hand=json.dumps([{"suit": "♠️", "value": "A", "score": 11}, {"suit": "♦️", "value": "K", "score": 10}]),
                    dealer_hand=json.dumps([{"suit": "❤️", "value": "8", "score": 8}, {"suit": "♣️", "value": "J", "score": 10}]),
                    player_score=21,
                    dealer_score=18,
                    bet=500,
                    outcome="blackjack",
                    profit=750,
                    note="Natural blackjack! Pays 3:2.",
                    timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=4)
                ),
                GameLog(
                    player_id=p1.id,
                    player_hand=json.dumps([{"suit": "♣️", "value": "8", "score": 8}, {"suit": "♦️", "value": "9", "score": 9}]),
                    dealer_hand=json.dumps([{"suit": "♠️", "value": "A", "score": 11}, {"suit": "❤️", "value": "9", "score": 9}]),
                    player_score=17,
                    dealer_score=20,
                    bet=200,
                    outcome="lose",
                    profit=-200,
                    note="Dealer hit 20. Tough break.",
                    timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=3.5)
                ),
                GameLog(
                    player_id=p1.id,
                    player_hand=json.dumps([{"suit": "♦️", "value": "10", "score": 10}, {"suit": "❤️", "value": "10", "score": 10}]),
                    dealer_hand=json.dumps([{"suit": "♣️", "value": "6", "score": 6}, {"suit": "♠️", "value": "Q", "score": 10}, {"suit": "❤️", "value": "4", "score": 4}]),
                    player_score=20,
                    dealer_score=20,
                    bet=300,
                    outcome="push",
                    profit=0,
                    note="Pushed on 20. Neither wins.",
                    timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=3)
                ),
                GameLog(
                    player_id=p1.id,
                    player_hand=json.dumps([{"suit": "❤️", "value": "Q", "score": 10}, {"suit": "♠️", "value": "6", "score": 6}, {"suit": "♦️", "value": "5", "score": 5}]),
                    dealer_hand=json.dumps([{"suit": "♣️", "value": "K", "score": 10}, {"suit": "♦️", "value": "8", "score": 8}]),
                    player_score=21,
                    dealer_score=18,
                    bet=400,
                    outcome="win",
                    profit=400,
                    note="Hit on 16 and pulled a 5 for 21! Lucky!",
                    timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=2.5)
                ),
                GameLog(
                    player_id=p1.id,
                    player_hand=json.dumps([{"suit": "♠️", "value": "10", "score": 10}, {"suit": "❤️", "value": "2", "score": 2}, {"suit": "♣️", "value": "9", "score": 9}]),
                    dealer_hand=json.dumps([{"suit": "♦️", "value": "J", "score": 10}, {"suit": "♠️", "value": "8", "score": 8}]),
                    player_score=21,
                    dealer_score=18,
                    bet=300,
                    outcome="win",
                    profit=300,
                    note="Double down worked out perfectly.",
                    timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
                )
            ]
            db.add_all(logs_p1)
            
            # Seed 5 sample logs for Alice
            logs_p2 = [
                GameLog(
                    player_id=p2.id,
                    player_hand=json.dumps([{"suit": "♣️", "value": "Q", "score": 10}, {"suit": "❤️", "value": "J", "score": 10}]),
                    dealer_hand=json.dumps([{"suit": "♦️", "value": "7", "score": 7}, {"suit": "♠️", "value": "10", "score": 10}]),
                    player_score=20,
                    dealer_score=17,
                    bet=100,
                    outcome="win",
                    profit=100,
                    note="Stood on 20. Clean victory.",
                    timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=3.8)
                ),
                GameLog(
                    player_id=p2.id,
                    player_hand=json.dumps([{"suit": "❤️", "value": "3", "score": 3}, {"suit": "♣️", "value": "4", "score": 4}, {"suit": "♦️", "value": "J", "score": 10}, {"suit": "♠️", "value": "4", "score": 4}]),
                    dealer_hand=json.dumps([{"suit": "♠️", "value": "A", "score": 11}, {"suit": "❤️", "value": "8", "score": 8}]),
                    player_score=21,
                    dealer_score=19,
                    bet=150,
                    outcome="win",
                    profit=150,
                    note="Four-card 21! Incredible count execution.",
                    timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=3.2)
                ),
                GameLog(
                    player_id=p2.id,
                    player_hand=json.dumps([{"suit": "♦️", "value": "10", "score": 10}, {"suit": "♣️", "value": "6", "score": 6}, {"suit": "❤️", "value": "J", "score": 10}]),
                    dealer_hand=json.dumps([{"suit": "♠️", "value": "6", "score": 6}, {"suit": "♦️", "value": "9", "score": 9}]),
                    player_score=26,
                    dealer_score=15,
                    bet=200,
                    outcome="lose",
                    profit=-200,
                    note="Busted on 16. Greed got the better of me.",
                    timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=2.6)
                ),
                GameLog(
                    player_id=p2.id,
                    player_hand=json.dumps([{"suit": "♠️", "value": "A", "score": 11}, {"suit": "❤️", "value": "5", "score": 5}, {"suit": "♣️", "value": "5", "score": 5}]),
                    dealer_hand=json.dumps([{"suit": "♦️", "value": "5", "score": 5}, {"suit": "♠️", "value": "10", "score": 10}, {"suit": "❤️", "value": "3", "score": 3}]),
                    player_score=21,
                    dealer_score=18,
                    bet=300,
                    outcome="win",
                    profit=300,
                    note="Hit soft 16, landed a 5 for 21. Pure skill.",
                    timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=2.0)
                ),
                GameLog(
                    player_id=p2.id,
                    player_hand=json.dumps([{"suit": "♣️", "value": "9", "score": 9}, {"suit": "♦️", "value": "9", "score": 9}]),
                    dealer_hand=json.dumps([{"suit": "❤️", "value": "10", "score": 10}, {"suit": "♠️", "value": "8", "score": 8}]),
                    player_score=18,
                    dealer_score=18,
                    bet=250,
                    outcome="push",
                    profit=0,
                    note="Stood on 18. Match pushed.",
                    timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=1.4)
                )
            ]
            db.add_all(logs_p2)
            db.commit()
    except Exception as e:
        db.rollback()
        print("Startup seeding failed:", e)
    finally:
        db.close()

# ==========================================
# PLAYER ENDPOINTS (CRUD)
# ==========================================

@app.get("/players", response_model=List[PlayerResponse])
def get_players(db: Session = Depends(get_db)):
    """READ (ALL) players"""
    return db.query(Player).order_by(Player.id.desc()).all()

@app.get("/players/{player_id}", response_model=PlayerResponse)
def get_player(player_id: int, db: Session = Depends(get_db)):
    """READ (ONE) player"""
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player profile not found")
    return player

@app.post("/players", response_model=PlayerResponse, status_code=201)
def create_player(player_data: PlayerCreate, db: Session = Depends(get_db)):
    """CREATE player profile"""
    # Check if username is already taken
    existing = db.query(Player).filter(Player.username == player_data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username is already taken")
    
    player = Player(username=player_data.username, balance=player_data.balance)
    db.add(player)
    db.commit()
    db.refresh(player)
    return player

@app.put("/players/{player_id}", response_model=PlayerResponse)
def update_player(player_id: int, updates: PlayerUpdate, db: Session = Depends(get_db)):
    """UPDATE player details (balance/username)"""
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player profile not found")
    
    if updates.username is not None:
        # Check if username is taken by someone else
        existing = db.query(Player).filter(Player.username == updates.username, Player.id != player_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username is already taken")
        player.username = updates.username
        
    if updates.balance is not None:
        player.balance = updates.balance
        
    db.commit()
    db.refresh(player)
    return player

@app.delete("/players/{player_id}")
def delete_player(player_id: int, db: Session = Depends(get_db)):
    """DELETE player profile (cascades and deletes all game logs)"""
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player profile not found")
    
    db.delete(player)
    db.commit()
    return {"message": f"Player '{player.username}' has been successfully retired."}


# ==========================================
# GAME LOG ENDPOINTS (CRUD)
# ==========================================

@app.get("/players/{player_id}/logs", response_model=List[GameLogResponse])
def get_player_logs(player_id: int, db: Session = Depends(get_db)):
    """READ (ALL) game logs for a player"""
    # Verify player exists
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player profile not found")
        
    return db.query(GameLog).filter(GameLog.player_id == player_id).order_by(GameLog.timestamp.desc()).all()

@app.post("/players/{player_id}/logs", response_model=GameLogResponse, status_code=201)
def create_game_log(player_id: int, log_data: GameLogCreate, db: Session = Depends(get_db)):
    """CREATE a game log and atomically UPDATE player balance"""
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player profile not found")
    
    # Atomically adjust the player's balance in the database based on the profit
    player.balance += log_data.profit
    if player.balance < 0:
        player.balance = 0
        
    # Serialize hands to JSON strings before storing
    db_log = GameLog(
        player_id=player_id,
        player_hand=json.dumps([card.model_dump() for card in log_data.player_hand]),
        dealer_hand=json.dumps([card.model_dump() for card in log_data.dealer_hand]),
        player_score=log_data.player_score,
        dealer_score=log_data.dealer_score,
        bet=log_data.bet,
        outcome=log_data.outcome,
        profit=log_data.profit,
        note=log_data.note
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@app.put("/logs/{log_id}", response_model=GameLogResponse)
def update_game_log_note(log_id: int, updates: GameLogUpdateNote, db: Session = Depends(get_db)):
    """UPDATE a specific game log's annotations/notes"""
    log = db.query(GameLog).filter(GameLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Game log not found")
    
    log.note = updates.note
    db.commit()
    db.refresh(log)
    return log

@app.delete("/logs/{log_id}")
def delete_game_log(log_id: int, db: Session = Depends(get_db)):
    """DELETE a specific game log from a player's history"""
    log = db.query(GameLog).filter(GameLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Game log not found")
    
    db.delete(log)
    db.commit()
    return {"message": f"Game log #{log_id} has been deleted successfully."}


# ==========================================
# STATISTICS ENDPOINT
# ==========================================

@app.get("/players/{player_id}/stats", response_model=StatsResponse)
def get_player_stats(player_id: int, db: Session = Depends(get_db)):
    """READ statistics aggregation for a specific player"""
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player profile not found")
        
    logs = db.query(GameLog).filter(GameLog.player_id == player_id).order_by(GameLog.timestamp.asc()).all()
    
    total = len(logs)
    if total == 0:
        return {
            "total_games": 0,
            "wins": 0,
            "losses": 0,
            "pushes": 0,
            "win_rate": 0.0,
            "net_profit": 0,
            "high_streak": 0,
            "max_winnings": 0,
            "blackjacks_count": 0
        }
        
    wins = sum(1 for log in logs if log.outcome in ["win", "blackjack"])
    losses = sum(1 for log in logs if log.outcome == "lose")
    pushes = sum(1 for log in logs if log.outcome == "push")
    blackjacks = sum(1 for log in logs if log.outcome == "blackjack")
    
    net_profit = sum(log.profit for log in logs)
    max_winnings = max(log.profit for log in logs) if logs else 0
    if max_winnings < 0:
        max_winnings = 0
        
    # Standard win rate = (wins / total_games) * 100
    win_rate = (wins / total) * 100
    
    # Calculate highest winning streak (consecutive wins/blackjacks)
    high_streak = 0
    current_streak = 0
    for log in logs:
        if log.outcome in ["win", "blackjack"]:
            current_streak += 1
            if current_streak > high_streak:
                high_streak = current_streak
        elif log.outcome == "push":
            # Pushes do not break win streaks in casino streaks
            pass
        else: # lose
            current_streak = 0
            
    return {
        "total_games": total,
        "wins": wins,
        "losses": losses,
        "pushes": pushes,
        "win_rate": round(win_rate, 1),
        "net_profit": net_profit,
        "high_streak": high_streak,
        "max_winnings": max_winnings,
        "blackjacks_count": blackjacks
    }
