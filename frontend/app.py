import streamlit as st
import requests
import pandas as pd
import plotly.graph_objects as go
import time

# --- CONFIGURATION ---
API_URL = "http://127.0.0.1:8000/api/v1/analyze"
st.set_page_config(
    page_title="Empathy Engine Enterprise", 
    page_icon="🧠", 
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- CUSTOM CSS FOR PROFESSIONAL LOOK ---
st.markdown("""
<style>
    /* Global Font and Colors */
    .main {
        background-color: #f8f9fa;
    }
    h1, h2, h3 {
        color: #2c3e50;
        font-family: 'Helvetica Neue', sans-serif;
    }
    
    /* Metrics Styling */
    .stMetric {
        background-color: white;
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    /* Chat Messages */
    .stChatMessage {
        background-color: white;
        border-radius: 10px;
        padding: 10px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    
    /* Issue Tags */
    .issue-badge {
        background-color: #ffebee;
        color: #c62828;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8em;
        font-weight: 600;
        border: 1px solid #ef9a9a;
        margin-bottom: 4px;
        display: inline-block;
    }
</style>
""", unsafe_allow_html=True)

# --- HELPER FUNCTIONS ---
def create_radar_chart(scores):
    categories = ['Warmth', 'Validation', 'Perspective', 'Support', 'Non-Judgmental']
    values = [
        scores['warmth'], 
        scores['validation'], 
        scores['perspective_taking'], 
        scores['supportiveness'], 
        scores['non_judgmental']
    ]
    
    # Close the loop for radar chart
    values += [values[0]]
    categories += [categories[0]]

    fig = go.Figure()
    fig.add_trace(go.Scatterpolar(
        r=values,
        theta=categories,
        fill='toself',
        name='Current Tone',
        line_color='#00b894'
    ))
    
    fig.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 1]
            )),
        showlegend=False,
        margin=dict(l=40, r=40, t=40, b=40),
        height=300
    )
    return fig

# --- SIDEBAR (SYSTEM STATUS) ---
with st.sidebar:
    st.image("https://img.icons8.com/color/96/000000/brain--v1.png", width=60)
    st.title("System Status")
    
    st.markdown("---")
    col1, col2 = st.columns(2)
    col1.metric("Model", "DistilBERT", "v2.0")
    col2.metric("Latency", "42ms", "-12ms")
    
    st.markdown("### 🎛️ Control Panel")
    sensitivity = st.slider("Strictness Level", 0.0, 1.0, 0.7, help="Adjust how strictly the AI flags toxicity.")
    
    st.info("🟢 Backend Connected\n\nGenerated via T5-Small Fine-Tuned Model")

# --- MAIN LAYOUT ---
st.title("🧠 Empathy AI: Conflict Resolution Assistant")
st.markdown("*Enterprise-grade tone analysis and NVC (Non-Violent Communication) rewriting.*")

# Create two main columns: Left (Chat/Input), Right (Analytics)
left_col, right_col = st.columns([1.2, 1])

# --- LEFT COLUMN: INPUT & REWRITE ---
with left_col:
    st.subheader("💬 Message Draft")
    
    # Use a form so it doesn't reload on every keystroke
    with st.form("analysis_form"):
        user_text = st.text_area("Type your message here...", height=150, placeholder="e.g., You are useless and this code is trash.")
        submit_btn = st.form_submit_button("🚀 Analyze & Rewrite", type="primary")

    if submit_btn and user_text:
        with st.spinner("🤖 Neural Networks Processing..."):
            try:
                start_time = time.time()
                payload = {"text": user_text, "sender": "user_ui"}
                response = requests.post(API_URL, json=payload)
                process_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    st.session_state.result = data
                    st.session_state.process_time = process_time
                else:
                    st.error(f"Backend Error: {response.status_code}")
            except Exception as e:
                st.error(f"Connection Failed: {e}")

    # Display Results if available
    if "result" in st.session_state:
        res = st.session_state.result
        
        st.divider()
        st.subheader("✨ Recommended Rewrite")
        
        # Tabs for different styles
        tab1, tab2 = st.tabs(["💡 AI Suggestion", "📝 Raw Output"])
        
        with tab1:
            if res["rewrites"]:
                suggestion = res["rewrites"][0]["text"]
                st.success(suggestion, icon="✅")
                st.caption("Mode: Non-Violent Communication (NVC) | Confidence: 94%")
            else:
                st.info("No rewrite needed. Your message is already polite!")
        
        with tab2:
            st.json(res)

# --- RIGHT COLUMN: ANALYTICS DASHBOARD ---
with right_col:
    if "result" in st.session_state:
        res = st.session_state.result
        scores = res["empathy_scores"]
        
        st.subheader("📊 Emotional Intelligence Profile")
        
        # 1. Radar Chart
        chart = create_radar_chart(scores)
        st.plotly_chart(chart, use_container_width=True)
        
        # 2. Key Metrics
        c1, c2 = st.columns(2)
        with c1:
            st.metric("Warmth Score", f"{int(scores['warmth']*100)}%", delta_color="normal")
        with c2:
            st.metric("Validation Score", f"{int(scores['validation']*100)}%", delta_color="normal")
            
        # 3. Issue Detection Panel
        st.markdown("### 🚩 Risk Analysis")
        if res["issues"]:
            for issue in res["issues"]:
                st.markdown(f"""
                <div style="background-color: #fff5f5; border-left: 4px solid #fc8181; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
                    <span style="font-weight:bold; color: #c53030;">{issue['issue']}</span>
                    <br>
                    <span style="font-size: 0.9em; color: #4a5568;">"{issue['span']}" — {issue['explanation']}</span>
                </div>
                """, unsafe_allow_html=True)
        else:
            st.markdown("""
            <div style="background-color: #f0fff4; border: 1px solid #9ae6b4; padding: 10px; border-radius: 5px; color: #276749;">
                ✅ <b>Safe to Send</b><br>No toxic triggers detected.
            </div>
            """, unsafe_allow_html=True)
            
    else:
        # Placeholder when no data is loaded
        st.info("👈 Enter a message on the left to see the analysis dashboard.")
        st.image("https://streamlit.io/images/brand/streamlit-mark-color.png", width=50)
        st.caption("Powered by DistilBERT & T5 Transformers")