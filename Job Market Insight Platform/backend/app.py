from fastapi import FastAPI
from backend.job_loader import load_jobs
from backend.analytics import get_top_skills, salary_stats
from backend.recommender import recommend_jobs

app = FastAPI()

jobs = load_jobs()

@app.get("/")
def home():
    return {"message": "Job Market Insight Platform"}

@app.get("/jobs")
def all_jobs():
    return jobs

@app.get("/top-skills")
def top_skills():
    return get_top_skills(jobs)

@app.get("/salary-stats")
def salaries():
    return salary_stats(jobs)

@app.post("/recommend")
def recommend(user_skills: list):
    return recommend_jobs(user_skills, jobs)