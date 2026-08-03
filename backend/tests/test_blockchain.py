import pytest
from app.blockchain.blockchain_service import Block, LocalBlockchain

def test_block_hash_integrity():
    blockchain = LocalBlockchain()
    block = blockchain.add_record({"test": "data"}, "test_type")
    assert blockchain.is_valid() is True
    
    # Check that calculated hash matches loaded hash
    assert block.hash == block._calculate_hash()
