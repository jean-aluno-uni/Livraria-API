const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrai após "Bearer "

  if (!token) {
    return res.status(401).json({ erro: "Token de autenticação não fornecido." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(401).json({ erro: "Token inválido ou expirado." });
    }
    req.usuario = usuario;
    next();
  });
}

function exigirRole(roleEsperada) {
  return (req, res, next) => {
    if (!req.usuario || req.usuario.role !== roleEsperada) {
      return res.status(403).json({ erro: `Acesso proibido: privilégio de ${roleEsperada} exigido.` });
    }
    next();
  };
}

module.exports = { autenticarToken, exigirRole };