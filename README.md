🕶️ EDITH - AI Voice Assistant
EDITH is a fully functional, Python-based personal desktop voice assistant. Inspired by the Marvel Cinematic Universe, this project uses speech recognition and text-to-speech to automate daily tasks and provide a hands-free interactive experience.

✅ Status: Completed & Fully Functional

🚀 Key Features
Intelligent Greeting: Wishes the user (Morning/Afternoon/Evening) based on the system's current time.

Voice Recognition: Captures human voice and converts it into text commands using the SpeechRecognition library.

Information Retrieval: Searches and reads out short summaries of any topic directly from Wikipedia.

Web Automation: Voice-activated commands to launch Google, YouTube, Instagram, Facebook, and Spotify.

Local Media Playback: Opens specific music files and movie folders directly from your computer's hard drive.

Smart Search: Can perform direct searches on YouTube and Spotify, or default to Google for any other query.

🛠️ Tech Stack & Libraries
Language: Python 3.11

Text-to-Speech: pyttsx3 (Using Microsoft SAPI5 engine)

Speech-to-Text: SpeechRecognition (Requires PyAudio for microphone access)

Data Fetching: wikipedia library

System Control: webbrowser & os modules

📦 Installation & Setup
Download Project:
Download the My EDITH.py file and this README.md into a single folder.

Install Required Libraries:
Open your terminal and run the following command to install all dependencies:

Bash
pip install pyttsx3 speechrecognition wikipedia pyaudio
(Note: PyAudio is required by the SpeechRecognition library to access your microphone).

Update File Paths:
Open My EDITH.py and update the file paths for your music and movies (e.g., C:\Users\...\Music) to match your local folders.

Launch the Assistant:

Bash
python "My EDITH.py"
👨‍💻 Author
Pritam Sarkar B.Tech in Computer Science (AI & Machine Learning)

IILM University, Greater Noida