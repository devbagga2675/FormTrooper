import React from "react";
import {
  Save,
  Eye,
  Share2,
  CornerDownLeft,
  Sparkles,
  Plus,
  X,
  Trash2,
  BarChart2,
  BarChart,
} from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import QuestionEditor from "../components/QuestionEditor";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getFormById, updateForm } from "../services/form.service";
import { refineForm } from "../services/ai.service";

// --- Main Static Page Component ---
const FormEditorPage = () => {
  // Static mock data to build the UI without logic
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeQuestionId, setActiveQuestionId] = useState(null);

  const [isRefining, setIsRefining] = useState(false);
  const [refinementInstruction, setRefinementInstruction] = useState("");

  const fetchForm = async () => {
    try {
      const response = await getFormById(id);
      setForm(response.data);
    } catch (err) {
      setError(
        "Failed to load form. It may not exist or you may not have permission to view it."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. This useEffect now only runs once on the initial page load
  useEffect(() => {
    setIsLoading(true);
    fetchForm();
  }, [id]);

  // 3. NEW: This useEffect handles the polling
  useEffect(() => {
    // If the form is still processing, set a timer to refetch the data
    if (form?.status === "PROCESSING" || form?.status === "AWAITING_DOCUMENT") {
      const timer = setTimeout(() => {
        console.log("Polling for form updates...");
        fetchForm();
      }, 3000); // Check again in 3 seconds

      // This is a cleanup function that React runs when the component unmounts
      // or before the effect runs again. It prevents memory leaks.
      return () => clearTimeout(timer);
    }
  }, [form]); // This effect re-runs every time the 'form' state changes

  const handleRefineSubmit = async () => {
    if (!refinementInstruction || !form) return;
    setIsRefining(true);
    setError(null);
    try {
      await refineForm(form.id, refinementInstruction);
      // After refining, refresh the form data to show the new questions
      await fetchForm();
      setRefinementInstruction(""); // Clear the input
    } catch (err) {
      console.error("Failed to refine form:", err);
      setError("AI refinement failed. Please try again.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (qIndex, field, value) => {
    setForm((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIndex] = { ...newQuestions[qIndex], [field]: value };
      return { ...prev, questions: newQuestions };
    });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    setForm((prev) => {
      const newQuestions = [...prev.questions];
      const newOptions = [...newQuestions[qIndex].options];
      newOptions[oIndex] = value;
      newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
      return { ...prev, questions: newQuestions };
    });
  };

  const addOption = (qIndex) => {
    setForm((prev) => {
      const newQuestions = [...prev.questions];
      const newOptions = [
        ...newQuestions[qIndex].options,
        `New Option ${newQuestions[qIndex].options.length + 1}`,
      ];
      newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
      return { ...prev, questions: newQuestions };
    });
  };

  const removeOption = (qIndex, oIndex) => {
    setForm((prev) => {
      const newQuestions = [...prev.questions];
      const newOptions = newQuestions[qIndex].options.filter(
        (_, i) => i !== oIndex
      );
      newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
      return { ...prev, questions: newQuestions };
    });
  };

  const moveQuestionUp = (index) => {
    if (index === 0) return; // Can't move the first item up
    setForm((prev) => {
      const newQuestions = [...prev.questions];
      // Swap the element with the one before it
      [newQuestions[index - 1], newQuestions[index]] = [
        newQuestions[index],
        newQuestions[index - 1],
      ];
      return { ...prev, questions: newQuestions };
    });
  };

  const moveQuestionDown = (index) => {
    if (index === form.questions.length - 1) return; // Can't move the last item down
    setForm((prev) => {
      const newQuestions = [...prev.questions];
      // Swap the element with the one after it
      [newQuestions[index + 1], newQuestions[index]] = [
        newQuestions[index],
        newQuestions[index + 1],
      ];
      return { ...prev, questions: newQuestions };
    });
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateForm(form.id, form);
      alert("Form saved successfully!"); // Simple success feedback
    } catch (err) {
      console.error("Failed to save form:", err);
      alert("Error: Could not save form."); // Simple error feedback
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      // Use a temporary ID for React's key. The backend will assign a real ID on save.
      id: `temp-${Date.now()}`,
      question_text: "New Question",
      question_type: "short_answer",
      options: [],
      correct_answer: null,
    };
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const deleteQuestion = (indexToDelete) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setForm((prev) => ({
        ...prev,
        questions: prev.questions.filter((_, index) => index !== indexToDelete),
      }));
    }
  };

  if (isLoading) return <div className="p-8">Loading form editor...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Command Bar */}
      <header className="bg-white p-4 flex justify-between items-center border-b-2 border-black">
        <div className="flex items-center gap-4">
          <button
            className="p-2 hover:bg-gray-200"
            onClick={() => {
              navigate("/dashboard");
            }}
          >
            <CornerDownLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">{form.title}</h1>
          <span className="text-xs font-bold bg-gray-200 px-2 py-1 uppercase">
            {form.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 border-2 border-black bg-white px-3 py-1 text-black font-bold hover:bg-gray-100">
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button className="flex items-center gap-2 border-2 border-black bg-white px-3 py-1 text-black font-bold hover:bg-gray-100">
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button
            onClick={() => navigate(`/forms/${form.id}/responses`)}
            className="flex items-center gap-2 border-2 border-black bg-white px-3 py-1 text-black font-bold hover:bg-gray-100"
          >
            <BarChart className="h-4 w-4" /> Responses
          </button>
          <button
            onClick={handleSaveChanges}
            className="flex items-center gap-2 border-2 border-black bg-black px-4 py-1 text-white font-bold hover:bg-gray-800 disabled:bg-gray-500"
            disabled={isSaving} // <-- Disable button while saving
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex">
        {/* Form Canvas */}
        <div className="flex-grow p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <input
                type="text"
                defaultValue={form.title}
                className="text-4xl font-bold w-full border-2 border-transparent p-2 -ml-2"
                readOnly
              />
              <TextareaAutosize
                name="question_text"
                value={form.description}
                className="text-lg text-gray-700 mt-2 w-full border-2 border-transparent p-2 -ml-2"
                minRows={1}
              />
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {form.questions.map((q, index) => (
                <QuestionEditor
                  key={q.id || index}
                  question={q}
                  index={index}
                  onQuestionChange={handleQuestionChange}
                  onOptionChange={handleOptionChange}
                  addOption={addOption}
                  removeOption={removeOption}
                  onDelete={deleteQuestion}
                  totalQuestions={form.questions.length} // <-- Pass total for disabling buttons
                  onMoveUp={moveQuestionUp} // <-- Pass the new handler
                  onMoveDown={moveQuestionDown}
                  isActive={activeQuestionId === q.id}
                  onClick={() => setActiveQuestionId(q.id)}
                />
              ))}
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={addQuestion}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-black px-4 py-3 text-black font-bold hover:bg-gray-200"
            >
              <Plus className="h-5 w-5" />
              Add New Question
            </button>
          </div>
        </div>

        {/* Agentic Sidebar */}
        <aside className="w-96 bg-white border-l-2 border-black p-6 flex flex-col">
          <h2 className="text-lg font-bold">AI Co-pilot</h2>
          <div className="mt-4 border-2 border-dashed border-gray-300 rounded-none p-4 flex-grow">
            <p className="text-sm font-bold text-black mb-2">
              Refine with an instruction
            </p>
            <textarea
              className="w-full border-2 border-black bg-white p-2 text-sm rounded-none focus:outline-none focus:ring-0 mb-2"
              rows="3"
              placeholder="e.g., Make the questions harder..."
              value={refinementInstruction}
              onChange={(e) => setRefinementInstruction(e.target.value)}
              disabled={isRefining}
            />
            <button
              onClick={handleRefineSubmit}
              className="w-full flex items-center justify-center gap-2 border-2 border-black bg-black px-4 py-2 text-white font-bold hover:bg-gray-800 disabled:bg-gray-500"
              disabled={isRefining}
            >
              <Sparkles className="h-4 w-4" />
              {isRefining ? "Regenerating..." : "Regenerate"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t-2 border-black border-dashed"></span>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 font-bold">OR</span>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 border-2 border-black bg-white px-4 py-2 text-black font-bold hover:bg-gray-100">
              <Plus className="h-4 w-4" />
              Suggest a New Question
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default FormEditorPage;
