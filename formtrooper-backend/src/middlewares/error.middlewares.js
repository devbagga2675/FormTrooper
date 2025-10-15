const errorHandler = (err, req, res, next) => {
  // Add a clear marker so we know this function is being called
  console.error("--- ERROR HANDLER ACTIVATED ---");

  // Safely log the error
  if (err && err.stack) {
    // If we get a standard error object, log its stack trace
    console.error(err.stack);
  } else {
    // If we get something else (like 'undefined'), log that directly
    console.error("An error occurred, but it was not a standard error object:", err);
  }

  // Send a generic 500 error response to the frontend
  res.status(500).json({
    message: 'An internal server error occurred.',
  });
};

module.exports = { errorHandler };