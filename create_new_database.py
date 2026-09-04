import psycopg2

conn = psycopg2.connect(
    host="workout-tracker-db.c928mmeie85x.us-east-2.rds.amazonaws.com",
    port=5432,
    dbname="workoutdb",
    user="postgres",
    password="Sweengineer2028"
)
conn.autocommit = True
cursor = conn.cursor()

cursor.execute("CREATE DATABASE webaccess_db")
print("Database created")

conn.close()