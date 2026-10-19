// Mostra no terminal cada pedido que chega (ex.: "GET /caronas")
const logMiddleware = (req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next(); // segue para o próximo middleware ou rota
};

export default logMiddleware;
