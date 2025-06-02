from pydantic import BaseModel
from datetime import datetime

# Stock Holdings Schemas
class StockHoldingBase(BaseModel):
    name: str
    isin: str
    quantity: float
    avg_buy_price: float
    buy_value: float
    closing_price: float
    closing_value: float
    unrealized_pnl: float

class StockHoldingResponse(StockHoldingBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True

# Mutual Fund Holdings Schemas
class MutualFundHoldingBase(BaseModel):
    scheme_name: str
    amc: str
    category: str
    sub_category: str
    folio_no: str
    source: str
    units: float
    invested_value: float
    current_value: float
    returns: float
    xirr: str

class MutualFundHoldingResponse(MutualFundHoldingBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True 