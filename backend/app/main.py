from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import auth, connections, schema, query, history
from app.services.sample_db_seed import seed_sample_database

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(connections.router, prefix=f"{settings.API_V1_STR}/connections", tags=["Database Connections"])
app.include_router(schema.router, prefix=f"{settings.API_V1_STR}/schema", tags=["Schema Discovery"])
app.include_router(query.router, prefix=f"{settings.API_V1_STR}/query", tags=["AI Query Engine"])
app.include_router(history.router, prefix=f"{settings.API_V1_STR}/history", tags=["Query History"])

@app.on_event("startup")
def startup_event():
    # Ensure sample database is initialized on server start
    seed_sample_database()

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
