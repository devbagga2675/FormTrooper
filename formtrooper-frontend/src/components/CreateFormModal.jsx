import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

const CreateFormModal = ({ isOpen, onClose, onSubmit, isLoading, error }) => {
  const [formContext, setFormContext] = useState("");
  const [numQuestions, setNumQuestions] = useState(7);
  const [additionalContext, setAdditionalContext] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add client-side validation
    if (!formContext.trim()) {
      alert("Please describe what the form is for.");
      return;
    }
    const formData = {
      form_context: formContext,
      num_questions: numQuestions,
      additional_context: additionalContext,
    };
    onSubmit(formData, selectedFile);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-8 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold leading-6 text-black tracking-tight mb-6"
                >
                  {" "}
                  {/* Black title */}
                  Create a New Form with AI
                </Dialog.Title>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="form-context"
                      className="block text-sm font-bold text-black mb-2"
                    >
                      {" "}
                      {/* Bold black labels */}
                      What is the form for? (Purpose & Audience)
                    </label>
                    <textarea
                      id="form-context"
                      rows="3"
                      className="mt-1 block w-full border-2 border-black bg-white shadow-none focus:outline-none focus:ring-0 focus:border-black sm:text-sm p-2 rounded-none"
                      placeholder="e.g., A quiz for 5th graders about the solar system"
                      value={formContext}
                      onChange={(e) => setFormContext(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="num-questions"
                      className="block text-sm font-bold text-black mb-2"
                    >
                      Number of Questions ({numQuestions})
                    </label>
                    <input
                      type="range"
                      id="num-questions"
                      min="3"
                      max="20"
                      value={numQuestions}
                      onChange={(e) =>
                        setNumQuestions(parseInt(e.target.value, 10))
                      }
                      className="w-full h-2 bg-gray-300 appearance-none cursor-pointer accent-black" // Brutalist range slider
                    />
                  </div>
                  <div className="mb-6">
                    <label
                      htmlFor="additional-context"
                      className="block text-sm font-bold text-black mb-2"
                    >
                      Additional Context (Optional)
                    </label>
                    <input
                      type="text"
                      id="additional-context"
                      className="mt-1 block w-full border-2 border-black bg-white shadow-none focus:outline-none focus:ring-0 focus:border-black sm:text-sm p-2 rounded-none"
                      placeholder="e.g., Make the tone humorous"
                      value={additionalContext}
                      onChange={(e) => setAdditionalContext(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="doc-upload"
                      className="block text-sm font-bold text-black mb-2"
                    >
                      Attach Document (Optional PDF)
                    </label>
                    <input
                      type="file"
                      id="doc-upload"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-2 file:border-black file:font-bold file:bg-white file:text-black hover:file:bg-gray-100"
                    />
                  </div>
                  {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                  )}
                  <div className="mt-8 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 h-9 border-2 border-black bg-white text-black text-sm font-bold rounded-none hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" // Brutalist button
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-4 h-9 border-2 border-black bg-black text-white text-sm font-bold rounded-none hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed" // Brutalist CTA button
                      disabled={isLoading}
                    >
                      {isLoading ? "Generating..." : "Generate Form"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateFormModal;
