"""Blockchain API Routes — Enhanced with Transactions, Smart Contracts, Analytics"""
import hashlib
import json
import uuid
import random
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.blockchain.blockchain_service import blockchain_service
from app.models.blockchain_record import BlockchainRecord

router = APIRouter()

# ─── Request Models ───────────────────────────────────────────────────────────

class CertificateRequest(BaseModel):
    recipient_name: str
    certificate_type: str
    issuer: str
    description: str = ""
    details: Dict[str, Any] = {}
    skills: List[str] = []
    grade: str = ""


class DocumentVerifyRequest(BaseModel):
    content: str
    document_title: str = ""


class HashVerifyRequest(BaseModel):
    hash_value: str


class TransactionRequest(BaseModel):
    from_wallet: str
    to_wallet: str
    amount: float
    currency: str = "ETH"
    note: str = ""


class SmartContractRequest(BaseModel):
    contract_name: str
    contract_type: str = "standard"  # standard, escrow, voting, nft
    parties: List[str] = []
    terms: str = ""
    value: float = 0.0


class BulkCertificateRequest(BaseModel):
    recipients: List[Dict[str, Any]]
    certificate_type: str
    issuer: str
    description: str = ""


# ─── Chain ────────────────────────────────────────────────────────────────────

@router.get("/chain")
async def get_blockchain(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get the full blockchain."""
    result = await db.execute(select(BlockchainRecord).order_by(BlockchainRecord.block_index))
    records = result.scalars().all()

    chain_data = [
        {
            "index": r.block_index,
            "hash": r.block_hash,
            "previous_hash": r.previous_hash,
            "record_type": r.record_type,
            "data": r.data,
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
            "is_verified": r.is_verified,
            "issuer": r.issuer,
            "recipient": r.recipient,
            "description": r.description,
            "nonce": r.nonce,
        }
        for r in records
    ]

    # Count by type
    type_counts: Dict[str, int] = {}
    for r in records:
        type_counts[r.record_type] = type_counts.get(r.record_type, 0) + 1

    return {
        "chain": chain_data,
        "length": len(records),
        "is_valid": blockchain_service.is_valid(),
        "type_counts": type_counts,
        "genesis_time": chain_data[0]["timestamp"] if chain_data else None,
        "latest_hash": chain_data[-1]["hash"] if chain_data else None,
    }


# ─── Certificate ──────────────────────────────────────────────────────────────

@router.post("/certificate")
async def issue_certificate(
    body: CertificateRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Issue a blockchain-verified certificate."""
    cert_data = blockchain_service.generate_certificate(
        recipient_name=body.recipient_name,
        certificate_type=body.certificate_type,
        issuer=body.issuer,
        details={
            **body.details,
            "skills": body.skills,
            "grade": body.grade,
        },
    )

    block = await blockchain_service.add_record(
        db=db,
        data=cert_data,
        record_type="certificate",
        issuer=body.issuer,
        recipient=body.recipient_name,
        description=body.description or f"{body.certificate_type} Certificate for {body.recipient_name}",
    )

    return {
        "certificate_id": cert_data["certificate_id"],
        "block_hash": block["hash"],
        "block_index": block["index"],
        "certificate": cert_data,
        "qr_data": f"CERT:{cert_data['certificate_id']}:{block['hash'][:16]}",
        "verification_url": f"/api/v1/blockchain/verify/{block['hash']}",
    }


@router.post("/certificate/bulk")
async def bulk_issue_certificates(
    body: BulkCertificateRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Issue multiple certificates at once."""
    results = []
    for recipient in body.recipients[:50]:  # cap at 50
        cert_data = blockchain_service.generate_certificate(
            recipient_name=recipient.get("name", "Unknown"),
            certificate_type=body.certificate_type,
            issuer=body.issuer,
            details=recipient,
        )
        block = await blockchain_service.add_record(
            db=db,
            data=cert_data,
            record_type="certificate",
            issuer=body.issuer,
            recipient=recipient.get("name", "Unknown"),
            description=body.description,
        )
        results.append({
            "recipient": recipient.get("name"),
            "certificate_id": cert_data["certificate_id"],
            "block_hash": block["hash"],
        })

    return {"issued": len(results), "certificates": results}


# ─── Transaction ──────────────────────────────────────────────────────────────

@router.post("/transaction")
async def add_transaction(
    body: TransactionRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Record a blockchain transaction."""
    tx_id = f"TX-{uuid.uuid4().hex[:12].upper()}"
    tx_hash = hashlib.sha256(
        f"{body.from_wallet}{body.to_wallet}{body.amount}{datetime.now(timezone.utc).isoformat()}".encode()
    ).hexdigest()

    tx_data = {
        "transaction_id": tx_id,
        "tx_hash": tx_hash,
        "from_wallet": body.from_wallet,
        "to_wallet": body.to_wallet,
        "amount": body.amount,
        "currency": body.currency,
        "note": body.note,
        "gas_fee": round(body.amount * 0.001, 6),
        "status": "confirmed",
    }

    block = await blockchain_service.add_record(
        db=db,
        data=tx_data,
        record_type="transaction",
        issuer=body.from_wallet,
        recipient=body.to_wallet,
        description=f"Transfer {body.amount} {body.currency}: {body.note}",
    )

    return {
        "transaction_id": tx_id,
        "tx_hash": tx_hash,
        "block_hash": block["hash"],
        "block_index": block["index"],
        "gas_fee": tx_data["gas_fee"],
        "status": "confirmed",
    }


# ─── Smart Contract ───────────────────────────────────────────────────────────

@router.post("/smart-contract")
async def deploy_smart_contract(
    body: SmartContractRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Deploy a simulated smart contract to blockchain."""
    contract_id = f"SC-{uuid.uuid4().hex[:10].upper()}"
    contract_address = f"0x{hashlib.sha256(contract_id.encode()).hexdigest()[:40]}"

    contract_data = {
        "contract_id": contract_id,
        "contract_address": contract_address,
        "contract_name": body.contract_name,
        "contract_type": body.contract_type,
        "parties": body.parties,
        "terms": body.terms,
        "value": body.value,
        "status": "deployed",
        "bytecode_hash": hashlib.sha256(body.terms.encode()).hexdigest()[:32],
        "abi": {"version": "0.8.0", "functions": ["execute", "verify", "terminate"]},
    }

    block = await blockchain_service.add_record(
        db=db,
        data=contract_data,
        record_type="smart_contract",
        issuer=current_user.email,
        description=f"Smart Contract: {body.contract_name} ({body.contract_type})",
    )

    return {
        "contract_id": contract_id,
        "contract_address": contract_address,
        "block_hash": block["hash"],
        "block_index": block["index"],
        "status": "deployed",
        "contract": contract_data,
    }


# ─── Document ─────────────────────────────────────────────────────────────────

@router.post("/document/register")
async def register_document(
    body: DocumentVerifyRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Register document hash on blockchain."""
    doc_hash = hashlib.sha256(body.content.encode()).hexdigest()

    block = await blockchain_service.add_record(
        db=db,
        data={
            "document_title": body.document_title,
            "document_hash": doc_hash,
            "registered_by": current_user.email,
            "size_bytes": len(body.content),
        },
        record_type="document",
        issuer=current_user.email,
        description=f"Document: {body.document_title}",
    )

    return {
        "document_hash": doc_hash,
        "block_hash": block["hash"],
        "block_index": block["index"],
        "registered": True,
    }


# ─── Verify ───────────────────────────────────────────────────────────────────

@router.post("/verify/hash")
async def verify_hash(
    body: HashVerifyRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Verify a hash against the blockchain."""
    result = await db.execute(
        select(BlockchainRecord).where(
            (BlockchainRecord.block_hash == body.hash_value) |
            (BlockchainRecord.data_hash == body.hash_value)
        )
    )
    record = result.scalar_one_or_none()

    if not record:
        all_res = await db.execute(select(BlockchainRecord))
        for r in all_res.scalars().all():
            if r.data and isinstance(r.data, dict):
                if (r.data.get("document_hash") == body.hash_value or
                    r.data.get("tx_hash") == body.hash_value or
                    r.data.get("contract_id") == body.hash_value):
                    record = r
                    break

    if record:
        return {
            "verified": True,
            "block_index": record.block_index,
            "record_type": record.record_type,
            "timestamp": record.timestamp.isoformat(),
            "issuer": record.issuer,
            "recipient": record.recipient,
            "data": record.data,
            "chain_position": f"Block #{record.block_index}",
        }
    return {"verified": False, "message": "Hash not found in blockchain. Record may not exist or was tampered."}


@router.get("/verify/{block_hash}")
async def verify_by_hash(
    block_hash: str,
    db: AsyncSession = Depends(get_db),
):
    """Public verification endpoint (no auth)."""
    result = await db.execute(
        select(BlockchainRecord).where(BlockchainRecord.block_hash == block_hash)
    )
    record = result.scalar_one_or_none()
    if record:
        return {
            "verified": True,
            "valid": True,
            "block_index": record.block_index,
            "record_type": record.record_type,
            "timestamp": record.timestamp.isoformat(),
            "data": record.data,
        }
    return {"verified": False, "message": "Record not found"}


# ─── Analytics ────────────────────────────────────────────────────────────────

@router.get("/analytics")
async def get_blockchain_analytics(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Blockchain analytics — block counts, activity chart, type distribution."""
    result = await db.execute(select(BlockchainRecord).order_by(BlockchainRecord.block_index))
    records = result.scalars().all()

    type_counts: Dict[str, int] = {}
    daily_counts: Dict[str, int] = {}

    for r in records:
        type_counts[r.record_type] = type_counts.get(r.record_type, 0) + 1
        if r.timestamp:
            day = r.timestamp.strftime("%Y-%m-%d")
            daily_counts[day] = daily_counts.get(day, 0) + 1

    activity_chart = [{"date": d, "blocks": c} for d, c in sorted(daily_counts.items())]

    # Simulated hash rate
    hash_rate = round(len(records) * 1.84, 2)

    return {
        "total_blocks": len(records),
        "chain_valid": blockchain_service.is_valid(),
        "type_distribution": [
            {"type": k, "count": v, "percentage": round(v / max(len(records), 1) * 100, 1)}
            for k, v in type_counts.items()
        ],
        "activity_chart": activity_chart,
        "hash_rate": hash_rate,
        "avg_block_size": 512,
        "total_transactions": type_counts.get("transaction", 0),
        "total_certificates": type_counts.get("certificate", 0),
        "total_contracts": type_counts.get("smart_contract", 0),
    }


# ─── Audit Trail ──────────────────────────────────────────────────────────────

@router.post("/audit-trail")
async def add_audit_trail(
    description: str,
    metadata: Dict[str, Any] = {},
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Add immutable audit trail entry."""
    block = await blockchain_service.add_record(
        db=db,
        data={"action": description, "user": current_user.email, "metadata": metadata},
        record_type="audit",
        issuer=current_user.email,
        description=description,
    )
    return {"block_hash": block["hash"], "recorded": True}
