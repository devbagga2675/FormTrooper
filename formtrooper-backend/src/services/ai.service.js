const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const triggerAIGeneration = async (formId) => {
  try {
    const form = await prisma.form.findUnique({ where: { id: formId } });
    if (!form) {
      throw new Error(`Form with ID ${formId} not found.`);
    }

    console.log(`Triggering AI generation for Form ID: ${form.id}`);
    
    const payload = {
      form_context: form.user_context,
      num_questions: 7,
      document_url: form.document_url,
      pinecone_namespace: form.pinecone_namespace,
    };

    const aiResponse = await axios.post(
      process.env.AI_SERVICE_URL || 'http://localhost:8000/api/v1/generate', 
      payload
    );

    // Destructure the new 'suggested_actions' field from the AI's response
    const { title, description, questions, suggested_actions } = aiResponse.data.form_data;
    
    // Update the form with all the final, AI-generated content
    await prisma.form.update({
      where: { id: formId },
      data: {
        title,
        description,
        status: 'COMPLETE',
        questions: { create: questions },
        suggested_actions: suggested_actions, // <-- Save the new field
      },
    });
    console.log(`✅ Form ID ${formId} has been successfully generated.`);
  } catch (err) {
    console.error(`❌ AI generation failed for Form ID ${formId}.`);
    if (err.response) {
        console.error('AI Service Error:', err.response.data);
    }
    await prisma.form.update({ where: { id: formId }, data: { status: 'FAILED' } });
  }
};

module.exports = { triggerAIGeneration };