# app/schemas/generation.py
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class GenerationRequest(BaseModel):
    """
    Defines the structured input for a new form generation request.
    """
    purpose: str = Field(
        ..., 
        min_length=4,
        description="The form's objective or topic. Can be a category like 'Quiz' or a description like 'A survey about employee satisfaction'."
    )
    
    target_audience: str = Field(
        ...,
        min_length=3,
        description="The intended audience for the form, e.g., '5th Graders' or 'New Customers'."
    )
    
    num_questions: int = Field(
        default=7, 
        ge=3, 
        le=20,
        description="The desired number of questions for the form."
    )
    
    additional_context: str | None = Field(
        default=None, 
        description="Optional: Any other specific instructions or details for the AI."
    )

    document_url: str | None = Field(
        default=None,
        description="Optional: URL of a document for context-aware generation."
    )

class Question(BaseModel):
    question_text: str
    question_type: Literal['multiple_choice', 'short_answer', 'paragraph', 'checkboxes', 'linear_scale']
    options: List[str] = [] # <-- FIX: Make this optional with a default empty list
    correct_answer: Optional[str] = None

class FormStructure(BaseModel):
    title: str
    description: str
    questions: List[Question]

class GenerationResponse(BaseModel):
    form_data: FormStructure
