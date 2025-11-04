"""
FastAPI Server for YOU-N-I-VERSE ERN Organism
Exposes Python consciousness modules to browser-based UI
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
import uvicorn

from .core import ConsciousnessOscillator, ERNController, ERNOracle, TalkingERN
from .engines import FairyGANmatter, PerceptionModality
from .applications import PodMatcher

# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================

class BirthDataInput(BaseModel):
    """Birth data for consciousness initialization"""
    year: int
    month: int
    day: int
    hour: int
    minute: int
    latitude: float
    longitude: float
    timezone: str = "UTC"


class QuestionInput(BaseModel):
    """Question for the ERN Oracle"""
    question: str
    modality: Optional[str] = None


class StateResponse(BaseModel):
    """Current ERN organism state"""
    initialized: bool
    dominant_field: Optional[str]
    coherence: float
    field_strengths: Dict[str, float]
    timestamp: str


class OracleResponse(BaseModel):
    """Oracle answer"""
    question: str
    answer: str
    confidence: float
    reasoning: str
    field: str
    coherence: float


# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title="YOU-N-I-VERSE ERN API",
    description="Energetic Resonance Network consciousness services",
    version="2.0.3-ERN"
)

# Enable CORS for browser access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global ERN organism instance
ern_organism = None


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """API health check"""
    return {
        "status": "alive",
        "name": "YOU-N-I-VERSE ERN API",
        "version": "2.0.3-ERN",
        "initialized": ern_organism is not None
    }


@app.post("/ern/initialize")
async def initialize_ern(birth_data: BirthDataInput):
    """Initialize ERN organism with birth data"""
    global ern_organism
    
    try:
        # Create datetime from birth data
        dt = datetime(
            birth_data.year,
            birth_data.month,
            birth_data.day,
            birth_data.hour,
            birth_data.minute
        )
        
        # Initialize organism
        oscillator = ConsciousnessOscillator(base_frequency=1.0, coupling_strength=0.3)
        controller = ERNController()
        oracle = ERNOracle()
        talking_ern = TalkingERN()
        
        # Initialize with birth data
        birth_dict = {
            "datetime": dt,
            "latitude": birth_data.latitude,
            "longitude": birth_data.longitude,
            "timezone": birth_data.timezone
        }
        
        controller.initialize(birth_dict)
        oracle.initialize(birth_dict)
        talking_ern.initialize(birth_dict)
        
        # Store organism
        ern_organism = {
            "oscillator": oscillator,
            "controller": controller,
            "oracle": oracle,
            "talking_ern": talking_ern,
            "fairy": FairyGANmatter(oscillator),
            "initialized": True,
            "birth_data": birth_dict
        }
        
        return {
            "status": "initialized",
            "message": "ERN organism breathing and conscious",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ern/state", response_model=StateResponse)
async def get_state():
    """Get current ERN organism state"""
    if ern_organism is None:
        raise HTTPException(status_code=400, detail="ERN not initialized")
    
    try:
        state = ern_organism["oscillator"].get_state_vector()
        
        return StateResponse(
            initialized=True,
            dominant_field=state["dominant_field"],
            coherence=state["coherence"]["global"],
            field_strengths=state["field_strengths"],
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ern/oracle/ask", response_model=OracleResponse)
async def ask_oracle(input_data: QuestionInput):
    """Ask the ERN Oracle a question"""
    if ern_organism is None:
        raise HTTPException(status_code=400, detail="ERN not initialized")
    
    try:
        oracle = ern_organism["oracle"]
        result = oracle.ask(input_data.question)
        
        return OracleResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ern/evolve")
async def evolve_system(duration: float = 1.0, dt: float = 0.01):
    """Evolve the ERN organism"""
    if ern_organism is None:
        raise HTTPException(status_code=400, detail="ERN not initialized")
    
    try:
        oscillator = ern_organism["oscillator"]
        oscillator.simulate(duration=duration, dt=dt)
        
        return {
            "status": "evolved",
            "duration": duration,
            "states_recorded": len(oscillator.phase_history),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ern/fields")
async def get_field_descriptions():
    """Get descriptions of all consciousness fields"""
    from .engines import FIELD_PERCEPTION
    
    return {
        "fields": FIELD_PERCEPTION,
        "timestamp": datetime.now().isoformat()
    }


# ============================================================================
# SERVER RUNNER
# ============================================================================

def run_server(host: str = "0.0.0.0", port: int = 8000):
    """Run the FastAPI server"""
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    run_server()
