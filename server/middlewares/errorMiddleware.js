export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`
  });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV !== "production" && statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    message: err.message || "Something went wrong",
    details: err.details || null
  });
};
