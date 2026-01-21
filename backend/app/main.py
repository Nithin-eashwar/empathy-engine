from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import routes

app = FastAPI(title=settings.PROJECT_NAME)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "chrome-extension://*"],  # Allow React & Chrome Extension

    allow_credentials=True,
    allow_methods=["*"],  # Allow POST, GET, OPTIONS
    allow_headers=["*"],
)

# Include the routes
# app.include_router(router, prefix=settings.API_V1_STR)
app.include_router(routes.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Empathy Engine Backend is Running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)