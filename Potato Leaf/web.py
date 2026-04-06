import streamlit as st
import tensorflow as tf
import numpy as np
import gdown
from PIL import Image
import os

# Model Download from Google Drive
file_id = "14SmIXmGBDdxVQCbi3H4HqLjDYulsqvGT"
url = f"https://drive.google.com/uc?id={file_id}"
model_path = "trained_plant_disease_model.keras"

# Function to download the model
def download_model():
    if not os.path.exists(model_path):
        st.warning("Downloading model from Google Drive...")
        gdown.download(url, model_path, quiet=False)

        # Confirm if model downloaded successfully
        if os.path.exists(model_path):
            st.success("Model downloaded successfully!")
            st.write(f"Model file size: {os.path.getsize(model_path)} bytes")
        else:
            st.error("Model download failed. Please check the Google Drive link.")

# Call download function
download_model()

# Function to Load Model & Predict
def model_prediction(test_image):
    if not os.path.exists(model_path):
        st.error("Error: Model file not found! Please upload manually or check download.")
        return None

    try:
        st.write("Loading model...")
        model = tf.keras.models.load_model(model_path)
        st.write("Model loaded successfully!")

        image = test_image.resize((128, 128))  # Resize using PIL
        input_arr = np.array(image) / 255.0  # Normalize pixel values
        input_arr = np.expand_dims(input_arr, axis=0)  # Add batch dimension

        predictions = model.predict(input_arr)
        return np.argmax(predictions)

    except Exception as e:
        st.error(f"Error loading model: {e}")
        return None

# Streamlit Sidebar
st.sidebar.title("Plant Disease System for Sustainable Agriculture")
app_mode = st.sidebar.selectbox('Select page', ['Home', 'Disease Recognition'])

# Display Logo
logo_path = 'plant leaf disease detection logo.png'
if os.path.exists(logo_path):
    img = Image.open(logo_path)
    st.image(img)
else:
    st.error("Logo image not found. Please upload it to the project directory.")

# Home Page
if app_mode == 'Home':
    st.markdown("<h1 style='text-align: center;'>Plant Disease Detection System for Sustainable Agriculture</h1>", 
                unsafe_allow_html=True)

# Disease Recognition Page
elif app_mode == 'Disease Recognition':
    st.header('Plant Disease Detection System for Sustainable Agriculture')

    # File Uploader
    uploaded_file = st.file_uploader("Choose an image file", type=["jpg", "png"])

    if uploaded_file:
        image = Image.open(uploaded_file)
        st.image(image, use_column_width=True)  # Always show the uploaded image

        if st.button('Predict'):
            st.snow()
            st.write('Processing Prediction...')
            result_index = model_prediction(image)

            if result_index is not None:
                class_names = ['Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy']
                st.success(f'Model predicts: {class_names[result_index]}')
            else:
                st.error("Prediction failed due to model loading issues.")
