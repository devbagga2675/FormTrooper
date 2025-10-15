from typing import List
from pydantic import BaseModel


class MapRequest(BaseModel):
    form_context: str
    responses: List[str]
    action_to_perform: str

class MapResponse(BaseModel):
    result: str

class ReduceRequest(BaseModel):
    action_to_perform: str
    intermediate_results: str

class ReduceResponse(BaseModel):
    result: str
    
class QueryRequest(BaseModel):
    user_query: str
    form_questions: List[dict] # Sending the original questions for context
    all_responses: List[dict]
