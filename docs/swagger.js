const swaggerJsdoc = require('swagger-jsdoc');

const definition = {
  openapi: '3.0.0',
  info: {
    title: 'Livraria API',
    version: '1.0.0',
    description: 'API de livros e autores protegida com BCrypt, JWT e controle de acesso por perfil. Para testar as rotas protegidas, faça login em POST /auth/login, copie o token retornado e cole no botão Authorize.'
  },
  servers: [{ url: 'http://localhost:3000/api/v1' }],
  tags: [
    { name: 'Auth', description: 'Cadastro e login de usuários' },
    { name: 'Livros', description: 'Catálogo de livros e comentários' },
    { name: 'Autores', description: 'Cadastro de autores' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      Erro: {
        type: 'object',
        properties: { erro: { type: 'string', example: 'Mensagem descrevendo o erro.' } }
      },
      RegisterInput: {
        type: 'object',
        required: ['nome', 'email', 'senha'],
        properties: {
          nome: { type: 'string', example: 'Maria Souza' },
          email: { type: 'string', format: 'email', example: 'maria@gmail.com' },
          senha: { type: 'string', format: 'password', example: 'senha123' }
        }
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@livraria.com' },
          senha: { type: 'string', format: 'password', example: 'admin123' }
        }
      },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1791248335021 },
          nome: { type: 'string', example: 'Maria Souza' },
          email: { type: 'string', example: 'maria@gmail.com' },
          role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' }
        }
      },
      LoginResposta: {
        type: 'object',
        properties: {
          usuario: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              nome: { type: 'string', example: 'Admin' },
              role: { type: 'string', example: 'ADMIN' }
            }
          },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
        }
      },
      Comentario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1791251006291 },
          autor_nome: { type: 'string', example: 'Leitor' },
          texto: { type: 'string', example: 'Clássico indispensável.' }
        }
      },
      ComentarioInput: {
        type: 'object',
        required: ['texto'],
        properties: { texto: { type: 'string', example: 'Leitura obrigatória, recomendo muito.' } }
      },
      Livro: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          titulo: { type: 'string', example: 'Dom Casmurro' },
          ano: { type: 'integer', example: 1899 },
          autor_id: { type: 'integer', example: 1 },
          autor_nome: { type: 'string', example: 'Machado de Assis' },
          comentarios: { type: 'array', items: { $ref: '#/components/schemas/Comentario' } }
        }
      },
      LivroInput: {
        type: 'object',
        required: ['titulo', 'autor_id'],
        properties: {
          titulo: { type: 'string', example: 'Memórias Póstumas de Brás Cubas' },
          ano: { type: 'integer', example: 1881 },
          autor_id: { type: 'integer', example: 1 }
        }
      },
      Autor: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Machado de Assis' },
          nacionalidade: { type: 'string', example: 'Brasileiro' }
        }
      },
      AutorInput: {
        type: 'object',
        required: ['nome'],
        properties: {
          nome: { type: 'string', example: 'Clarice Lispector' },
          nacionalidade: { type: 'string', example: 'Brasileira' }
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Dados inválidos ou campos obrigatórios ausentes',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } }
      },
      Unauthorized: {
        description: 'Token ausente, expirado ou corrompido',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' }, example: { erro: 'Token inválido ou expirado.' } } }
      },
      Forbidden: {
        description: 'Usuário autenticado sem o perfil ADMIN',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' }, example: { erro: 'Acesso proibido: privilégio de ADMIN exigido.' } } }
      },
      NotFound: {
        description: 'Recurso não encontrado',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' }, example: { erro: 'Livro não localizado.' } } }
      },
      ServerError: {
        description: 'Erro interno no servidor',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' }, example: { erro: 'Ocorreu um erro interno no servidor.' } } }
      }
    }
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Cadastrar usuário',
        description: 'Rota pública. Cria um usuário com perfil USER e guarda a senha como hash BCrypt. A senha nunca é devolvida na resposta.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } }
        },
        responses: {
          201: { description: 'Usuário cadastrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          409: {
            description: 'E-mail já cadastrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' }, example: { erro: 'E-mail já cadastrado no sistema.' } } }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Fazer login',
        description: 'Rota pública. Confere a senha com BCrypt e devolve um token JWT válido por 2 horas, que deve ser enviado no cabeçalho Authorization: Bearer.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } }
        },
        responses: {
          200: { description: 'Login realizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResposta' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: {
            description: 'E-mail ou senha incorretos',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' }, example: { erro: 'Credenciais inválidas.' } } }
          }
        }
      }
    },
    '/livros': {
      get: {
        tags: ['Livros'],
        summary: 'Listar livros',
        description: 'Rota pública. Devolve todos os livros com o nome do autor e os comentários.',
        responses: {
          200: { description: 'Lista de livros', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Livro' } } } } },
          500: { $ref: '#/components/responses/ServerError' }
        }
      },
      post: {
        tags: ['Livros'],
        summary: 'Cadastrar livro',
        description: 'Exclusivo ADMIN. Cadastra um livro ligado a um autor existente. Se o ano não for enviado, é usado o ano atual.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LivroInput' } } }
        },
        responses: {
          201: { description: 'Livro cadastrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Livro' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: {
            description: 'Autor informado não existe',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' }, example: { erro: 'O autor informado não existe.' } } }
          }
        }
      }
    },
    '/livros/{id}': {
      get: {
        tags: ['Livros'],
        summary: 'Buscar livro por id',
        description: 'Rota pública. Devolve um livro com o nome do autor e os comentários.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
        responses: {
          200: { description: 'Livro encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Livro' } } } },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/livros/{id}/comentarios': {
      post: {
        tags: ['Livros'],
        summary: 'Comentar em um livro',
        description: 'Exige login com perfil USER ou ADMIN. O nome de quem comentou vem do token JWT.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ComentarioInput' } } }
        },
        responses: {
          201: { description: 'Comentário criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Comentario' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/autores': {
      get: {
        tags: ['Autores'],
        summary: 'Listar autores',
        description: 'Rota pública. Devolve todos os autores cadastrados.',
        responses: {
          200: { description: 'Lista de autores', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Autor' } } } } }
        }
      },
      post: {
        tags: ['Autores'],
        summary: 'Cadastrar autor',
        description: 'Exclusivo ADMIN. Se a nacionalidade não for enviada, fica como Não informada.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AutorInput' } } }
        },
        responses: {
          201: { description: 'Autor cadastrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Autor' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    }
  }
};

module.exports = swaggerJsdoc({ definition, apis: [] });
