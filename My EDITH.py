import pyttsx3
import datetime
import speech_recognition as sr
import wikipedia
import webbrowser
import os





myName = 'Edith'
engine = pyttsx3.init('sapi5')
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[1].id)



def speak (Audio):
    engine.say(Audio)
    engine.runAndWait()


def wishme():
    hour = datetime.datetime.now().hour
    if hour>=4 and hour<12:
        speak('good morning Sir')
    elif hour>=12 and hour<16:
        speak('good afternoon Sir')
    elif hour>=16 and hour<20:
        speak('good evening Sir')
    else:
        speak('good night Sir')
    speak(f'i am {myName}, how can i help you?')



def hearMe():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print('Listening...')
        audio = r.listen(source)
    try:
        print('Recognizing...')
        query = r.recognize_google(audio, language = 'en-in')
        print('You said:', query)
    except Exception:
        print('Say that again, please')
        return 'None'
    return query



if __name__ == "__main__":
    wishme()
    while True:
        query = hearMe().lower()

        if 'wikipedia' in query:
            speak ('searching wikipedia...')
            query = query.replace('wikipedia','')
            result = wikipedia.summary(query,sentences=2)
            speak('according to wikipedia')
            print(result)
            speak(result)
        elif 'open google' in query:
            print('Opening Google')
            speak('Opening Google')
            webbrowser.open('www.google.com')
        elif 'open instagram' in query:
            print('Opening Instagram')
            speak('opening Instagram')
            webbrowser.open('www.instagram.com')
        elif 'find me some emotional songs' in query:
            print('Finding emotional songs for you')
            speak('Finding emotional songs for you')
            webbrowser.open('https://open.spotify.com/playlist/3aIWuMYic1EE3QwuUCw1yA')
        elif 'find me some romantic songs' in query:
            print('Finding romantic songs for you')
            speak('Finding romantic songs for you')
            webbrowser.open('https://open.spotify.com/playlist/2VInJrpDJ67aiCIDDY7WQP')
        elif 'find me some bhakti songs' in query:
            print('Finding bhakti songs for you')
            speak('Finding bhakti songs for you')
            webbrowser.open('https://open.spotify.com/playlist/6lWd4E3LpNgtJwbGReaeiy')
        elif 'open youtube' in query:
            print('opening Youtube')
            speak('opening Youtube')
            webbrowser.open('www.youtube.com')
        elif 'open facebook' in query:
            print('opening Facebook')
            speak('opening Facebook')
            webbrowser.open('www.facebook.com')
        elif 'play my favourite song' in query:
            music_dir = "C:\\Users\\srkpr\\Music\\Aaoge Tum Kabhi_320(PagalWorld.com.so).mp3"
            print('Playing music')
            speak('playing music')
            songs = os.startfile("C:\\Users\\srkpr\\Music\\Resso Music\\Aaoge Tum Kabhi_320(PagalWorld.com.so).mp3")
        elif 'play any song' in query:
            music_dir = "C:\\Users\\srkpr\\Music\\Khada Hu Aaj Bhi Wahi_320(PagalWorld.com.so).mp3"
            print('Playing music')
            speak('playing music')
            songs = os.startfile("C:\\Users\\srkpr\\Music\\Resso Music\\Khada Hu Aaj Bhi Wahi_320(PagalWorld.com.so).mp3")
        elif 'play music' in query:
            music_dir = "C:\\Users\\srkpr\\Music\\Nadaniya_320(PagalWorld.com.so).mp3"
            print('Playing music')
            speak('playing music')
            songs = os.startfile("C:\\Users\\srkpr\\Music\\Resso Music\\Nadaniya_320(PagalWorld.com.so).mp3")
        elif 'movies' in query:
            os.startfile("D:\LOCAL DISK E.2")
        elif 'in spotify' in query:
            search = 'https://open.spotify.com/search/'+ query
            webbrowser.open(search)
        elif 'in youtube' in query:
            search = 'https://www.youtube.com/results?search_query='+ query
            webbrowser.open(search)
        else:
            search = 'https://www.google.com/search?q='+ query
            webbrowser.open(search)
           



