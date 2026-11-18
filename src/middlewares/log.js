// Mostra no terminal cada pedido que chega (ex.: "GET /caronas")
const logMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV !== "test") {
    console.log(`${req.method} ${req.originalUrl}`);
  }
  next();
};

export default logMiddleware;
