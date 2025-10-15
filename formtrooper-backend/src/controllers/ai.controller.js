const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const refineFormController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const formId = parseInt(req.params.formId);
    const { new_instruction } = req.body;

    if (!new_instruction) {
      return res.status(400).json({ message: 'New instruction is required.' });
    }

    // 1. Fetch the form and its current questions to get all context
    const form = await prisma.form.findFirst({
      where: { id: formId, userId: userId },
      include: { questions: true },
    });

    if (!form) {
      return res.status(404).json({ message: 'Form not found or you do not have permission.' });
    }

    // 2. Call the Python AI Service's new '/refine' endpoint
    const aiResponse = await axios.post(
      process.env.AI_SERVICE_URL_REFINE || 'http://localhost:8000/api/v1/refine',
      {
        user_context: form.user_context,
        new_instruction: new_instruction,
        existing_questions: form.questions,
        pinecone_namespace: form.pinecone_namespace,
      }
    );

    const refinedQuestions = aiResponse.data.refined_questions;

    // 3. Use a transaction to replace the old questions with the new set
    await prisma.$transaction(async (tx) => {
      // First, delete all existing questions for this form
      await tx.question.deleteMany({
        where: { formId: formId },
      });

      // Then, create the new, refined set of questions
      if (refinedQuestions && refinedQuestions.length > 0) {
        await tx.question.createMany({
          data: refinedQuestions.map(q => ({
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options,
            correct_answer: q.correct_answer,
            formId: formId,
          })),
        });
      }
    });

    res.status(200).json({ message: 'Form questions refined successfully.' });
  } catch (error) {
    next(error);
  }
};

const queryFormController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const formId = parseInt(req.params.formId);
    const { user_query } = req.body; // The user's question from the frontend

    if (!user_query) {
      return res.status(400).json({ message: 'A query is required.' });
    }

    // 1. Fetch the form, its questions, and all its responses with answers
    const form = await prisma.form.findFirst({
      where: { id: formId, userId: userId },
      include: {
        questions: true,
        responses: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!form) {
      return res.status(404).json({ message: 'Form not found or you do not have permission.' });
    }

    // 2. Call the Python AI Service's new '/query' endpoint
    const aiResponse = await axios.post(
      process.env.AI_SERVICE_URL_QUERY || 'http://localhost:8000/api/v1/analyze/query',
      {
        user_query: user_query,
        form_questions: form.questions,
        all_responses: form.responses,
      }
    );

    // 3. Return the AI's direct answer to the frontend
    res.status(200).json({ result: aiResponse.data.result });

  } catch (error) {
    next(error);
  }
};

module.exports = { refineFormController, queryFormController };