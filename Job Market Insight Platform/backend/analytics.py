from backend.skill_extractor import extract_skills

def get_top_skills(jobs):

    skill_count = {}

    for job in jobs:

        skills = extract_skills(job["description"])

        for skill in skills:

            if skill not in skill_count:
                skill_count[skill] = 0

            skill_count[skill] += 1

    sorted_skills = sorted(skill_count.items(), key=lambda x: x[1], reverse=True)

    return sorted_skills[:10]


def salary_stats(jobs):

    role_salary = {}

    for job in jobs:

        role = job["role"]
        salary = job["salary"]

        if role not in role_salary:
            role_salary[role] = []

        role_salary[role].append(salary)

    stats = {}

    for role in role_salary:

        salaries = role_salary[role]

        stats[role] = sum(salaries) / len(salaries)

    return stats