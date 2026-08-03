"""Ollama Local AI Client"""
import json
import time
from typing import AsyncGenerator, Optional, List, Dict, Any

import httpx
from loguru import logger

from app.core.config import settings


class OllamaClient:
    """Client for local Ollama AI server."""

    def __init__(self, base_url: str = None):
        self.base_url = base_url or settings.OLLAMA_BASE_URL
        self.timeout = httpx.Timeout(120.0, connect=10.0)

    async def is_available(self) -> bool:
        """Check if Ollama server is running."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                return resp.status_code == 200
        except Exception:
            return False

    async def list_models(self) -> List[Dict[str, Any]]:
        """List all available local models."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                if resp.status_code == 200:
                    data = resp.json()
                    return data.get("models", [])
        except Exception as e:
            logger.error(f"Failed to list models: {e}")
        return []

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        stream: bool = False,
    ) -> str:
        """Send a chat completion request to Ollama."""
        model = model or settings.DEFAULT_MODEL
        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
            },
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                start = time.time()
                resp = await client.post(
                    f"{self.base_url}/api/chat",
                    json=payload,
                )
                elapsed = int((time.time() - start) * 1000)
                if resp.status_code == 200:
                    data = resp.json()
                    content = data.get("message", {}).get("content", "")
                    logger.info(f"Ollama chat completed in {elapsed}ms (model={model})")
                    return content
                else:
                    logger.error(f"Ollama error: {resp.status_code} {resp.text}")
                    return f"[AI Error] Ollama returned status {resp.status_code}"
        except httpx.ConnectError:
            return "[AI Offline] Cannot connect to Ollama. Please start: `ollama serve`"
        except Exception as e:
            logger.error(f"Ollama chat error: {e}")
            return f"[AI Error] {str(e)}"

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        model: str = None,
        temperature: float = 0.7,
    ) -> AsyncGenerator[str, None]:
        """Stream chat response token by token."""
        model = model or settings.DEFAULT_MODEL
        payload = {
            "model": model,
            "messages": messages,
            "stream": True,
            "options": {"temperature": temperature},
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream("POST", f"{self.base_url}/api/chat", json=payload) as resp:
                    async for line in resp.aiter_lines():
                        if line:
                            try:
                                data = json.loads(line)
                                token = data.get("message", {}).get("content", "")
                                if token:
                                    yield token
                                if data.get("done"):
                                    break
                            except json.JSONDecodeError:
                                continue
        except httpx.ConnectError:
            yield "[AI Offline] Cannot connect to Ollama. Please run: ollama serve"
        except Exception as e:
            logger.error(f"Ollama stream error: {e}")
            yield f"[Error] {str(e)}"

    async def generate_embedding(self, text: str, model: str = None) -> Optional[List[float]]:
        """Generate text embedding using Ollama."""
        model = model or settings.DEFAULT_EMBEDDING_MODEL
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(
                    f"{self.base_url}/api/embeddings",
                    json={"model": model, "prompt": text},
                )
                if resp.status_code == 200:
                    return resp.json().get("embedding", [])
        except Exception as e:
            logger.error(f"Embedding error: {e}")
        return None

    async def pull_model(self, model_name: str) -> bool:
        """Pull a model from Ollama registry."""
        try:
            async with httpx.AsyncClient(timeout=600.0) as client:
                resp = await client.post(
                    f"{self.base_url}/api/pull",
                    json={"name": model_name},
                )
                return resp.status_code == 200
        except Exception as e:
            logger.error(f"Pull model error: {e}")
            return False


# Singleton
ollama_client = OllamaClient()
