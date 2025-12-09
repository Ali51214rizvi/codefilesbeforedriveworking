# db.py
import mysql.connector
from mysql.connector import pooling
import os

# Better: store secrets in env variables (or .env)
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASS", "your_mysql_root_password"),
    "database": os.getenv("DB_NAME", "exam_system"),
    "port": int(os.getenv("DB_PORT", 3306))
}

# Use connection pooling for production-like behavior
pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,
    **DB_CONFIG
)

def get_conn():
    return pool.get_connection()
