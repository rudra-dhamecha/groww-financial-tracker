from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, holdings
from app.core.config import settings
from app.db.session import engine
from app.models import models

app = FastAPI(
    title="Finance Portfolio Tracker",
    description="API for tracking and analyzing investment portfolios",
    version="1.0.0"
)

# Create tables if they do not exist
@app.on_event("startup")
def on_startup():
    models.Base.metadata.create_all(bind=engine)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(holdings.router, prefix="/api", tags=["Holdings"])

@app.get("/")
async def root():
    return {"message": "Welcome to Finance Portfolio Tracker API"}