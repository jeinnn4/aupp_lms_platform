const request = require('supertest');
const app = require('./server');

describe('AUPP LMS API', () => {

  // ── Health Check ────────────────────────────────────────────────────────────
  describe('GET /health', () => {
    it('returns healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('AUPP LMS API');
    });
  });

  // ── Root ────────────────────────────────────────────────────────────────────
  describe('GET /', () => {
    it('returns welcome message and endpoint list', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('AUPP');
      expect(res.body.endpoints).toBeDefined();
    });
  });

  // ── Students ────────────────────────────────────────────────────────────────
  describe('GET /api/students', () => {
    it('returns list of students', async () => {
      const res = await request(app).get('/api/students');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });
  });

  describe('GET /api/students/:id', () => {
    it('returns a single student by ID', async () => {
      const res = await request(app).get('/api/students/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(1);
    });

    it('returns 404 for unknown student', async () => {
      const res = await request(app).get('/api/students/999');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/students', () => {
    it('creates a new student', async () => {
      const res = await request(app)
        .post('/api/students')
        .send({ name: 'Bopha Nhek', email: 'bopha@aupp.edu.kh' });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Bopha Nhek');
    });

    it('rejects student creation without required fields', async () => {
      const res = await request(app).post('/api/students').send({ name: 'No Email' });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Courses ─────────────────────────────────────────────────────────────────
  describe('GET /api/courses', () => {
    it('returns list of courses', async () => {
      const res = await request(app).get('/api/courses');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });
  });

  describe('GET /api/courses/:id', () => {
    it('returns a single course', async () => {
      const res = await request(app).get('/api/courses/101');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(101);
    });

    it('returns 404 for unknown course', async () => {
      const res = await request(app).get('/api/courses/999');
      expect(res.statusCode).toBe(404);
    });
  });

  // ── Grades ──────────────────────────────────────────────────────────────────
  describe('POST /api/grades/submit', () => {
    it('submits a valid grade', async () => {
      const res = await request(app)
        .post('/api/grades/submit')
        .send({ studentId: 1, courseId: 101, grade: 88 });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.letterGrade).toBe('B');
      expect(res.body.data.validated).toBe(true);
    });

    it('assigns correct letter grade A for 95', async () => {
      const res = await request(app)
        .post('/api/grades/submit')
        .send({ studentId: 2, courseId: 101, grade: 95 });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.letterGrade).toBe('A');
    });

    it('rejects grade above 100', async () => {
      const res = await request(app)
        .post('/api/grades/submit')
        .send({ studentId: 1, courseId: 101, grade: 110 });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects negative grade', async () => {
      const res = await request(app)
        .post('/api/grades/submit')
        .send({ studentId: 1, courseId: 101, grade: -5 });
      expect(res.statusCode).toBe(400);
    });

    it('rejects missing grade field', async () => {
      const res = await request(app)
        .post('/api/grades/submit')
        .send({ studentId: 1, courseId: 101 });
      expect(res.statusCode).toBe(400);
    });

    it('returns 404 for unknown student', async () => {
      const res = await request(app)
        .post('/api/grades/submit')
        .send({ studentId: 999, courseId: 101, grade: 85 });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/grades', () => {
    it('returns all grades', async () => {
      const res = await request(app).get('/api/grades');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/grades/student/:studentId', () => {
    it('returns grades for a specific student', async () => {
      const res = await request(app).get('/api/grades/student/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── 404 Fallback ────────────────────────────────────────────────────────────
  describe('404 handler', () => {
    it('returns 404 for unknown routes', async () => {
      const res = await request(app).get('/unknown-route');
      expect(res.statusCode).toBe(404);
    });
  });

  // ── Metrics ─────────────────────────────────────────────────────────────────
  describe('GET /metrics', () => {
    it('returns prometheus metrics', async () => {
      const res = await request(app).get('/metrics');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('http_requests_total');
    });
  });
});
