# 🧠 Empathy Engine

An enterprise-grade AI-powered communication assistant that analyzes message tone and rewrites text using Non-Violent Communication (NVC) principles. Built with FastAPI, Streamlit, and fine-tuned transformer models.

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)
![Streamlit](https://img.shields.io/badge/Streamlit-1.28+-red.svg)

## ✨ Features

- **Empathy Scoring**: Analyze messages for warmth, validation, perspective-taking, supportiveness, and non-judgmental tone
- **AI Rewriting**: Transform potentially toxic messages into empathetic communication using NVC principles
- **Issue Detection**: Identify problematic language patterns and explain why they may be harmful
- **Real-time Analytics**: Visual dashboard with radar charts and risk analysis
- **Vector Memory**: ChromaDB integration for context-aware responses

## 🏗️ Architecture

```
empathy_engine/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # App entry point
│   │   ├── api/            # API routes
│   │   ├── core/           # Configuration
│   │   ├── services/       # ML services
│   │   │   ├── scorer.py       # DistilBERT empathy scoring
│   │   │   ├── rewriter.py     # T5 text rewriting
│   │   │   ├── embeddings.py   # Sentence embeddings
│   │   │   └── vectorstore.py  # ChromaDB integration
│   │   ├── schemas/        # Pydantic models
│   │   └── db/             # Database utilities
│   ├── training/           # Model training scripts
│   ├── saved_models/       # Trained model weights (not in git)
│   ├── data/               # Training datasets
│   └── requirements.txt
└── frontend/
    └── app.py              # Streamlit UI
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/empathy-engine.git
cd empathy-engine
```

### 2. Set Up Backend

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install backend dependencies
cd backend
pip install -r requirements.txt
```

### 3. Download or Train Models

> **Note**: Model files are not included in the repository due to their size (~267MB).

**Option A: Download Pre-trained Models** (Ask team lead for model files)
```bash
# Place model files in:
# backend/saved_models/empathy_scorer/
# backend/saved_models/empathy_rewriter/
```

**Option B: Train Models from Scratch**
```bash
cd backend/training
python train_scorer.py
python train_rewriter.py
```

### 4. Start the Backend Server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://127.0.0.1:8000`

- API Docs: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/`

### 5. Set Up & Run Frontend

Open a **new terminal**:

```bash
# From project root
cd frontend

# Install Streamlit (if not already installed)
pip install streamlit requests pandas plotly

# Run the frontend
streamlit run app.py
```

The UI will open at: `http://localhost:8501`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PROJECT_NAME=Empathy Engine
API_V1_STR=/api/v1
DEBUG=True
```

### API Endpoint (Frontend)

If your backend runs on a different port, update `API_URL` in `frontend/app.py`:

```python
API_URL = "http://127.0.0.1:8000/api/v1/analyze"
```

## 📡 API Reference

### Analyze Message

**POST** `/api/v1/analyze`

```json
{
  "text": "Your message here",
  "sender": "user_id"
}
```

**Response:**
```json
{
  "empathy_scores": {
    "warmth": 0.85,
    "validation": 0.72,
    "perspective_taking": 0.68,
    "supportiveness": 0.90,
    "non_judgmental": 0.75
  },
  "issues": [
    {
      "issue": "Harsh Language",
      "span": "detected text",
      "explanation": "reason"
    }
  ],
  "rewrites": [
    {
      "text": "Empathetic rewrite of the message"
    }
  ]
}
```

## 🧪 Development

### Running Tests

```bash
cd backend
pytest
```

### Project Structure for Frontend Developers

The frontend is a single Streamlit file (`frontend/app.py`) that:
1. Sends POST requests to the backend API
2. Displays empathy scores in a radar chart
3. Shows AI-suggested rewrites
4. Highlights detected issues

**Key areas to modify:**
- `create_radar_chart()` - Customize the visualization
- CSS styles (lines 17-56) - Update the UI theme
- Form handling (lines 118-142) - Modify input handling

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 Tech Stack

| Component | Technology |
|-----------|------------|
| Backend Framework | FastAPI |
| Frontend | Streamlit |
| Empathy Scorer | DistilBERT (fine-tuned) |
| Text Rewriter | T5-small (fine-tuned) |
| Vector Database | ChromaDB |
| Embeddings | sentence-transformers |

## 📄 License

This project is proprietary. All rights reserved.

---

**Need help?** Contact the team lead or open an issue.
