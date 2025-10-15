import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";

const ViewResponseModal = ({ isOpen, onClose, response, questions }) => {
  if (!isOpen || !response) return null;

  // A helper function to find and format the answer for a given question ID
  const getAnswerForQuestion = (questionId) => {
    // Find the answer that matches the current question's ID
    const answer = response.answers?.find(
      (ans) => ans.questionId === questionId
    );

    if (!answer || answer.value === null) {
      return <span className="text-gray-500 italic">No answer provided</span>;
    }

    // Handle different answer formats (string, array of strings, etc.)
    if (Array.isArray(answer.value)) {
      return answer.value.join(", ");
    }
    return String(answer.value);
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
          <div className="fixed inset-0 bg-black bg-opacity-70" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-none bg-white p-8 text-left align-middle shadow-xl transition-all border-2 border-black">
                <div className="flex justify-between items-center">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold leading-6 text-black tracking-tight"
                  >
                    Response #{response.id}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-200 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted on: {new Date(response.createdAt).toLocaleString()}
                </p>

                <div className="mt-6 space-y-6 border-t-2 border-black pt-6">
                  {questions.map((question, index) => (
                    <div key={question.id}>
                      <label className="block text-sm font-bold text-black">
                        {index + 1}. {question.question_text}
                      </label>
                      <div className="mt-2 border-2 border-black bg-gray-50 p-4 text-gray-800">
                        {getAnswerForQuestion(question.id)}
                      </div>
                    </div>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ViewResponseModal;
