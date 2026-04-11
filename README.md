# How to submit your project to the class GitHub repository

This guide is **only** for pushing your LeafSense project into the shared **IILMU** repository as a **subfolder**. It does not replace the main `README.md` (run instructions, API, deployment).

**Class repository:** [https://github.com/IILMU/Btech2022264thyear](https://github.com/IILMU/Btech2022264thyear)  
**Clone URL:** `https://github.com/IILMU/Btech2022264thyear.git`  
**Branch:** `main`

---

## Prerequisites

1. **Git** installed — open PowerShell and run:
   ```powershell
   git --version
   ```
2. **GitHub account** with permission to **push** to `IILMU/Btech2022264thyear`. If you get **403** on push, ask your teacher to add you as a collaborator.
3. For HTTPS pushes, use a **Personal Access Token** (GitHub → Settings → Developer settings → Tokens) if the password is rejected.

---

## Step 1 — Choose where to clone (empty parent folder)

Example: a folder on your Desktop **only for the class repo** (not inside your personal LeafSense `.git` folder).

```powershell
cd $HOME\Desktop
mkdir college-Btech2022264thyear -ErrorAction SilentlyContinue
cd college-Btech2022264thyear
```

---

## Step 2 — Clone the class repository

```powershell
git clone https://github.com/IILMU/Btech2022264thyear.git
cd Btech2022264thyear
```

You should see other students’ project folders and a root `README.md`.

---

## Step 3 — Create your project folder at the repo root

Use a clear name (follow your teacher’s rule). Examples:

- `PRoject folder name `


```powershell
mkdir "Project folder name "
```

If the folder name must be different, replace `LeafSense` in all commands below.

---

## Step 4 — Copy your project into that folder (do not copy `.git`)

Your local LeafSense project path (adjust if yours is different):

```text
C:\Users\bihar\Desktop\LeafSense
```

**Important:** Never copy the `.git` folder from your personal project into the class repo.

### Option A — PowerShell `robocopy` (recommended on Windows)

Run this from **inside** `Btech2022264thyear` (after Step 2). Update `$src` if your project path differs.

```powershell
$src = "C:\Users\bihar\Desktop\LeafSense"
$dst = "$PWD\Project folder name"


### Option B — Manual copy

Use File Explorer: copy everything **except** the folders listed in the table below.

### What to exclude

| Do not copy | Why |
|-------------|-----|
| `.git` | The class repo already has its own Git history at the top level |
| `node_modules` | Run `npm install` inside `frontend` after clone |
| `frontend\dist` | Run `npm run build` when you need a production build |
| `.venv`, `venv`, `env` | Recreate a virtual environment locally |
| `uploads`, `__pycache__`, `.cursor` | Runtime / cache / IDE |
| `LeafSense binary dataset`, `leafsense_binary_dataset` | Large; regenerate with `prepare_leafsense_dataset.py` if needed |

---

## Step 5 — Clean sensitive / local-only files in the copy (optional but recommended)

From `Btech2022264thyear\Project folder name `:

```powershell
Remove-Item -Force ".\frontend\.env" -ErrorAction SilentlyContinue
Remove-Item -Force ".\frontend\.env.production" -ErrorAction SilentlyContinue
```

Keep `frontend\.env.example`. For local development, copy it to `frontend\.env` **on your machine only**; do not commit `.env`.

---

## Step 6 — Commit and push (from the class repo root)

You must run Git from **`Btech2022264thyear`**, not from a nested `.git` inside `Project folder name `.

```powershell
cd $HOME\Desktop\college-Btech2022264thyear\Btech2022264thyear

git status
git add Project folder name 
git commit -m "Project Submission | name"
```

Change the commit message if your college requires a fixed format (section, roll, etc.).

**Update from GitHub first** (others may have pushed):

```powershell
git pull --rebase origin main
```

**Push:**

```powershell
git push origin main
```

---

## Step 7 — Verify on GitHub

Open: [https://github.com/IILMU/Btech2022264thyear](https://github.com/IILMU/Btech2022264thyear)

Your `Prject folder name ` folder should appear alongside folders like `Potato Leaf`.

---

## If something fails

| Problem | What to do |
|---------|------------|
| **403 Forbidden** on `git push` | You need write access; contact faculty. |
| **File too large** | Remove huge files (e.g. `.pth`) from the commit or use [Git LFS](https://git-lfs.com/); or host the model elsewhere and document the link. |
| **Push rejected (non-fast-forward)** | Run `git pull --rebase origin main`, fix merge conflicts if any, then `git push` again. |
| **Authentication failed** | Use a Personal Access Token instead of password, or sign in with GitHub Desktop / `gh auth login`. |

---

## One-line summary

Clone [Btech2022264thyear](https://github.com/IILMU/Btech2022264thyear) → create `LeafSense` → copy project **without** `.git` → `git add` → `commit` → `pull --rebase` → `push` to `main`.
