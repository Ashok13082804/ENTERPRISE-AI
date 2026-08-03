"""
Local Blockchain Implementation
Immutable ledger for certificates, documents, audit trails
"""
import hashlib
import json
import time
from datetime import datetime
from typing import Dict, Any, List, Optional

from loguru import logger


class Block:
    """A single block in the blockchain."""

    def __init__(
        self,
        index: int,
        data: Dict[str, Any],
        previous_hash: str,
        record_type: str = "general",
    ):
        self.index = index
        self.timestamp = round(time.time(), 6)
        self.data = data
        self.previous_hash = previous_hash
        self.record_type = record_type
        self.nonce = 0
        self.hash = self._calculate_hash()

    def _calculate_hash(self) -> str:
        block_string = json.dumps(
            {
                "index": self.index,
                "timestamp": self.timestamp,
                "data": self.data,
                "previous_hash": self.previous_hash,
                "nonce": self.nonce,
                "record_type": self.record_type,
            },
            sort_keys=True,
        ).encode()
        return hashlib.sha256(block_string).hexdigest()

    def mine_block(self, difficulty: int = 2) -> None:
        """Simple Proof-of-Work mining."""
        target = "0" * difficulty
        while not self.hash.startswith(target):
            self.nonce += 1
            self.hash = self._calculate_hash()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "datetime": datetime.fromtimestamp(self.timestamp).isoformat(),
            "data": self.data,
            "previous_hash": self.previous_hash,
            "hash": self.hash,
            "nonce": self.nonce,
            "record_type": self.record_type,
        }


class LocalBlockchain:
    """Simple local blockchain for enterprise record integrity."""

    def __init__(self, difficulty: int = 2):
        self.chain: List[Block] = []
        self.difficulty = difficulty
        self._create_genesis_block()

    def _create_genesis_block(self):
        genesis = Block(
            index=0,
            data={"message": "Genesis Block — Unified Enterprise AI Platform"},
            previous_hash="0" * 64,
            record_type="genesis",
        )
        genesis.mine_block(self.difficulty)
        self.chain.append(genesis)

    @property
    def latest_block(self) -> Block:
        return self.chain[-1]

    def add_record(
        self,
        data: Dict[str, Any],
        record_type: str = "general",
    ) -> Block:
        """Add a new record to the blockchain."""
        new_block = Block(
            index=len(self.chain),
            data=data,
            previous_hash=self.latest_block.hash,
            record_type=record_type,
        )
        new_block.mine_block(self.difficulty)
        self.chain.append(new_block)
        logger.info(f"New block added: #{new_block.index} ({record_type})")
        return new_block

    def is_valid(self) -> bool:
        """Validate the entire blockchain."""
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]

            # Check hash integrity
            if current.hash != current._calculate_hash():
                return False
            if current.previous_hash != previous.hash:
                return False
        return True

    def verify_record(self, block_hash: str) -> Optional[Dict[str, Any]]:
        """Verify a specific record by its hash."""
        for block in self.chain:
            if block.hash == block_hash:
                return {
                    "verified": True,
                    "block": block.to_dict(),
                    "chain_valid": self.is_valid(),
                }
        return {"verified": False, "block": None}

    def get_records_by_type(self, record_type: str) -> List[Dict[str, Any]]:
        return [b.to_dict() for b in self.chain if b.record_type == record_type]

    def generate_document_hash(self, content: str) -> str:
        """Generate SHA-256 hash for document verification."""
        return hashlib.sha256(content.encode()).hexdigest()

    def to_dict(self) -> List[Dict[str, Any]]:
        return [block.to_dict() for block in self.chain]


class BlockchainService:
    """Service for blockchain operations with database persistence."""

    def __init__(self):
        self._blockchain = LocalBlockchain(difficulty=2)
        self._initialized = False

    async def initialize(self, db):
        """Load existing blocks from database."""
        from app.models.blockchain_record import BlockchainRecord
        from sqlalchemy import select
        
        try:
            result = await db.execute(
                select(BlockchainRecord).order_by(BlockchainRecord.block_index)
            )
            records = result.scalars().all()
            
            if records:
                # Reconstruct chain from DB
                self._blockchain.chain = []
                for rec in records:
                    from datetime import timezone
                    block = Block.__new__(Block)
                    block.index = rec.block_index
                    block.hash = rec.block_hash
                    block.previous_hash = rec.previous_hash
                    block.data = rec.data
                    block.record_type = rec.record_type
                    block.nonce = rec.nonce
                    block.timestamp = round(rec.timestamp.replace(tzinfo=timezone.utc).timestamp(), 6) if rec.timestamp else round(time.time(), 6)
                    self._blockchain.chain.append(block)
                logger.info(f"Blockchain loaded: {len(self._blockchain.chain)} blocks")
            
            self._initialized = True
        except Exception as e:
            logger.error(f"Blockchain init error: {e}")

    async def add_record(
        self,
        db,
        data: Dict[str, Any],
        record_type: str,
        issuer: str = None,
        recipient: str = None,
        description: str = None,
    ) -> Dict[str, Any]:
        """Add record to blockchain and persist to database."""
        from app.models.blockchain_record import BlockchainRecord
        
        block = self._blockchain.add_record(data, record_type)
        
        from datetime import timezone
        db_record = BlockchainRecord(
            block_index=block.index,
            block_hash=block.hash,
            previous_hash=block.previous_hash,
            record_type=record_type,
            data=block.data,
            data_hash=hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest(),
            issuer=issuer,
            recipient=recipient,
            description=description,
            nonce=block.nonce,
            timestamp=datetime.fromtimestamp(block.timestamp, tz=timezone.utc).replace(tzinfo=None),
        )
        db.add(db_record)
        await db.flush()
        
        return block.to_dict()

    def verify_hash(self, hash_value: str) -> Dict[str, Any]:
        return self._blockchain.verify_record(hash_value)

    def get_chain(self) -> List[Dict[str, Any]]:
        return self._blockchain.to_dict()

    def is_valid(self) -> bool:
        return self._blockchain.is_valid()

    def generate_certificate(
        self,
        recipient_name: str,
        certificate_type: str,
        issuer: str,
        details: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """Generate and record a verifiable certificate."""
        cert_data = {
            "recipient_name": recipient_name,
            "certificate_type": certificate_type,
            "issuer": issuer,
            "issued_at": datetime.utcnow().isoformat(),
            "details": details or {},
        }
        content_hash = hashlib.sha256(json.dumps(cert_data, sort_keys=True).encode()).hexdigest()
        cert_data["certificate_id"] = f"CERT-{content_hash[:12].upper()}"
        return cert_data


# Singleton
blockchain_service = BlockchainService()
