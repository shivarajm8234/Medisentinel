from fastapi import APIRouter

router = APIRouter(prefix="/ml-models", tags=["ML Models"])

@router.get("/registry")
async def get_model_registry():
    return [
        {
            "id": 1,
            "name": "Network LSTM",
            "version": "v1.2.4",
            "dataset": "CICIDS-2018",
            "accuracy": 96.8,
            "fpr": 1.4,
            "last_retrained": "2026-04-25T10:00:00Z",
            "status": "active"
        },
        {
            "id": 2,
            "name": "Isolation Forest",
            "version": "v2.0.1",
            "dataset": "NSL-KDD",
            "accuracy": 95.2,
            "fpr": 2.1,
            "last_retrained": "2026-04-20T10:00:00Z",
            "status": "active"
        },
        {
            "id": 3,
            "name": "IoT Autoencoder",
            "version": "v1.0.0",
            "dataset": "IoTID20",
            "accuracy": 98.1,
            "fpr": 0.8,
            "last_retrained": "2026-04-28T14:30:00Z",
            "status": "active"
        }
    ]

@router.get("/robustness")
async def get_robustness():
    return {
        "evasion_resistance": 92,
        "poisoning_resistance": 88,
        "extraction_resistance": 95,
        "overall_art_score": 91.6
    }
