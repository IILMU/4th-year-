🎵 AI Music Discovery Hub (WIP 🚧)
AI Music Discovery Hub is a web-based application built with Streamlit that integrates with the Spotify Web API. It allows users to search for tracks, find similar music from artists, and explore different moods.

⚠️ Status: Under Development (Incomplete)

🔑 API Integration
This project uses the Spotify API via the spotipy library to:

Search for track metadata.

Fetch artist-specific recommendations.

Retrieve high-quality album artwork (thumbnails).

Link directly to Spotify for streaming.

🛠️ Tech Stack

Frontend: Streamlit.


Backend: Python 3.11.


API Wrapper: Spotipy.

📦 Current Features

Similar Songs: Search a track to see its details and more songs by the same artist.


Mood Explorer: Grid-based display (4 columns) for tracks based on mood keywords like 'Chill' or 'Gym'.


Error Handling: Basic try-except blocks to catch authentication or search errors.

🔧 Installation & API Setup
Clone the repo.

Install requirements: pip install streamlit spotipy.

Important: You must provide your own Spotify credentials in the code:


CLIENT_ID = "your_id_here" 


CLIENT_SECRET = "your_secret_here" 

Run the app: streamlit run app.py.

👨‍💻 Author
Pritam Sarkar (B.Tech CSE - AI & ML)