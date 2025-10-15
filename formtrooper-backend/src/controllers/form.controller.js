const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { triggerAIGeneration } = require("../services/ai.service");
const { v4: uuidv4 } = require("uuid");

const generateFormController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { form_context, additional_context, hasDocument, num_questions } =
      req.body;
    const userContext = `${form_context}\n\nAdditional Instructions: ${
      additional_context || "None"
    }`;

    // Generate a unique namespace if a document is being uploaded
    const pineconeNamespace = hasDocument ? uuidv4() : null;

    const newForm = await prisma.form.create({
      data: {
        title: "New Form (Generating...)",
        description: "",
        user_context: userContext,
        status: hasDocument ? "AWAITING_DOCUMENT" : "PROCESSING",
        userId: userId,
        pinecone_namespace: pineconeNamespace, // <-- Save the namespace
      },
    });

    if (!hasDocument) {
      triggerAIGeneration(newForm.id);
    }

    res.status(201).json({
      message: "Form record created.",
      formId: newForm.id,
    });
  } catch (error) {
    next(error);
  }
};

const getUserFormsController = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from the protectRoute middleware

    // Use Prisma to find all forms where the userId matches the logged-in user's ID
    // Order them by the newest first
    const forms = await prisma.form.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(forms);
  } catch (error) {
    console.error("Error fetching user forms:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching forms." });
  }
};

const deleteFormController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const formId = parseInt(req.params.id);

    // 1. Security Check: Find the form to ensure it exists and belongs to the user
    const form = await prisma.form.findUnique({
      where: {
        id: formId,
      },
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found." });
    }

    if (form.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this form." });
    }

    // 2. Delete the form. The database will automatically delete the questions.
    await prisma.form.delete({
      where: {
        id: formId,
      },
    });

    res
      .status(200)
      .json({ message: "Form and its questions deleted successfully." });
  } catch (error) {
    next(error);
  }
};

const getFormByIdController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const formId = parseInt(req.params.id);

    if (isNaN(formId)) {
      return res.status(400).json({ message: "Invalid form ID." });
    }

    // Find the form that matches the ID AND belongs to the logged-in user
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: userId,
      },
      include: {
        questions: true, // Also fetch all associated questions
      },
    });

    if (!form) {
      return res.status(404).json({
        message: "Form not found or you do not have permission to view it.",
      });
    }

    res.status(200).json(form);
  } catch (error) {
    next(error);
  }
};

const updateFormController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const formId = parseInt(req.params.id);
    const { title, description, questions } = req.body;

    // --- (Security Check remains the same) ---
    const form = await prisma.form.findFirst({
      where: { id: formId, userId: userId },
    });

    if (!form) {
      return res.status(403).json({
        message: "Form not found or you do not have permission to edit it.",
      });
    }

    // --- NEW: Clean the incoming questions data ---
    const choiceTypes = ["multiple_choice", "checkboxes", "linear_scale"];
    const cleanedQuestions = questions.map((q) => {
      // If the question type is NOT a choice-based one, clear its options array.
      if (!choiceTypes.includes(q.question_type)) {
        return { ...q, options: [] };
      }
      return q;
    });

    // --- (Transaction logic now uses the cleaned data) ---
    const updatedForm = await prisma.$transaction(async (tx) => {
      await tx.form.update({
        where: { id: formId },
        data: { title, description },
      });

      await tx.question.deleteMany({
        where: { formId: formId },
      });

      if (cleanedQuestions && cleanedQuestions.length > 0) {
        await tx.question.createMany({
          data: cleanedQuestions.map((q) => ({
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options,
            correct_answer: q.correct_answer,
            formId: formId,
          })),
        });
      }

      return tx.form.findUnique({ where: { id: formId } });
    });

    res
      .status(200)
      .json({ message: "Form updated successfully.", form: updatedForm });
  } catch (error) {
    next(error);
  }
};

