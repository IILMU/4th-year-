import pandas as pd

def load_jobs():

    df = pd.read_csv("data/jobs_dataset.csv")

    jobs = df.to_dict(orient="records")

    return jobs