// Kini learning library: local teaching example, in-memory data only.
// Setup in a new folder: npm init -y && npm install express
// Save this file, then run: node express-api-template.mjs
// Reference: https://expressjs.com/en/starter/hello-world/
// Add authentication and persistent storage before deployment.
import express from 'express';
const app = express();
app.use(express.json({ limit: '16kb' }));
const lessons = [{ id: 1, title: 'Introduction' }];
app.get('/api/lessons', (_request, response) => response.json(lessons));
app.post('/api/lessons', (request, response) => {
  const title = request.body?.title;
  if (typeof title !== 'string' || !title.trim() || title.length > 120) {
    return response.status(400).json({ message: 'Title must contain 1-120 characters.' });
  }
  const lesson = { id: lessons.length + 1, title: title.trim() };
  lessons.push(lesson);
  response.status(201).json(lesson);
});
app.use((_request, response) => response.status(404).json({ message: 'Route not found' }));
app.use((error, _request, response, _next) => {
  const status = error.status === 400 || error.status === 413 ? error.status : 500;
  response.status(status).json({ message: status === 500 ? 'Unexpected error' : 'Invalid request body' });
});
app.listen(3000, '127.0.0.1', () => console.log('API: http://127.0.0.1:3000/api/lessons'));
