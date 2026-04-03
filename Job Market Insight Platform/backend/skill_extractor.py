skills_db = [
    "python",
    "java",
    "sql",
    "aws",
    "docker",
    "kubernetes",
    "machine learning",
    "data analysis",
    "react",
    "node",
    "tensorflow",
    "pytorch"
]

def extract_skills(text):

    text = text.lower()

    detected = []

    for skill in skills_db:
        if skill in text:
            detected.append(skill)

    return detected