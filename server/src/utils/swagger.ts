import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'URL Shortener API',
      version: '1.0.0',
      description: 'API documentation for the URL Shortener service',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SignupRequest: {
          type: 'object',
          required: ['firstName', 'email', 'password'],
          properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', minLength: 6, example: 'secret123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'secret123' },
          },
        },
        ShortenRequest: {
          type: 'object',
          required: ['url'],
          properties: {
            url: { type: 'string', format: 'uri', example: 'https://example.com' },
            code: { type: 'string', example: 'mylink' },
          },
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            currentPassword: { type: 'string' },
            newPassword: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/user/signup': {
        post: {
          tags: ['User'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SignupRequest' } } },
          },
          responses: {
            201: { description: 'User created', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { userId: { type: 'string' } } } } } } } },
            400: { description: 'Validation error' },
          },
        },
      },
      '/user/login': {
        post: {
          tags: ['User'],
          summary: 'Login and get JWT token',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
          },
          responses: {
            200: { description: 'Login successful', content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' } } } } } },
            400: { description: 'Invalid credentials' },
          },
        },
      },
      '/user/update': {
        patch: {
          tags: ['User'],
          summary: 'Update user profile',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRequest' } } },
          },
          responses: {
            200: { description: 'User updated' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/user/delete': {
        delete: {
          tags: ['User'],
          summary: 'Delete user account',
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: 'User deleted' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/shorten': {
        post: {
          tags: ['URL'],
          summary: 'Create a short URL',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ShortenRequest' } } },
          },
          responses: {
            201: { description: 'Short URL created' },
            401: { description: 'Unauthorized' },
            409: { description: 'Short code already exists' },
          },
        },
      },
      '/codes': {
        get: {
          tags: ['URL'],
          summary: 'Get all your short URLs',
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: 'List of URLs' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/{id}': {
        delete: {
          tags: ['URL'],
          summary: 'Delete a short URL by ID',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'URL deleted' },
            404: { description: 'Not found' },
          },
        },
      },
      '/{shortCode}': {
        get: {
          tags: ['URL'],
          summary: 'Redirect to original URL',
          parameters: [{ name: 'shortCode', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            302: { description: 'Redirect to target URL' },
            404: { description: 'Not found' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);