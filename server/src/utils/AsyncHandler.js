const AsyncHandler = (requestHeader) => {
  return (req, res, next) => {
    Promise.resolve(requestHeader(req, res, next)).catch(next);
  };
};

export default AsyncHandler;
