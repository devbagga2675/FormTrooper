# app/schemas/generation.py
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class GenerationRequest(BaseModel):
    """
    Defines the structured input for a new form generation request.
    """
    form_context: str = Field(
        ...,
        min_length=1,
        description="A detailed description of the form's purpose and target audience, e.g., 'A quiz for 5th graders about the solar system'."
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
    
    pinecone_namespace: str | None = Field(
        default=None,
        description="The unique namespace for this form's vectors in Pinecone."
    )
class Question(BaseModel):
    question_text: str
    question_type: Literal['multiple_choice', 'short_answer', 'paragraph', 'checkboxes', 'linear_scale']
    options: List[str] = Field(default_factory=list, description="List of options for question types like 'multiple_choice' or 'checkboxes'.")
    correct_answer: Optional[str] = None

class FormStructure(BaseModel):
    title: str
    description: str
    questions: List[Question]
    suggested_actions: List[str] = Field(description="A list of 3-4 relevant analysis actions for the form's future responses.")

class GenerationResponse(BaseModel):
    form_data: FormStructure

class RefinementRequest(BaseModel):
    """
    Defines the input for a question refinement request.
    """
    user_context: str | None = Field(description="The original context the user provided for the form.")
    new_instruction: str = Field(
        ...,
        min_length=1,
        description="The new instruction from the user to refine the questions."
    )
    existing_questions: List[Question] = Field(description="The current list of question objects in the form.")
    pinecone_namespace: str | None = Field(default=None, description="The namespace in Pinecone for the form's document.")

class RefinedQuestionsList(BaseModel):
    questions: List[Question] = Field(description="The complete, refined list of questions.")

class RefinementResponse(BaseModel):
    """
    Defines the output for a refinement request, which is a list of questions.
    """
    # This can now be simplified or can use the new model for consistency.
    # For now, we'll keep it as is, but we'll use the new model for the parser.
    refined_questions: List[Question]
    
class DummyResponseRequest(BaseModel):
    questions: List[Question]
    persona: str = Field(description="The persona the AI should adopt, e.g., 'a happy customer'.")

from typing import Any
class DummyAnswers(BaseModel):
    answers: List[Any] = Field(description="A list containing the answer for each question, in order.")