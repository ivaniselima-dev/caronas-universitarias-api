// ATIVIDADE 8 — Middleware de validação de requisições com Zod
// Recebe um schema e confere body e params ANTES de o pedido chegar ao controller.
// Se algo estiver errado, o Zod lança um ZodError, que o middleware de erro transforma em 400.
const validate = (schema) => async (req, res, next) => {
  const dados = await schema.parseAsync({ body: req.body, params: req.params });

  // Substitui pelos dados "limpos": campos desconhecidos são descartados
  if (dados.body !== undefined) req.body = dados.body;
  if (dados.params !== undefined) req.params = dados.params;

  next();
};

export default validate;
