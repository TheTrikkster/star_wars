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
      isHttpOnly: false,
    },
    redirectTo: '/login',
    validate: async (request, session) => {
      const isValid = session.username === 'Luke' && session.password === 'DadSucks';
      return { isValid };
    },
  });

  server.auth.default('login');

  const handleError = (error, h) => {
    console.error('Error:', error.message);
    return h.response({ error: 'Error during SWAPI request' }).code(500);
  };

  const fetchData = async (url, h) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Fetch Error: ${response.status} - ${errorText}`);
        return h.response({ error: `SWAPI Error: ${response.status}` }).code(response.status);
      }
      const result = await response.json();
      return h.response(result).code(200);
    } catch (error) {
      return handleError(error, h);
    }
  };

  server.route([
    {
      method: 'POST',
      path: '/login',
      handler: (request, h) => {
        const { username, password } = request.payload;
        if (username === 'Luke' && password === 'DadSucks') {
          request.cookieAuth.set({ username, password });
          return h.response({ message: 'Login successful' }).code(200);
        }
        return h.response({ error: 'Invalid username or password' }).code(401);
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

        return await fetchData(url.toString(), h);
      },
    },
    {
      method: 'GET',
      path: '/search/detail/{id*}',
      handler: async (request, h) => {
        const { id } = request.params;
    
        if (!id) {
          return h.response({ error: 'Search ID is required' }).code(400);
        }
    
        try {
          const searchResponse = await fetch(`https://swapi.dev/api/${id}`);
    
          if (!searchResponse.ok) {
            const errorText = await searchResponse.text();
            console.error(`SWAPI Error: ${searchResponse.status} - ${errorText}`);
            return h.response({ error: `SWAPI Error: ${searchResponse.status}`, message: errorText }).code(searchResponse.status);
          }
    
          const result = await searchResponse.json();
    
          if (result) {
            return h.response(result.title || result.name).code(200);
          } else {
            return h.response({ error: 'No results found for the specified search term' }).code(404);
          }
        } catch (error) {
          console.error('Error during SWAPI request:', error.message);
          return h.response({ error: 'Error during SWAPI request', details: error.message }).code(500);
        }
      },
    },    
    {
      method: 'GET',
      path: '/search/{id*}',
      handler: async (request, h) => {
        const { id } = request.params;
        const { format } = request.query;
        if (!id) {
          return h.response({ error: 'Search ID is required' }).code(400);
        }
        const url = new URL(`https://swapi.dev/api/${id}`);
        if (format) url.searchParams.append('format', format);

        return await fetchData(url.toString(), h);
      },
    },
    {
      method: 'GET',
      path: '/{any*}',
      handler: () => 'You must be lost',
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
