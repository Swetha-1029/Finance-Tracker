import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo=True)

async def test():
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
        print(" MySQL connection successful")

    #  IMPORTANT: close engine
    await engine.dispose()

asyncio.run(test())