const generateDummyResponsesController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const formId = parseInt(req.params.id);
    const { count = 12, persona } = req.body;

    const form = await prisma.form.findFirst({
      where: { id: formId, userId: userId },
      include: { questions: { orderBy: { id: "asc" } } }, // Ensure consistent order
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found." });
    }

    const personas = [
      "The Coffee Aficionado (Mixed): Loves the single-origin bean selection but found the espresso shot slightly over-extracted.",
      "The Rushed Commuter (Negative): Just wanted a quick coffee before work but thought the service was too slow.",
      "The Remote Worker (Positive): Appreciates the plentiful power outlets, reliable Wi-Fi, and comfortable seating for a long work session.",
      "The Student on a Budget (Positive): Loves the affordable prices and the quiet, study-friendly atmosphere.",
      "The Instagrammer (Positive): Cares more about the aesthetic; loves the interior design, latte art, and overall 'vibe' for their photos.",
      "The Parent with Kids (Mixed): Found the staff friendly but wishes there were more kid-friendly snack options and better accessibility for a stroller.",
      "The 'First Timer' (Neutral): Thought the coffee and pastry were fine, but nothing stood out to make them choose this shop over their usual spot.",
      "The Disappointed Tourist (Negative): Was hoping for a unique local experience but felt the shop was generic and the staff was unhelpful.",
      "The 'Bad Service' Customer (Negative): The coffee might have been good, but their experience was ruined by a staff member who seemed rude or dismissive.",
      "The Regular-in-Training (Positive): Lives nearby, loves the friendly baristas who are starting to remember their order, and considers this their new go-to spot.",
      "The Price-Sensitive Patron (Negative): Thinks the prices are too high for the quality and portion sizes compared to other coffee shops in the area.",
      "The Dietary Needs Customer (Mixed): Was thrilled to find oat and almond milk options but was disappointed by the complete lack of gluten-free food choices.",
    ];
    const loopCount = Math.min(count, personas.length);

    for (let i = 0; i < loopCount; i++) {
      const aiResponse = await axios.post(
        process.env.AI_SERVICE_URL_DUMMY ||
          "http://localhost:8000/api/v1/generate-dummy-answers",
        {
          questions: form.questions,
          persona: personas[i],
        }
      );
      // The AI now returns a simple array of answers
      const aiAnswersArray = aiResponse.data;

      // Ensure the AI returned the correct number of answers
      if (aiAnswersArray.length !== form.questions.length) {
        throw new Error("AI returned an incorrect number of answers.");
      }

      // --- THE FIX: Map answers by index ---
      const answersToCreate = form.questions.map((question, index) => {
        const answerValue = aiAnswersArray[index];
        return {
          questionId: question.id, // Use the real, trusted ID
          value: answerValue !== undefined ? answerValue : "No answer provided",
        };
      });

      // Save the generated response to the database
      await prisma.response.create({
        data: {
          formId: formId,
          answers: {
            create: answersToCreate,
          },
        },
      });
    }

    res.status(200).json({
      message: `${loopCount} dummy responses generated successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

const getFormResponsesController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const formId = parseInt(req.params.id);

    if (isNaN(formId)) {
      return res.status(400).json({ message: "Invalid form ID." });
    }

    // 1. Security Check: Verify the form exists and belongs to the user
    const form = await prisma.form.findFirst({
      where: { id: formId, userId: userId },
    });

    if (!form) {
      return res.status(404).json({
        message: "Form not found or you do not have permission to view it.",
      });
    }

    // 2. Fetch all responses for this form
    const responses = await prisma.response.findMany({
      where: {
        formId: formId,
      },
      // --- THE FIX IS HERE ---
      include: {
        answers: true, // Also fetch all associated answers for each response
      },
      // -----------------------
      orderBy: {
        createdAt: "desc",
      },
    });

    // We also fetch the form title to display on the page
    res.status(200).json({ formTitle: form.title, responses: responses });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateFormController,
  getUserFormsController,
  deleteFormController,
  getFormByIdController,
  generateDummyResponsesController,
  updateFormController,
  getFormResponsesController,
};
