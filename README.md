# 🚀 DevOps Demo: Modern Node.js Application

A clean, modern, and lightweight Node.js application built specifically for learning backend development, REST API design, containerization, and DevOps CI/CD practices.

---

## 📌 Features

- **Backend Framework**: Built with **Node.js** and **Express.js** using modern ES Modules.
- **Interactive UI Dashboard**:
  - Live server status badge & uptime counter
  - Real-time memory and OS runtime metrics
  - Interactive REST API explorer with response time measurement
  - Interactive learning task checklist connected to live backend storage
- **DevOps Ready**:
  - Standard health check probe (`GET /api/health`) for Kubernetes/Docker container monitoring
  - Graceful shutdown handling (`SIGINT` & `SIGTERM`)
  - Multi-platform `Dockerfile` with non-root security standards
  - Automated tests with Node.js native test runner (`node:test`)
  - GitHub Actions CI workflow (`.github/workflows/ci.yml`)

---

## 📂 Project Structure

```text
devops-demo/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI workflow
├── public/                 # Interactive frontend dashboard
│   ├── app.js              # Client-side API interactions
│   ├── index.html          # Web dashboard layout
│   └── style.css           # Modern dark-mode styling
├── src/                    # Backend application source code
│   ├── app.js              # Express configuration & middleware
│   ├── server.js           # Server entry point & graceful shutdown
│   └── routes/
│       └── api.js          # REST API endpoints
├── test/                   # Automated tests
│   └── app.test.js         # Integration tests using node:test
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── package.json
└── README.md
```

---

## 🛠️ Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later
- **Git**

### 2. Installation
```bash
# Clone the repository (replace with your repo URL)
git clone https://github.com/<your-username>/devops-demo.git

# Navigate into the project directory
cd devops-demo

# Install dependencies
npm install
```

### 3. Run Locally

#### Development mode (with auto-reload on file changes):
```bash
npm run dev
```

#### Production mode:
```bash
npm start
```

Open your browser at: **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Running Automated Tests

Run the test suite powered by the native Node.js test runner:

```bash
npm test
```

Sample output:
```text
✔ GET /api/health returns 200 and valid health payload (22ms)
✔ GET /api/info returns application and runtime metadata (2ms)
✔ GET /api/items returns items list (2ms)
✔ POST /api/items creates a new learning item (5ms)
✔ POST /api/items fails validation when title is empty (1ms)
✔ DELETE /api/items/:id removes the item (2ms)
✔ GET /api/unknown-route returns 404 with helpful json message (1ms)
ℹ pass 7 | fail 0
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Web Dashboard interface |
| `GET` | `/api/health` | Health status probe (`UP`, memory, uptime, system info) |
| `GET` | `/api/info` | Application metadata and runtime environment |
| `GET` | `/api/items` | Retrieve all learning roadmap items |
| `POST` | `/api/items` | Create a new learning task (`{ title, category }`) |
| `DELETE` | `/api/items/:id` | Delete a learning item by ID |

---

## 🐳 Docker Deployment

### 1. Build the Docker image
```bash
docker build -t devops-demo:latest .
```

### 2. Run the container
```bash
docker run -d -p 3000:3000 --name devops-demo-app devops-demo:latest
```

### 3. Inspect container logs
```bash
docker logs -f devops-demo-app
```

---

## 🔄 Git Workflow for Beginners

```bash
# Check status of modified files
git status

# Stage changes
git add .

# Commit changes
git commit -m "feat: enhance API endpoints and docs"

# Push to remote GitHub repository
git push origin main
```

---

## 📄 License
MIT © 2026 sanjay1303
