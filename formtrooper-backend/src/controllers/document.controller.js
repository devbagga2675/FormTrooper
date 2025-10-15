const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { triggerAIGeneration } = require("../services/ai.service");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadDocumentController = (req, res, next) => {
  const { formId } = req.body;
  if (!req.file || !formId) {
    return next(new Error("No file or formId provided."));
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { resource_type: "raw", folder: "formtrooper_docs" },
    async (error, result) => {
      if (error) {
        return next(error);
      }
      try {
        // 1. Update the form record with the Cloudinary URL
        await prisma.form.update({
          where: { id: parseInt(formId) },
          data: {
            document_url: result.secure_url,
            status: "PROCESSING",
          },
        });

        // 2. Trigger the AI generation process in the background
        triggerAIGeneration(parseInt(formId));

        // 3. Immediately respond to the frontend
        res
          .status(200)
          .json({ message: "Document uploaded, AI generation started." });
      } catch (dbError) {
        return next(dbError);
      }
    }
  );
  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
};

module.exports = { uploadDocumentController };
