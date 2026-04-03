import os
from dotenv import load_dotenv
import streamlit as st
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
#1. Load the environment variables from .env file
load_dotenv()

# --- 1. API CREDENTIALS ---
# Ensure you replace these with your actual Spotify Developer credentials
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")




# Spotify Connection with Error Handling
try:
    auth_manager = SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=CLIENT_SECRET)
    sp = spotipy.Spotify(auth_manager=auth_manager)
except Exception as e:
    st.error("Authentication Error: Please verify your Spotify API Credentials.")

# --- 2. APP CONFIGURATION ---
st.set_page_config(page_title="Music Analytics Hub", page_icon="🎵", layout="wide")
st.title("🎵 AI Music Discovery Hub")
st.markdown("---")

# Sidebar Navigation
st.sidebar.header("Navigation")
option = st.sidebar.selectbox("Select Feature:", ("Similar Songs", "Mood Explorer"))

# --- FEATURE 1: SIMILAR SONGS ---
if option == "Similar Songs":
    song_query = st.text_input("Enter a song title to find similar tracks:")
    
    if st.button("Search & Recommend"):
        if song_query:
            try:
                # Searching for the primary track
                results = sp.search(q=song_query, limit=1, type='track')
                
                if results['tracks']['items']:
                    track = results['tracks']['items'][0]
                    artist_name = track['artists'][0]['name']
                    track_name = track['name']
                    album_cover = track['album']['images'][0]['url']
                    
                    # Display Primary Search Result
                    st.success(f"Track Identified: {track_name} by {artist_name}")
                    col_main1, col_main2 = st.columns([1, 2])
                    with col_main1:
                        st.image(album_cover, width=300, caption="Selected Track")
                    with col_main2:
                        st.info(f"Artist: {artist_name}")
                        st.write("Browse recommended tracks below based on this artist.")

                    st.divider()
                    st.subheader(f"More Recommendations from {artist_name}")

                    # Fetching more tracks from the same artist
                    search_recs = sp.search(q=f"artist:{artist_name}", limit=7, type='track')
                    
                    # Grid Display for Recommendations with Thumbnails
                    rec_items = [item for item in search_recs['tracks']['items'] if item['name'].lower() != track_name.lower()]
                    
                    cols = st.columns(3) # Creating a 3-column grid
                    for idx, item in enumerate(rec_items):
                        with cols[idx % 3]:
                            st.image(item['album']['images'][0]['url'], use_container_width=True)
                            st.write(f"**{item['name']}**")
                            st.link_button("Listen on Spotify", item['external_urls']['spotify'])
                            st.write("") # Spacer
                else:
                    st.warning("No results found. Please verify the song title.")
            except Exception as e:
                st.error(f"A technical error occurred: {e}")
        else:
            st.warning("Please provide a song name.")
# --- FEATURE 2: MOOD EXPLORER (STABLE WITH THUMBNAILS) ---
elif option == "Mood Explorer":
    mood_input = st.text_input("Enter mood (e.g., Happy, Chill):", placeholder="Try 'Gym' or 'Sad'")
    if st.button("Explore"):
        if mood_input:
            st.subheader(f"Curated '{mood_input}' Selection:")
            try:
                # Direct, basic search query. Spotify decides the limit (default 10).
                results = sp.search(q=mood_input)
                
                if results['tracks']['items']:
                    items = results['tracks']['items']
                    
                    # 4-Column Grid Display
                    cols = st.columns(4)
                    
                    for idx, t in enumerate(items):
                        with cols[idx % 4]:
                            # Thumbnail image fetching
                            if t['album']['images']:
                                img_url = t['album']['images'][0]['url']
                            else:
                                img_url = "https://via.placeholder.com/300" # Placeholder image if missing

                            st.image(img_url, use_container_width=True)
                            
                            # Clean up long track names
                            track_name = t['name'] if len(t['name']) < 25 else t['name'][:22] + "..."
                            st.caption(f"**{track_name}**")
                            st.link_button("Open Song", t['external_urls']['spotify'])
                            st.markdown("<br>", unsafe_allow_html=True) # Spacer

                else:
                    st.info(f"Spotify couldn't find results for the mood '{mood_input}'. Try something more general like 'Lo-fi'.")
            except Exception as e:
                st.error(f"Technical Error: {e}")
        else:
            st.info("Please enter a mood keyword.")