import cors from "cors";

// Permite que front-ends hospedados em outros endereços chamem esta API
const corsMiddleware = cors();

export default corsMiddleware;
