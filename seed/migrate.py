import sys
from pathlib import Path

import asyncio
import json
import aiomysql

# ——— CONFIG ———
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "fastapi",
    "password": "fastapi",
    "db": "fastapi",
    "autocommit": False,
}

INSERT_SPECIALISATION_SQL = """
INSERT INTO specialisations (name, description, data)
VALUES (%s, %s, %s)
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  data = VALUES(data)
"""

INSERT_COURSE_SQL = """
INSERT INTO courses (name, description, specialisation_id, data)
VALUES (%s, %s, %s, %s)
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  specialisation_id = VALUES(specialisation_id),
  data = VALUES(data)
"""

INSERT_COURSE_CONTENT_SQL = """
INSERT INTO course_contents (course_id, content_type, content_url, content_data, content_text, created_at, updated_at)
VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
"""

async def seed(json_path: Path):
    # load JSON
    with json_path.open() as f:
        records = json.load(f)

    pool = await aiomysql.create_pool(**DB_CONFIG)
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            for rec in records:
                # specialisation JSON has "title"
                if "title" in rec:
                    name        = rec["title"]
                    description = rec.get("description")
                    data_json   = json.dumps(rec.get("data", {}))
                    await cur.execute(INSERT_SPECIALISATION_SQL,
                                      (name, description, data_json))

                # course JSON has "name" + "specialisation_id"
                elif "name" in rec and "specialisation_id" in rec:
                    name        = rec["name"]
                    description = rec.get("description")
                    spec_id     = rec["specialisation_id"]
                    data_json   = json.dumps(rec.get("data", {}))
                    await cur.execute(INSERT_COURSE_SQL,
                                      (name, description, spec_id, data_json))
                elif "course_id" in rec and "content_type" in rec:
                    course_id   = rec["course_id"]
                    content_type = rec["content_type"]
                    content_url = rec["content_url"]
                    content_data = json.dumps(rec.get("content_data", {}))
                    content_text = rec.get("content_text")
                    await cur.execute(INSERT_COURSE_CONTENT_SQL,
                                      (course_id, content_type, content_url, content_data, content_text))
                else:
                    # unknown record type
                    print(f"Skipping unrecognized record: {rec}")

        await conn.commit()

    pool.close()
    await pool.wait_closed()

def main():
    json_path = Path(__file__).parent / "specialisation.json"
    json_path = Path(__file__).parent / "course.json"
    json_path = Path(__file__).parent / "content.json"
    if not json_path.exists():
        print(f"File not found: {json_path}")
        sys.exit(1)

    asyncio.run(seed(json_path))

if __name__ == "__main__":
    main()
