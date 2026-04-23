const express = require('express');
const client = require('prom-client');

const app = express();
app.use(express.json());

// ─── Prometheus Metrics ───────────────────────────────────────────────────────
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.3, 0.5, 1, 2],
  registers: [register],
});

// Middleware to track metrics
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({ method: req.method, route: req.path });
  res.on('finish', () => {
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
    end();
  });
  next();
});

// ─── In-Memory Data Store ─────────────────────────────────────────────────────
const db = {
  students: [
    { id: 1, name: 'Darell Vatha', email: 'darell@aupp.edu.kh', courses: [101, 102] },
    { id: 2, name: 'Luki Lim',    email: 'luki@aupp.edu.kh',   courses: [101] },
    { id: 3, name: 'Mathys Park',   email: 'mathys@aupp.edu.kh',   courses: [102, 103] },
  ],
  courses: [
    { id: 101, name: 'Introduction to Computer Science', instructor: 'Dr. Kim', credits: 3 },
    { id: 102, name: 'Web Development',                  instructor: 'Prof. Lee', credits: 3 },
    { id: 103, name: 'Cloud Computing',                 instructor: 'Dr. Jeon', credits: 3 },
  ],
  grades: [],
};

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AUPP LMS API',
    version: process.env.APP_VERSION || '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ─── Prometheus Metrics Endpoint ──────────────────────────────────────────────
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ─── Root ─────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AUPP Learning Management System API',
    version: '1.0.0',
    endpoints: {
      health:   'GET  /health',
      metrics:  'GET  /metrics',
      students: 'GET  /api/students',
      courses:  'GET  /api/courses',
      grades:   'GET  /api/grades',
    },
  });
});

// ─── Students ─────────────────────────────────────────────────────────────────
app.get('/api/students', (req, res) => {
  res.json({ success: true, count: db.students.length, data: db.students });
});

app.get('/api/students/:id', (req, res) => {
  const student = db.students.find(s => s.id === parseInt(req.params.id));
  if (!student) return res.status(404).json({ success: false, error: 'Student not found' });
  res.json({ success: true, data: student });
});

app.post('/api/students', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'name and email are required' });
  }
  const student = { id: db.students.length + 1, name, email, courses: [] };
  db.students.push(student);
  res.status(201).json({ success: true, data: student });
});

// ─── Courses ──────────────────────────────────────────────────────────────────
app.get('/api/courses', (req, res) => {
  res.json({ success: true, count: db.courses.length, data: db.courses });
});

app.get('/api/courses/:id', (req, res) => {
  const course = db.courses.find(c => c.id === parseInt(req.params.id));
  if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
  res.json({ success: true, data: course });
});

// ─── Grades ───────────────────────────────────────────────────────────────────
app.get('/api/grades', (req, res) => {
  res.json({ success: true, count: db.grades.length, data: db.grades });
});

app.get('/api/grades/student/:studentId', (req, res) => {
  const grades = db.grades.filter(g => g.studentId === parseInt(req.params.studentId));
  res.json({ success: true, count: grades.length, data: grades });
});

// Developer A: Grade submission endpoint
app.post('/api/grades/submit', (req, res) => {
  const { studentId, courseId, grade } = req.body;

  // Developer B: Validation logic
  if (grade === undefined || grade === null) {
    return res.status(400).json({ success: false, error: 'grade is required' });
  }
  if (grade < 0 || grade > 100) {
    return res.status(400).json({ success: false, error: 'Grade must be between 0 and 100' });
  }

  const student = db.students.find(s => s.id === parseInt(studentId));
  if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

  const course = db.courses.find(c => c.id === parseInt(courseId));
  if (!course) return res.status(404).json({ success: false, error: 'Course not found' });

  const letterGrade = grade >= 90 ? 'A' : grade >= 80 ? 'B' : grade >= 70 ? 'C' : grade >= 60 ? 'D' : 'F';

  const entry = {
    id: db.grades.length + 1,
    studentId: parseInt(studentId),
    courseId: parseInt(courseId),
    grade,
    letterGrade,
    validated: true,
    submittedAt: new Date().toISOString(),
  };

  db.grades.push(entry);
  res.status(201).json({ success: true, data: entry });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`AUPP LMS API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Metrics:      http://localhost:${PORT}/metrics`);
  });
}

module.exports = app;
