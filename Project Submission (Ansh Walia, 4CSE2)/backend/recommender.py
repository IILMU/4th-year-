from backend.skill_extractor import extract_skills

def recommend_jobs(user_skills, jobs):

    recommendations = []

    user_skills = [s.lower() for s in user_skills]

    for job in jobs:

        job_skills = extract_skills(job["description"])

        match = len(set(user_skills) & set(job_skills))

        if match > 0:

            recommendations.append({
                "role": job["role"],
                "company": job["company"],
                "match_score": match
            })

    recommendations.sort(key=lambda x: x["match_score"], reverse=True)

    return recommendations[:5]