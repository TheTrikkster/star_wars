const Hapi = require('@hapi/hapi');

const init = async () => {
  const server = Hapi.server({
    port: 1234,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['http://localhost:3000'],
        credentials: true,
      },
    },
  });

  await server.register(require('@hapi/cookie'));

  server.auth.strategy('login', 'cookie', {
    cookie: {
      name: 'session',
      password: 'averylongsecretpasswordthatissufficientlysecure',
      isSecure: false,
      ttl: 1000 * 60 * 60,
    },
    redirectTo: '/login',
    validate: async (request, session) => {
      if (session.username === 'Luke' && session.password === 'DadSucks') {
        return {
          isValid: true,
        };
      } else {
        return { isValid: false };
      }
    },
  });

  server.auth.default('login'); 

  server.route([
    {
      method: 'POST',
      path: '/login',
      handler: (request, h) => {
        const { username, password } = request.payload;
        if (username === 'Luke' && password === 'DadSucks') {
          request.cookieAuth.set({ username, password });
          return h.redirect('http://localhost:3000');
        } else {
          return h.redirect('http://localhost:3000/login');
        }
      },
      options: {
        auth: {
          mode: 'try',
        },
      },
    },
    {
      method: 'GET',
      path: '/logout',
      handler: (request, h) => {
        request.cookieAuth.clear();
        return h.redirect('http://localhost:3000/login');
      },
    },
    {
      method: 'GET',
      path: '/search',
      handler: async (request, h) => {
        const { category, page, search } = request.query;
        const url = new URL(`https://swapi.dev/api/${category}`);
        if (page) url.searchParams.append('page', page);
        if (search) url.searchParams.append('search', search);

        try {
          const searchResponse = await fetch(url.toString());
          const result = await searchResponse.json();
          return result;
        } catch (error) {
          console.error('Error during SWAPI request:', error);
          return h.response({ error: 'Error during SWAPI request' }).code(500);
        }
      },
    },
    {
      method: 'GET',
      path: '/search/{id*}',
      handler: async (request, h) => {
        const { id } = request.params;
        const { search: queryParam } = request.query;

        if (!id) {
          return h.response({ error: 'Search ID is required' }).code(400);
        }

        const url = new URL(`https://swapi.dev/api/${id}`);
        if (queryParam) url.searchParams.append('search', queryParam);

        try {
          const searchResponse = await fetch(url.toString());

          if (!searchResponse.ok) {
            const errorText = await searchResponse.text();
            console.error(`SWAPI Error: ${searchResponse.status} - ${errorText}`);
            return h.response({ error: `SWAPI Error: ${searchResponse.status}` }).code(searchResponse.status);
          }

          const result = await searchResponse.json();

          if (queryParam) {
            if (result.results && result.results.length > 0) {
              return h.response(result.results[0]).code(200);
            } else {
              return h.response({ error: 'No results found for the specified search term' }).code(404);
            }
          } else {
            return h.response(result.title || result.name || result).code(200);
          }
        } catch (error) {
          console.error('Error during SWAPI request:', error.message);
          return h.response({ error: 'Error during SWAPI request', details: error.message }).code(500);
        }
      },
    },
    {
      method: 'GET',
      path: '/{any*}',
      handler: (request, h) => {
        return 'You must be lost';
      },
      options: {
        auth: {
          mode: 'try',
        },
      },
    },
  ]);

  await server.start();
  console.log(`Server started on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

init();
