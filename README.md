# AUPP LMS — Learning Management System API

A Node.js REST API for the American University of Phnom Penh Learning Management System,
with a complete CI/CD pipeline using GitHub Actions, SonarQube, Trivy, Docker, Terraform, Prometheus, and Grafana.

## 🚀 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | API welcome & endpoint list |
| GET | `/health` | Health check |
| GET | `/metrics` | Prometheus metrics |
| GET | `/api/students` | List all students |
| GET | `/api/students/:id` | Get student by ID |
| POST | `/api/students` | Create student |
| GET | `/api/courses` | List all courses |
| GET | `/api/courses/:id` | Get course by ID |
| GET | `/api/grades` | List all grades |
| GET | `/api/grades/student/:id` | Get grades for a student |
| POST | `/api/grades/submit` | Submit a grade |

## 🔧 Run Locally

```bash
npm install
npm start
# API available at http://localhost:3000
```

## 🧪 Run Tests

```bash
npm test
```

## 🐳 Run with Docker

```bash
docker build -t aupp-lms .
docker run -p 3000:3000 aupp-lms
```

## 📊 Start Monitoring Stack

```bash
docker-compose -f docker-compose.monitoring.yml up -d
# Prometheus: http://localhost:9090
# Grafana:    http://localhost:3001  (admin / aupp2024)
```

## 🔐 GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `SONAR_TOKEN` | SonarQube authentication token |
| `SONAR_HOST_URL` | SonarQube server URL |
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `EC2_KEY_NAME` | AWS Key Pair name |
| `EC2_SSH_KEY` | Private key (.pem) content for SSH |
| `EC2_HOST` | EC2 public IP (fallback if Terraform output unavailable) |

## 🏗️ CI/CD Pipeline Stages

```
Push to main
  └─► Run Tests
        └─► SonarQube Quality Gate  ← FAILS if gate not passed
              └─► Trivy Security Scan  ← FAILS if CRITICAL CVEs found
                    └─► Build & Push Docker Image
                          └─► Terraform Provision EC2
                                └─► Deploy to EC2
```
