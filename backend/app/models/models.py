from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    stock_holdings = relationship("StockHolding", back_populates="owner")
    mutual_fund_holdings = relationship("MutualFundHolding", back_populates="owner")

class StockHolding(Base):
    __tablename__ = "stock_holdings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    isin = Column(String, index=True)
    ticker = Column(String, index=True, nullable=True)
    sector = Column(String, index=True, nullable=True, default="Others")
    quantity = Column(Float)
    avg_buy_price = Column(Float)
    buy_value = Column(Float)
    closing_price = Column(Float)
    closing_value = Column(Float)
    unrealized_pnl = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="stock_holdings")

class MutualFundHolding(Base):
    __tablename__ = "mutual_fund_holdings"

    id = Column(Integer, primary_key=True, index=True)
    scheme_name = Column(String, index=True)
    amc = Column(String)
    category = Column(String)
    sub_category = Column(String)
    folio_no = Column(String)
    source = Column(String)
    units = Column(Float)
    invested_value = Column(Float)
    current_value = Column(Float)
    returns = Column(Float)
    xirr = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="mutual_fund_holdings") 