import React from "react";
import { getUserForms, deleteForm } from "../services/form.service";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Mock data to display in the table
const FormsTable = () => {
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // This function runs when the component mounts
    const fetchForms = async () => {
      try {
        const response = await getUserForms();
        setForms(response.data);
      } catch (err) {
        setError("Failed to load forms.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForms();
  }, []); // The empty array ensures this runs only once

  const handleViewForm = (formId) => {
    navigate(`/forms/${formId}/edit`);
  };

  const handleDeleteForm = async (formId) => {
    // A confirmation dialog is a good practice to prevent accidental deletions
    if (window.confirm("Are you sure you want to delete this form?")) {
      try {
        await deleteForm(formId);
        // Update the UI by filtering out the deleted form from the state
        setForms(forms.filter((form) => form.id !== formId));
      } catch (err) {
        console.error("Failed to delete form:", err);
        // You could set another error state here to show a notification
        alert("Failed to delete the form. Please try again.");
      }
    }
  };

  if (isLoading) {
    return <p>Loading your forms...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="overflow-x-auto bg-white border-2 border-black">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b-2 border-black bg-black text-white uppercase tracking-wider">
          <tr>
            <th scope="col" className="px-6 py-3">
              Title
            </th>
            <th scope="col" className="px-6 py-3">
              Created On
            </th>
            <th scope="col" className="px-6 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {forms.length > 0 ? (
            forms.map((form) => (
              <tr
                key={form.id}
                className="border-b-2 border-black last:border-b-0"
              >
                <td className="whitespace-nowrap px-6 py-4 font-medium">
                  {form.title}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {new Date(form.createdAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 flex items-center gap-2">
                  <button
                    onClick={() => handleViewForm(form.id)}
                    className="border-2 border-black bg-white px-3 py-1 text-black font-bold hover:bg-gray-100"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteForm(form.id)}
                    className="border-2 text-black font-bold border-black bg-red-500 px-3 py-1 text-white font-bold hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center py-8 text-gray-500">
                You haven't created any forms yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FormsTable;
