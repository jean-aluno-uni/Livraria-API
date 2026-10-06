# Livraria API

API de livros e autores em Node.js com Express, protegida com BCrypt, JWT e controle de acesso por perfil.

## Como rodar

1. Instalar as dependências com `npm install`
2. Copiar o arquivo `.env.example` para `.env` e colocar uma chave secreta no `JWT_SECRET`
3. Iniciar com `npm start`

A API sobe em `http://localhost:3000/api/v1`. É preciso Node 20.6 ou mais novo por causa do `--env-file`.

Para testar pelo navegador, basta abrir o `index.html` com a API rodando.

Se já existir um `database.txt` antigo de antes da atividade, apague ele para os usuários serem recriados com os hashes novos.

## Usuários iniciais

| Perfil | E-mail | Senha |
| --- | --- | --- |
| ADMIN | admin@livraria.com | admin123 |
| USER | leitor@gmail.com | leitor123 |

## Rotas

| Método | Rota | Acesso | Sucesso | Falha |
| --- | --- | --- | --- | --- |
| GET | /api/v1/livros | Público | 200 | |
| GET | /api/v1/livros/:id | Público | 200 | |
| POST | /api/v1/auth/register | Público | 201 | |
| POST | /api/v1/auth/login | Público | 200 | 401 |
| POST | /api/v1/livros/:id/comentarios | USER ou ADMIN | 201 | 401 |
| POST | /api/v1/autores | ADMIN | 201 | 401 ou 403 |
| POST | /api/v1/livros | ADMIN | 201 | 401 ou 403 |

O token deve ser enviado no cabeçalho `Authorization: Bearer <token>`.
