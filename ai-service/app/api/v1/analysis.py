import logging
from fastapi import APIRouter, HTTPException
from app.schemas.analysis import MapRequest, MapResponse, ReduceRequest, ReduceResponse
from app.services.analysis_service import map_analysis, reduce_analysis
from app.schemas.analysis import QueryRequest # Update imports
from app.services.analysis_service import answer_query

router = APIRouter()

@router.post("/map", response_model=MapResponse)
async def map_endpoint(request: MapRequest):
    try:
        result = await map_analysis(request)
        return MapResponse(result=result)
    except Exception as e:
        logging.exception("Error in /map endpoint")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reduce", response_model=ReduceResponse)
async def reduce_endpoint(request: ReduceRequest):
    try:
        result = await reduce_analysis(request)
        return ReduceResponse(result=result)
    except Exception as e:
        logging.exception("Error in /reduce endpoint")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query", response_model=ReduceResponse) # Can reuse ReduceResponse
async def query_endpoint(request: QueryRequest):
    try:
        result = await answer_query(request)
        return ReduceResponse(result=result)
    except Exception as e:
        logging.exception("Error in /query endpoint")
        raise HTTPException(status_code=500, detail=str(e))