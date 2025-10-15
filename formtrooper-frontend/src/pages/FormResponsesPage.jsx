import React, { useState, useEffect, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFormById, getFormResponses } from "../services/form.service";
import { analyzeFormResponses } from "../services/analysis.service";
import { queryForm } from "../services/ai.service";
import { BarChart, Sparkles, X, ChevronLeft, Download } from "lucide-react";
import ViewResponseModal from "../components/ViewResponseModal";
import ReactMarkdown from "react-markdown";

const SummaryBar = ({ summary }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <div className="bg-white border-2 border-black p-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
        Total Responses
      </h3>
      <p className="text-5xl font-bold text-black mt-2">
        {summary.totalResponses}
      </p>
    </div>
    <div className="bg-white border-2 border-black p-6 flex items-center justify-center">
      <button className="flex items-center gap-2 border-2 border-black bg-black px-4 py-2 text-white font-bold hover:bg-gray-800">
        <Download className="h-5 w-5" />
        Export to Excel
      </button>
    </div>
  </div>
);

const AIAnalysisDashboard = ({
  suggestedActions,
  onActionClick,
  analysisResult,
  analyzingAction,
  onQuerySubmit,
}) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onQuerySubmit(query);
    setQuery("");
  };

  const isAnyActionRunning = !!analyzingAction;

  return (
    <div className="bg-white border-2 border-black p-8 mb-8">
      <h2 className="text-3xl font-bold text-black tracking-tighter">
        AI Analysis
      </h2>
      <p className="mt-2 text-gray-700">
        Select a suggested action or ask a specific question about your data.
      </p>

      <div className="mt-6 border-t-2 border-black pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestedActions &&
            suggestedActions.map((action, index) => (
              <button
                key={index}
                onClick={() => onActionClick(action)}
                disabled={isAnyActionRunning}
                className="flex items-center gap-3 text-left border-2 border-black bg-white p-4 text-black font-bold hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                <Sparkles className="h-5 w-5 flex-shrink-0" />
                <span>
                  {analyzingAction === action ? "Analyzing..." : action}
                </span>
              </button>
            ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a specific question... (e.g., 'What was the average rating?')"
            className="flex-grow border-2 border-black bg-white p-4 text-black font-bold placeholder-gray-500 focus:outline-none rounded-none"
            disabled={isAnyActionRunning}
          />
          <button
            type="submit"
            className="flex-shrink-0 border-2 border-black bg-black p-4 text-white font-bold hover:bg-gray-800 disabled:bg-gray-500"
            aria-label="Submit query"
            disabled={isAnyActionRunning}
          >
            {analyzingAction === "custom_query" ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </button>
        </form>

        {analysisResult && (
          <div className="mt-6 border-2 border-black bg-gray-50 p-6">
            <h3 className="font-bold text-lg mb-2">Analysis Result:</h3>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{analysisResult}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ResponsesTable = ({ responses, questions }) => {
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewClick = (response) => {
    setSelectedResponse(response);
    setIsModalOpen(true);
  };
  return (
    <div className="overflow-x-auto bg-white border-2 border-black">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b-2 border-black bg-black text-white uppercase tracking-wider">
          <tr>
            <th scope="col" className="px-6 py-3">
              Response ID
            </th>
            <th scope="col" className="px-6 py-3">
              Submitted On
            </th>
            <th scope="col" className="px-6 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {responses && responses.length > 0 ? (
            responses.map((response) => (
              <tr
                key={response.id}
                className="border-b-2 border-black last:border-b-0"
              >
                <td className="whitespace-nowrap px-6 py-4 font-mono">
                  #{response.id}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {new Date(response.createdAt).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <button
                    onClick={() => handleViewClick(response)} // <-- 3. Update onClick handler
                    className="border-2 border-black bg-white px-3 py-1 text-black font-bold hover:bg-gray-100"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center py-8 text-gray-500">
                This form has not received any responses yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <ViewResponseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        response={selectedResponse}
        questions={questions}
      />
    </div>
  );
};

const FormResponsesPage = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzingAction, setAnalyzingAction] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formPromise = getFormById(id);
        const responsesPromise = getFormResponses(id);

        const [formRes, responsesRes] = await Promise.all([
          formPromise,
          responsesPromise,
        ]);

        setForm(formRes.data);
        setResponses(responsesRes.data.responses);
      } catch (err) {
        setError("Failed to load form data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleActionClick = async (actionText) => {
    setAnalyzingAction(actionText);
    setAnalysisResult(null);
    setError(null);
    try {
      const response = await analyzeFormResponses(id, actionText);
      setAnalysisResult(response.data.result);
    } catch (err) {
      setError("Failed to generate analysis.");
      console.error(err);
    } finally {
      setAnalyzingAction(null);
    }
  };

  const handleQuerySubmit = async (query) => {
    setAnalyzingAction("custom_query");
    setAnalysisResult(null);
    setError(null);
    try {
      const response = await queryForm(id, query);
      setAnalysisResult(response.data.result);
    } catch (err) {
      setError("Failed to answer your question.");
      console.error(err);
    } finally {
      setAnalyzingAction(null);
    }
  };

  if (isLoading) {
    return <div className="p-8 font-bold">Loading responses...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500 font-bold">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 font-bold text-black mb-4 hover:underline"
          >
            <ChevronLeft className="h-5 w-5" /> Back
          </button>
          <h1 className="text-4xl font-bold text-black tracking-tighter mb-2">
            {form?.title}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Analyze your collected data and uncover insights.
          </p>

          <SummaryBar summary={{ totalResponses: responses.length }} />
          <AIAnalysisDashboard
            suggestedActions={form?.suggested_actions}
            onActionClick={handleActionClick}
            analysisResult={analysisResult}
            analyzingAction={analyzingAction}
            onQuerySubmit={handleQuerySubmit}
          />

          <h2 className="text-2xl font-bold mb-4 mt-12">
            Individual Response
          </h2>
          <ResponsesTable responses={responses} questions={form?.questions}/>
        </div>
      </main>
    </div>
  );
};

export default FormResponsesPage;
