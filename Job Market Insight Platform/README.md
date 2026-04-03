# Job Market Insight Platform

Job Market Insight Platform is a data-driven web application that analyzes real-world job listings and provides insights about the technology job market.

The platform processes a dataset of job postings and extracts useful insights such as:

- Most demanded skills
- Average salaries by role
- Skill demand trends
- Job recommendations based on user skills

The project demonstrates practical applications of **data analytics, NLP, backend APIs, and frontend dashboards**.

---

## Features

- Analyze real-world job dataset
- Extract skills from job descriptions
- Identify most in-demand technologies
- Compute salary statistics
- Recommend jobs based on skills
- Provide insights through API and web interface

---

## Tech Stack

Backend  
Python (FastAPI)

Data Processing  
Pandas

NLP  
spaCy

Frontend  
HTML  
CSS  
JavaScript

Dataset  
Custom job dataset containing technology roles

---

## API Endpoints

GET /jobs  
Returns all jobs from dataset

GET /top-skills  
Returns most demanded skills in dataset

GET /salary-stats  
Returns salary statistics for roles

POST /recommend  
Returns recommended jobs based on user skills

---

## Example Output

Top Skills in Market

1. Python
2. SQL
3. AWS
4. Docker
5. Kubernetes

Average Salaries

Data Scientist: 120000  
Backend Engineer: 115000  
ML Engineer: 130000

Recommended Jobs for Skills: Python, SQL

- Data Analyst
- Backend Engineer
- Data Scientist

---

## API Documentation

The project provides interactive API documentation using Swagger UI.

You can access it at:

http://127.0.0.1:8000/docs

### Swagger Interface

![Swagger UI](screenshots/swagger_ui.png)

---


## Author

Ansh Walia  
B.Tech Computer Science