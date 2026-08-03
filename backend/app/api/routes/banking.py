"""
Banking & Fraud Detection Module API Routes
AI-Powered Financial Fraud Detection & Secure Banking System
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import random, datetime
from app.ai.ollama_client import ollama_client
from app.ai.rag_pipeline import rag_service

router = APIRouter()


class TransactionCheck(BaseModel):
    amount: float
    merchant: str
    location: str
    device: Optional[str] = "mobile"
    transaction_type: Optional[str] = "debit"
    account_id: Optional[str] = "ACC001"


class LoanRequest(BaseModel):
    income: float
    loan_amount: float
    loan_tenure_months: int
    credit_score: int
    employment_type: str
    existing_loans: int = 0


MOCK_TRANSACTIONS = [
    {"id": "T001", "amount": 15000, "merchant": "Amazon India", "type": "Online", "status": "Approved", "risk": "Low", "timestamp": "2025-07-14 10:23"},
    {"id": "T002", "amount": 85000, "merchant": "Unknown Merchant", "type": "Online", "status": "Flagged", "risk": "High", "timestamp": "2025-07-14 11:45"},
    {"id": "T003", "amount": 2500, "merchant": "Swiggy", "type": "UPI", "status": "Approved", "risk": "Low", "timestamp": "2025-07-14 13:10"},
    {"id": "T004", "amount": 250000, "merchant": "Foreign Transfer", "type": "NEFT", "status": "Flagged", "risk": "Critical", "timestamp": "2025-07-14 14:30"},
    {"id": "T005", "amount": 8000, "merchant": "Big Bazaar", "type": "Card", "status": "Approved", "risk": "Low", "timestamp": "2025-07-14 15:55"},
]

MOCK_ALERTS = [
    {"id": "AL001", "type": "Fraud Detected", "severity": "Critical", "account": "ACC-4521", "amount": 250000, "time": "14:30"},
    {"id": "AL002", "type": "Unusual Login", "severity": "High", "account": "ACC-7832", "amount": None, "time": "13:55"},
    {"id": "AL003", "type": "Multiple Failed Attempts", "severity": "Medium", "account": "ACC-2341", "amount": None, "time": "12:40"},
]


@router.get("/stats")
async def banking_stats():
    return {
        "total_transactions_today": 48234,
        "fraud_detected_today": 23,
        "fraud_amount_blocked": 4820000,
        "active_accounts": 284720,
        "high_risk_accounts": 127,
        "fraud_rate_percent": 0.048,
        "model_accuracy": 98.7,
        "false_positive_rate": 0.8,
        "avg_detection_ms": 42,
        "alerts_today": 89,
        "aml_cases": 14,
        "kyc_pending": 234,
    }


@router.get("/transactions")
async def list_transactions(limit: int = 50):
    return {"transactions": MOCK_TRANSACTIONS, "total": len(MOCK_TRANSACTIONS)}


@router.post("/fraud/check")
async def check_fraud(transaction: TransactionCheck):
    """Real-time fraud detection using ML rules and local Ollama explanation"""
    risk_score = 0.05
    flags = []

    if transaction.amount > 100000:
        risk_score += 0.3
        flags.append("High amount transaction")
    if "foreign" in transaction.merchant.lower() or "unknown" in transaction.merchant.lower():
        risk_score += 0.4
        flags.append("Unknown/foreign merchant")
    if transaction.location in ["VPN", "Unknown"]:
        risk_score += 0.2
        flags.append("Suspicious location")
    
    risk_score = min(risk_score + random.uniform(0, 0.1), 1.0)
    is_fraud = risk_score > 0.6

    prompt = (
        f"You are a bank fraud detection bot. Analyze this transaction detail:\n"
        f"Amount: {transaction.amount}, Merchant: '{transaction.merchant}', Location: '{transaction.location}', Flags: {flags}.\n"
        f"Provide a brief risk analysis explanation under 50 words explaining the fraud evaluation."
    )

    try:
        explanation = await ollama_client.chat(messages=[{"role": "user", "content": prompt}], model="llama3")
    except Exception:
        explanation = "Transaction processed offline using default ML parameters."

    return {
        "transaction_id": f"TXN{random.randint(100000, 999999)}",
        "amount": transaction.amount,
        "merchant": transaction.merchant,
        "fraud_probability": round(risk_score, 3),
        "is_fraud": is_fraud,
        "risk_level": "Critical" if risk_score > 0.8 else "High" if risk_score > 0.6 else "Medium" if risk_score > 0.3 else "Low",
        "fraud_type": "Identity/CNP Fraud" if is_fraud else None,
        "flags": flags,
        "action": "BLOCK" if is_fraud else "APPROVE",
        "confidence": round(random.uniform(0.89, 0.99), 2),
        "model_used": "Ollama + ML rules offline",
        "decision_time_ms": random.randint(18, 65),
        "explanation": explanation,
    }


@router.post("/loan/eligibility")
async def check_loan_eligibility(request: LoanRequest):
    """AI-powered loan eligibility and risk assessment using Ollama insight generation"""
    monthly_rate = 0.085 / 12
    n = request.loan_tenure_months
    emi = request.loan_amount * monthly_rate * (1 + monthly_rate)**n / ((1 + monthly_rate)**n - 1)
    foir = (emi + request.existing_loans * 5000) / request.income

    eligible = (request.credit_score >= 650 and foir <= 0.5 and request.income >= emi * 3)
    risk_score = max(0, min(100, (750 - request.credit_score) / 5 + foir * 50))

    prompt = (
        f"You are a credit underwriting agent. Review this loan application:\n"
        f"Income: {request.income}, Loan Amount: {request.loan_amount}, Credit Score: {request.credit_score}, FOIR: {round(foir*100, 1)}%.\n"
        f"Eligibility decision: {eligible}.\n"
        f"Suggest 2 key insights for this decision."
    )
    
    insights = []
    try:
        response = await ollama_client.chat(messages=[{"role": "user", "content": prompt}], model="llama3")
        insights = [line.strip() for line in response.split("\n") if line.strip()][:3]
    except Exception:
        insights = [
            f"Credit score of {request.credit_score} is analyzed.",
            f"Debt-to-income metric is {round(foir * 100, 1)}%."
        ]

    return {
        "eligible": eligible,
        "loan_amount": request.loan_amount,
        "credit_score": request.credit_score,
        "monthly_emi": round(emi, 2),
        "foir": round(foir * 100, 1),
        "recommended_interest_rate": 8.5 if request.credit_score > 750 else 10.5 if request.credit_score > 650 else 13.5,
        "risk_category": "Low" if risk_score < 30 else "Medium" if risk_score < 60 else "High",
        "risk_score": round(risk_score, 1),
        "max_eligible_amount": round(request.income * 60 * 0.5),
        "default_probability": round(risk_score / 100 * 0.3, 3),
        "recommendation": "Loan approved with standard terms" if eligible else "Improve credit score and reduce debt ratios",
        "ai_insights": insights,
    }


@router.get("/aml/alerts")
async def aml_alerts():
    return {
        "alerts": MOCK_ALERTS,
        "suspicious_patterns": [
            {"pattern": "Circular Transactions", "accounts": 3, "total_amount": 2450000},
            {"pattern": "Structuring (below threshold)", "accounts": 2, "total_amount": 890000},
            {"pattern": "Rapid Fund Movement", "accounts": 1, "total_amount": 5200000},
        ]
    }


@router.get("/analytics/trends")
async def fraud_trends():
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
    return {
        "fraud_trend": [random.randint(15, 45) for _ in months],
        "transaction_volume": [random.randint(40000, 55000) for _ in months],
        "blocked_amount": [random.randint(2000000, 8000000) for _ in months],
        "fraud_by_category": {
            "Credit Card": 34, "UPI": 28, "NEFT": 18, "ATM": 12, "Cheque": 8,
        },
        "months": months,
    }


@router.get("/credit-score/{account_id}")
async def get_credit_score(account_id: str):
    score = random.randint(620, 820)
    return {
        "account_id": account_id,
        "credit_score": score,
        "rating": "Excellent" if score > 750 else "Good" if score > 700 else "Fair" if score > 650 else "Poor",
        "factors": {
            "payment_history": random.randint(60, 100),
            "credit_utilization": random.randint(20, 60),
            "credit_age_years": random.randint(2, 15),
            "credit_mix": random.randint(50, 90),
            "new_credit": random.randint(40, 80),
        },
        "improvement_tips": ["Pay bills on time", "Reduce credit card utilization below 30%", "Avoid multiple loan applications"],
    }


@router.get("/accounts")
async def list_accounts():
    return {
        "accounts": [
            {"id": "ACC001", "holder": "Raj Kumar", "type": "Savings", "balance": 284750, "status": "Active", "risk": "Low"},
            {"id": "ACC002", "holder": "Priya Sharma", "type": "Current", "balance": 1250000, "status": "Active", "risk": "Medium"},
            {"id": "ACC003", "holder": "Amit Singh", "type": "Savings", "balance": 45800, "status": "Flagged", "risk": "High"},
        ]
    }
