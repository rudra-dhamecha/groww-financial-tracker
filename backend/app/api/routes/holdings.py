from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
from io import BytesIO

from app.db.session import get_db
from app.models.models import User, StockHolding, MutualFundHolding
from app.schemas.holdings import StockHoldingResponse, MutualFundHoldingResponse
from app.api.routes.auth import get_current_user

router = APIRouter()

# --- Stock Holdings Endpoints ---
@router.post("/stock_holdings/upload", response_model=List[StockHoldingResponse])
async def upload_stock_holdings(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .xlsx files are allowed"
        )
    try:
        contents = await file.read()
        # Skip the first 10 rows, use row 11 as header
        df = pd.read_excel(BytesIO(contents), header=10)
        required_columns = [
            'Stock Name', 'ISIN', 'Quantity', 'Average buy price',
            'Buy value', 'Closing price', 'Closing value', 'Unrealised P&L'
        ]
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Excel file must contain all required columns: {required_columns}"
            )
        holdings = []
        for _, row in df.iterrows():
            holding = StockHolding(
                name=row['Stock Name'],
                isin=row['ISIN'],
                quantity=float(row['Quantity']),
                avg_buy_price=float(row['Average buy price']),
                buy_value=float(row['Buy value']),
                closing_price=float(row['Closing price']),
                closing_value=float(row['Closing value']),
                unrealized_pnl=float(row['Unrealised P&L']),
                owner_id=current_user.id
            )
            holdings.append(holding)
        db.query(StockHolding).filter(StockHolding.owner_id == current_user.id).delete()
        db.add_all(holdings)
        db.commit()
        return holdings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error processing file: {str(e)}"
        )

@router.get("/stock_holdings/", response_model=List[StockHoldingResponse])
async def get_stock_holdings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    holdings = db.query(StockHolding).filter(StockHolding.owner_id == current_user.id).all()
    return holdings

# --- Mutual Fund Holdings Endpoints ---
@router.post("/mutual_fund_holdings/upload", response_model=List[MutualFundHoldingResponse])
async def upload_mutual_fund_holdings(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .xlsx files are allowed"
        )
    try:
        contents = await file.read()
        # Skip the first 20 rows, use row 21 as header
        df = pd.read_excel(BytesIO(contents), header=20)
        required_columns = [
            'Scheme Name', 'AMC', 'Category', 'Sub-category', 'Folio No.', 'Source',
            'Units', 'Invested Value', 'Current Value', 'Returns', 'XIRR'
        ]
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Excel file must contain all required columns: {required_columns}"
            )
        
        # Drop rows where all values are NaN
        df = df.dropna(how='all')
        
        holdings = []
        for _, row in df.iterrows():
            # Skip rows where scheme name is NaN
            if pd.isna(row['Scheme Name']):
                continue
                
            # Convert numeric values, handling NaN
            units = float(row['Units']) if not pd.isna(row['Units']) else 0.0
            invested_value = float(row['Invested Value']) if not pd.isna(row['Invested Value']) else 0.0
            current_value = float(row['Current Value']) if not pd.isna(row['Current Value']) else 0.0
            returns = float(row['Returns']) if not pd.isna(row['Returns']) else 0.0
            
            # Convert string values, handling NaN
            scheme_name = str(row['Scheme Name']) if not pd.isna(row['Scheme Name']) else ''
            amc = str(row['AMC']) if not pd.isna(row['AMC']) else ''
            category = str(row['Category']) if not pd.isna(row['Category']) else ''
            sub_category = str(row['Sub-category']) if not pd.isna(row['Sub-category']) else ''
            folio_no = str(row['Folio No.']) if not pd.isna(row['Folio No.']) else ''
            source = str(row['Source']) if not pd.isna(row['Source']) else ''
            xirr = str(row['XIRR']) if not pd.isna(row['XIRR']) else ''
            
            holding = MutualFundHolding(
                scheme_name=scheme_name,
                amc=amc,
                category=category,
                sub_category=sub_category,
                folio_no=folio_no,
                source=source,
                units=units,
                invested_value=invested_value,
                current_value=current_value,
                returns=returns,
                xirr=xirr,
                owner_id=current_user.id
            )
            holdings.append(holding)
            
        db.query(MutualFundHolding).filter(MutualFundHolding.owner_id == current_user.id).delete()
        db.add_all(holdings)
        db.commit()
        return holdings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error processing file: {str(e)}"
        )

@router.get("/mutual_fund_holdings/", response_model=List[MutualFundHoldingResponse])
async def get_mutual_fund_holdings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    holdings = db.query(MutualFundHolding).filter(MutualFundHolding.owner_id == current_user.id).all()
    return holdings 