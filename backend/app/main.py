from fastapi import FastAPI
from app.core.config import settings
from app.api.routes import router

app = FastAPI(title=settings.PROJECT_NAME)

# Include the routes
app.include_router(router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Empathy Engine Backend is Running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)