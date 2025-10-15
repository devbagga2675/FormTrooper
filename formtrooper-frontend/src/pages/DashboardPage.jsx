import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle, LogOut } from "lucide-react";
import CreateFormModal from "../components/CreateFormModal";
import { generateForm } from "../services/form.service";
import Navbar from "../components/Navbar";
import FormsTable from "../components/FormsTable";
import { uploadDocument } from "../services/form.service";
import logo from "../assets/formtrooper-logo.png";

// --- Navbar Component ---

// --- Main Dashboard Page Component ---
const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGenerateForm = async (formData, file) => {
    setIsLoading(true);
    setError("");
    try {
      // 1. Create the form record and get its ID
      const initialPayload = { ...formData, hasDocument: !!file };

      // 1. Create the form record and get its ID
      const createResponse = await generateForm(initialPayload);
      const newFormId = createResponse.data.formId;

      // 2. If there's a file, upload it with the new ID
      if (file && newFormId) {
        await uploadDocument(file, newFormId);
      }

      setIsModalOpen(false);
      // 3. Redirect immediately
      navigate(`/forms/${newFormId}/edit`);
    } catch (err) {
      setError("Failed to start form generation. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border-2 border-black p-8 md:p-12 mb-8 md:flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold text-black tracking-tighter">
                Create Forms, Faster.
              </h1>
              <p className="mt-4 text-lg text-gray-700 max-w-2xl">
                Go from a simple idea to a complete form, survey, or quiz in
                seconds. Let AI do the heavy lifting for you.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 border-2 border-black bg-black px-6 py-3 text-white font-bold text-lg hover:bg-gray-800"
              >
                + New Form
              </button>
            </div>
            <div className="flex-1 flex md:justify-end sm:p-10">
              <img src={logo} style={{ height: "160px" }} />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4">Your Forms</h2>
          <FormsTable />
        </div>
      </main>

      <CreateFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleGenerateForm}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default DashboardPage;
