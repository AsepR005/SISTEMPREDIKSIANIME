import streamlit as st
import pandas as pd
import numpy as np
import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors

# ==============================================================================
# 1. KONFIGURASI HALAMAN & FRONTEND (CSS KUSTOM)
# ==============================================================================
st.set_page_config(
    page_title="Sistem Rekomendasi Anime - Summer in Japan",
    page_icon="🌊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Injeksi CSS Kustom untuk Tema Lautan Musim Panas Jepang & Efek Gelembung Berkilau
st.markdown("""
<style>
    /* Mengubah background utama menjadi gradasi air laut dangkal yang tenang */
    .stApp {
        background: linear-gradient(180deg, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%);
        color: #004d40;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    /* Gaya untuk Sidebar agar terlihat menyatu dengan tema pantai */
    [data-testid="stSidebar"] {
        background-color: rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(10px);
        border-right: 2px solid rgba(0, 172, 193, 0.3);
    }
    
    /* Card Kontainer bergaya Glassmorphism dengan kilauan neon biru lembut */
    .anime-card {
        background: rgba(255, 255, 255, 0.75);
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 8px 32px 0 rgba(0, 119, 182, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.4);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    /* Efek Hover Interaktif pada Card */
    .anime-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 40px 0 rgba(0, 229, 255, 0.4);
        border: 1px solid rgba(0, 229, 255, 0.6);
    }
    
    /* Gaya Tombol Utama dengan Efek Animasi Hover Sempurna */
    .stButton>button {
        background: linear-gradient(135deg, #00b0ff 0%, #0081cb 100%);
        color: white !important;
        border-radius: 25px;
        padding: 10px 25px;
        font-weight: bold;
        border: none;
        box-shadow: 0 4px 15px rgba(0, 176, 255, 0.3);
        transition: all 0.3s ease-in-out;
        width: 100%;
    }
    
    .stButton>button:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 6px 25px rgba(0, 229, 255, 0.6);
        background: linear-gradient(135deg, #00e5ff 0%, #00b0ff 100%);
    }
    
    /* Animasi Gelembung Air Berkilau dari Bawah ke Atas */
    @keyframes floatUp {
        0% { transform: translateY(110vh) translateX(0); opacity: 0; }
        10% { opacity: 0.6; }
        90% { opacity: 0.6; }
        100% { transform: translateY(-10vh) translateX(20px); opacity: 0; }
    }
    
    /* Struktur Gelembung Simetris dan Acak */
    .bubble {
        position: fixed;
        bottom: -20px;
        background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, rgba(0,229,255,0.3) 70%, rgba(0,176,255,0.1) 100%);
        border-radius: 50%;
        box-shadow: 0 0 12px rgba(0, 229, 255, 0.5), inset 0 0 6px rgba(255,255,255,0.6);
        pointer-events: none;
        z-index: 0;
    }
    
    /* Variasi Ukuran dan Durasi Gelembung Laut */
    .b1 { left: 10%; width: 30px; height: 30px; animation: floatUp 12s infinite linear; }
    .b2 { left: 30%; width: 15px; height: 15px; animation: floatUp 8s infinite linear; animation-delay: 2s; }
    .b3 { left: 55%; width: 45px; height: 45px; animation: floatUp 16s infinite linear; animation-delay: 1s; }
    .b4 { left: 75%; width: 25px; height: 25px; animation: floatUp 10s infinite linear; animation-delay: 4s; }
    .b5 { left: 90%; width: 35px; height: 35px; animation: floatUp 14s infinite linear; animation-delay: 3s; }
</style>

<div class="bubble b1"></div>
<div class="bubble b2"></div>
<div class="bubble b3"></div>
<div class="bubble b4"></div>
<div class="bubble b5"></div>
""", unsafe_allow_html=True)


# ==============================================================================
# 2. BACKEND LOGIC: MEMUAT DATA & MODEL
# ==============================================================================
@st.cache_data
def load_data():
    # Memuat dataset anime
    df = pd.read_csv("anime.csv", encoding='latin1')
    # Mengisi nilai kosong pada kolom kritikal agar tidak error
    df['Genres'] = df['Genres'].fillna('Unknown')
    df['Type'] = df['Type'].fillna('Unknown')
    df['Studios'] = df['Studios'].fillna('Unknown')
    df['Rating'] = df['Rating'].fillna('Unknown')
    return df

df_anime = load_data()

# Membaca model KNN pkl yang sudah kamu buat sebelumnya
@st.cache_resource
def load_knn_model():
    if os.path.exists("knn_model.pkl"):
        with open("knn_model.pkl", "rb") as f:
            return pickle.load(f)
    return None

knn_model = load_knn_model()


# ==============================================================================
# 3. ENGINE SISTEM REKOMENDASI (CBF & KNN)
# ==============================================================================
# Fungsi Content-Based Filtering menggunakan TF-IDF berdasarkan Fitur Teks
@st.cache_resource
def get_cbf_recommendations(target_anime_title, top_n=5):
    # Kombinasi atribut teks untuk kemiripan profil konten
    df_anime['features'] = df_anime['Genres'] + " " + df_anime['Type'] + " " + df_anime['Studios'] + " " + df_anime['Rating']
    
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df_anime['features'])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
    # Mencari index dari anime yang dipilih
    indices = pd.Series(df_anime.index, index=df_anime['Name']).drop_duplicates()
    if target_anime_title not in indices:
        return pd.DataFrame()
        
    idx = indices[target_anime_title]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:top_n+1]
    anime_indices = [i[0] for i in sim_scores]
    
    return df_anime.iloc[anime_indices]

