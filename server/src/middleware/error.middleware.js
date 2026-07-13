const errorMiddleware = (error, req, res, next) => {
  return res.status(error.statusCode || 500).json({
    success: error.success || false,
    message: error.message || 'internal server error',
  });
};

export default errorMiddleware;
