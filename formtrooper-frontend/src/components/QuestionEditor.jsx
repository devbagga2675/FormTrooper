import React from "react";
import TextareaAutosize from "react-textarea-autosize";
import {
  X,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react";

const questionTypes = [
  { value: "short_answer", label: "Short Answer" },
  { value: "paragraph", label: "Paragraph" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "checkboxes", label: "Checkboxes" },
  { value: "linear_scale", label: "Linear Scale" },
];

const QuestionEditor = ({
  question,
  index,
  isActive,
  onClick,
  onQuestionChange,
  onOptionChange,
  addOption,
  removeOption,
  onDelete,
  totalQuestions,
  onMoveUp,
  onMoveDown,
}) => {
  const showOptions = ["multiple_choice", "checkboxes"].includes(
    question.question_type
  );
  const staticSuggestedActions = [
    "Rephrase for clarity",
    "Check for bias",
    "Make it simpler",
  ];

  const isGradable = ["short_answer", "multiple_choice", "checkboxes", "linear_scale"].includes(question.question_type);
  return (
    <div
      onClick={onClick}
      className={`bg-white border-2 p-6 cursor-pointer transition-all duration-200 ${
        isActive ? "border-black shadow-md" : "border-gray-300"
      }`}
    >
      <div className="flex gap-4">
        {/* Main Question Content */}
        <div className="flex-grow space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-2 flex-grow">
              <span className="font-bold pt-2">{index + 1}.</span>
              <TextareaAutosize
                name="question_text"
                value={question.question_text}
                onChange={(e) =>
                  onQuestionChange(index, e.target.name, e.target.value)
                }
                className={`font-bold w-full bg-transparent border-2 p-2 -ml-2 resize-none overflow-hidden ${
                  isActive
                    ? "border-black focus:bg-gray-50"
                    : "border-transparent"
                }`}
                minRows={1}
                readOnly={!isActive}
              />
            </div>
            <select
              name="question_type"
              value={question.question_type}
              onChange={(e) =>
                onQuestionChange(index, e.target.name, e.target.value)
              }
              className="border-2 border-black bg-white p-2 text-sm font-bold"
              disabled={!isActive}
            >
              {questionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {isActive && showOptions && (
            <div className="pl-6 space-y-2">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) =>
                      onOptionChange(index, optionIndex, e.target.value)
                    }
                    className="w-full border-2 border-black bg-white p-2 text-sm rounded-none focus:outline-none focus:ring-0"
                  />
                  <button
                    onClick={() => removeOption(index, optionIndex)}
                    className="p-2 hover:bg-gray-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addOption(index)}
                className="flex items-center gap-2 mt-2 border-2 border-dashed border-black px-3 py-1 text-sm text-black font-bold hover:bg-gray-100"
              >
                <Plus className="h-4 w-4" /> Add Option
              </button>
            </div>
          )}
          {isActive && isGradable  && (
            <div className="pl-6 pt-4 border-t border-dashed">
                <label className="text-xs font-bold text-gray-500">Correct Answer</label>
                <input
                    type="text"
                    name="correct_answer"
                    value={question.correct_answer || ''}
                    onChange={(e) => onQuestionChange(index, e.target.name, e.target.value)}
                    className="mt-1 w-full border-2 border-black bg-white p-2 text-sm rounded-none focus:outline-none focus:ring-0"
                    placeholder="Enter the correct answer"
                />
            </div>
          )}
        </div>

        {/* Vertical Action Toolbar - Only visible when active */}
        <div
          className={`flex flex-col items-center justify-start gap-2 border-l-2 border-gray-200 pl-4 transition-opacity ${
            isActive ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={() => onDelete(index)}
            className="p-2 text-gray-500 hover:text-red-600"
            aria-label="Delete question"
          >
            <Trash2 className="h-5 w-5" />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-blue-600"
            aria-label="Duplicate question"
          >
            <Copy className="h-5 w-5" />
          </button>
          <button
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-2 text-gray-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed"
            aria-label="Move up"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={index === totalQuestions - 1}
            className="p-2 text-gray-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed"
            aria-label="Move down"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* AI Actions Panel - Now correctly positioned */}
      {isActive && (
        <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-300">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            AI Actions
          </h4>
          <div className="flex flex-wrap gap-2">
            {staticSuggestedActions.map((action) => (
              <button
                key={action}
                className="flex items-center gap-2 border-2 border-black bg-white px-3 py-1 text-sm text-black font-bold hover:bg-gray-100"
              >
                <Sparkles className="h-4 w-4" />
                {action}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;