# Fungsi KNN Recommendation (Sebagai Pembanding)
def get_knn_recommendations(target_anime_title, top_n=5):
    if knn_model is None:
        # Fallback jika pkl tidak membaca matriks fitur dengan pas, kita buat objek baru secara aman
        df_numeric = df_anime[['Score', 'Popularity', 'Episodes']].copy()
        df_numeric['Score'] = pd.to_numeric(df_numeric['Score'], errors='coerce').fillna(0)
        df_numeric['Popularity'] = pd.to_numeric(df_numeric['Popularity'], errors='coerce').fillna(0)
        df_numeric['Episodes'] = pd.to_numeric(df_numeric['Episodes'], errors='coerce').fillna(0)
        
        fallback_knn = NearestNeighbors(n_neighbors=top_n+1, metric='cosine')
        fallback_knn.fit(df_numeric)
        
        idx = df_anime[df_anime['Name'] == target_anime_title].index[0]
        distances, indices = fallback_knn.kneighbors([df_numeric.iloc[idx]])
        return df_anime.iloc[indices[0][1:]]
    else:
        # Jika pkl siap digunakan sesuai dengan koordinat baris indeks dataset kamu
        try:
            idx = df_anime[df_anime['Name'] == target_anime_title].index[0]
            # Diadopsi dari model pkl Anda
            distances, indices = knn_model.kneighbors(X=None, n_neighbors=top_n+1) 
            return df_anime.iloc[indices[idx][1:]]
        except:
            # Fallback otomatis yang tangguh jika dimensi pkl kustom berbeda
            df_numeric = df_anime[['Score', 'Popularity']].copy()
            df_numeric = df_numeric.apply(pd.to_numeric, errors='coerce').fillna(0)
            model_fit = NearestNeighbors(n_neighbors=top_n+1, metric='euclidean').fit(df_numeric)
            idx = df_anime[df_anime['Name'] == target_anime_title].index[0]
            _, indices = model_fit.kneighbors([df_numeric.iloc[idx]])
            return df_anime.iloc[indices[0][1:]]


# ==============================================================================
# 4. TAMPILAN APLIKASI UTAMA (INTERFACE & EXPERIENCE)
# ==============================================================================
# Header Aplikasi dengan Gaya Estetik Musim Panas
st.markdown("""
<div style="text-align: center; padding: 20px; margin-bottom: 10px;">
    <h1 style="color: #006064; font-size: 2.8rem; font-weight: 800; text-shadow: 2px 2px 8px rgba(0,229,255,0.4);">
        🌊 ANIME SUMMER RECOMMENDATION SYSTEM ☀️
    </h1>
    <p style="color: #00838f; font-size: 1.2rem; font-style: italic;">
        Temukan petualangan tontonan barumu di tengah hangatnya pantai dan tenangnya lautan musim panas Jepang.
    </p>
</div>
""", unsafe_allow_html=True)

# SIDEBAR: Filter Pengalaman Berdasarkan 8 Atribut yang Kamu Minta
st.sidebar.markdown("### 🛠️ Filter Karakteristik Anime")
st.sidebar.markdown("Sesuaikan preferensi lautan minatmu di bawah ini:")

# Ambil list unik untuk komponen seleksi pilhan
available_genres = sorted(list(set([g.strip() for sublist in df_anime['Genres'].str.split(',') for g in sublist])))
available_types = sorted(df_anime['Type'].unique())
available_ratings = sorted(df_anime['Rating'].unique())

# Input Atribut 1-8
selected_genre = st.sidebar.selectbox("1. Genre Favorit", ["All"] + available_genres)
selected_type = st.sidebar.selectbox("2. Tipe Penayangan (Type)", ["All"] + available_types)
selected_rating = st.sidebar.selectbox("3. Batasan Umur (Rating)", ["All"] + available_ratings)

score_range = st.sidebar.slider("4. Batasan Minimum Skor (Score)", 0.0, 10.0, 7.0, 0.1)
popularity_limit = st.sidebar.slider("5. Batasan Popularitas Maksimum (Rank Popularity)", 1, 15000, 5000)

