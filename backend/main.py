from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pharma_guard.core.config import settings
from backend.api import routes

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="PharmaGuard API for Pharmacogenomic Risk Prediction"
)

# CORS Middleware (Allow All for Development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routes
app.include_router(routes.router)

@app.get("/")
def root():
    return {"message": "Welcome to PharmaGuard API. Visit /docs for documentation."}
