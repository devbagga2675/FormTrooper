const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const analyzeResponsesController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const formId = parseInt(req.params.formId);
    const { action_text } = req.body;

    const form = await prisma.form.findFirst({
      where: { id: formId, userId: userId },
      include: {
        questions: true,
        responses: { include: { answers: true } },
      },
    });

    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    const allTextAnswers = form.responses.flatMap(response => 
      response.answers.map(answer => {
        if (Array.isArray(answer.value)) {
          return answer.value.join(', ');
        }
        return String(answer.value);
      })
    );

    if (allTextAnswers.length === 0) {
      return res.status(200).json({ result: "No text responses to analyze." });
    }

    const batches = chunkArray(allTextAnswers, 20);
    
    const apiCallPromises = batches.map(batch => {
      return axios.post(
        process.env.AI_SERVICE_URL_ANALYZE || 'http://localhost:8000/api/v1/analyze/map',
        {
          form_context: form.user_context,
          responses: batch,
          action_to_perform: action_text,
        }
      );
    });

    const intermediateResults = await Promise.all(apiCallPromises);
    const combinedResults = intermediateResults.map(res => res.data.result).join('\n---\n');

    const finalResponse = await axios.post(
      process.env.AI_SERVICE_URL_ANALYZE || 'http://localhost:8000/api/v1/analyze/reduce',
      {
        action_to_perform: action_text,
        intermediate_results: combinedResults,
      }
    );

    res.status(200).json({ result: finalResponse.data.result });

  } catch (error) {
    // --- IMPROVED ERROR LOGGING ---
    console.error("--- ANALYSIS CONTROLLER ERROR ---");
    // Check if the error is from an Axios request to the AI service
    if (error.response) {
      console.error("AI Service responded with an error:");
      // Log the full, detailed error payload from the Python service
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    }
    // Pass the original error to the main error handler
    next(error);
  }
};

module.exports = { analyzeResponsesController };