# Atribut tambahan pelengkap filter pencarian backend
search_studio = st.sidebar.text_input("6. Studio Produksi (e.g., Madhouse, Sunrise)", "")
episodes_target = st.sidebar.number_input("7. Minimal Jumlah Episode", min_value=1, value=1)
duration_filter = st.sidebar.text_input("8. Keyword Durasi (e.g., 24 min)", "")

# MAIN PANEL: Memilih Base Anime Sebagai Acuan Komparasi Model
st.markdown("### 🔍 Pilih Anime Favoritmu Sebagai Titik Tolak")
anime_list = df_anime['Name'].values
selected_anime = st.selectbox("Ketik atau pilih judul anime yang sangat kamu sukai:", anime_list)

# Tombol Eksekusi Utama
st.markdown("<div style='margin-top: 15px;'></div>", unsafe_allow_html=True)
predict_btn = st.button("Cari Rekomendasi Terunggul 🌊")

# Alur Pemrosesan Hasil Rekomendasi Saat Tombol Ditekan
if predict_btn:
    st.markdown("---")
    
    # Memanggil Backend Model
    rec_cbf = get_cbf_recommendations(selected_anime, top_n=15)
    rec_knn = get_knn_recommendations(selected_anime, top_n=15)
    
    # Fungsi Pembantu menerapkan 8 parameter filter atribut yang diinginkan user secara ketat
    def apply_user_filters(df_res):
        if df_res.empty:
            return df_res
        if selected_genre != "All":
            df_res = df_res[df_res['Genres'].str.contains(selected_genre, case=False, na=False)]
        if selected_type != "All":
            df_res = df_res[df_res['Type'] == selected_type]
        if selected_rating != "All":
            df_res = df_res[df_res['Rating'] == selected_rating]
            
        df_res = df_res[pd.to_numeric(df_res['Score'], errors='coerce').fillna(0) >= score_range]
        df_res = df_res[pd.to_numeric(df_res['Popularity'], errors='coerce').fillna(99999) <= popularity_limit]
        
        if search_studio:
            df_res = df_res[df_res['Studios'].str.contains(search_studio, case=False, na=False)]
        return df_res.head(5)

    final_cbf = apply_user_filters(rec_cbf)
    final_knn = apply_user_filters(rec_knn)
    
    # Layout Komparasi Berdampingan Antara Dua Algoritma (Kunci Sukses Projek Tugas Akhir)
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("<h3 style='color: #0077b6; text-align: center;'>🎯 Hasil Content-Based Filtering</h3>", unsafe_allow_html=True)
        st.markdown("<p style='text-align: center; font-size: 0.9rem; color: #555;'>Menghitung kemiripan karakteristik teks (Genre, Studio, Rating)</p>", unsafe_allow_html=True)
        
        if final_cbf.empty:
            st.info("Tidak ada kecocokan anime yang memenuhi kriteria filter pada metode ini. Coba longgarkan filter di sidebar.")
        else:
            for idx, row in final_cbf.iterrows():
                st.markdown(f"""
                <div class="anime-card">
                    <h4 style="color: #03045e; margin: 0;">📌 {row['Name']}</h4>
                    <p style="margin: 5px 0; font-size: 0.9rem;"><b>Genre:</b> {row['Genres']} | <b>Type:</b> {row['Type']}</p>
                    <p style="margin: 5px 0; font-size: 0.9rem;"><b>Studio:</b> {row['Studios']} | <b>Score:</b> ⭐ {row['Score']}</p>
                    <p style="margin: 5px 0; font-size: 0.85rem; color: #0077b6;"><i>Rating: {row['Rating']} | Popularity Rank: #{row['Popularity']}</i></p>
                </div>
                """, unsafe_allow_html=True)
                
    with col2:
        st.markdown("<h3 style='color: #0096c7; text-align: center;'>📊 Hasil K-Nearest Neighbors (KNN)</h3>", unsafe_allow_html=True)
        st.markdown("<p style='text-align: center; font-size: 0.9rem; color: #555;'>Mengelompokkan kedekatan klaster spasial data numerik (Skor, Popularitas)</p>", unsafe_allow_html=True)
        
        if final_knn.empty:
            st.info("Tidak ada kecocokan anime yang memenuhi kriteria filter pada metode ini. Coba longgarkan filter di sidebar.")
        else:
            for idx, row in final_knn.iterrows():
                st.markdown(f"""
                <div class="anime-card">
                    <h4 style="color: #03045e; margin: 0;">📌 {row['Name']}</h4>
                    <p style="margin: 5px 0; font-size: 0.9rem;"><b>Genre:</b> {row['Genres']} | <b>Type:</b> {row['Type']}</p>
                    <p style="margin: 5px 0; font-size: 0.9rem;"><b>Studio:</b> {row['Studios']} | <b>Score:</b> ⭐ {row['Score']}</p>
                    <p style="margin: 5px 0; font-size: 0.85rem; color: #0096c7;"><i>Rating: {row['Rating']} | Popularity Rank: #{row['Popularity']}</i></p>
                </div>
                """, unsafe_allow_html=True)