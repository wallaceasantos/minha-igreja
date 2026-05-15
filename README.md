# ⛪ MinhaIgreja - Platform SaaS

Plataforma completa e segura para igrejas que desejam se conectar com membros e visitantes de forma profissional e eficiente.

**[Deploy to Railway](https://railway.com/new)** | **[Demo](https://minhaigreja.app)** | **[Documentation](RAILWAY_DEPLOY.md)**

---

## 🚀 Quick Start

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/YOUR-USERNAME/minhaigreja.git
cd minhaigreja

# 2. Install dependencies
npm install
cd backend-nodejs && npm install
cd ..

# 3. Setup environment
cp backend-nodejs/.env.example backend-nodejs/.env
# Edit .env with your database credentials

# 4. Run migrations
mysql -u root -p igreja_connect < database/migrations/001_initial.sql
# ... (run all migrations in order)

# 5. Start servers
# Terminal 1 - Backend
cd backend-nodejs && npm run dev

# Terminal 2 - Frontend
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/health

---

## 📦 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **shadcn/ui** component library
- **React Router** for routing
- **React Query** for data fetching

### Backend
- **Node.js** + Express
- **MySQL** database
- **JWT** authentication
- **Multer** for file uploads
- **Nodemailer** for emails

### Deployment
- **Railway** for backend hosting + database
- **Vercel** for frontend hosting (recommended)

---

## 🗂️ Project Structure

```
minhaigreja/
├── backend-nodejs/              # Backend API
│   ├── src/
│   │   ├── server.js           # Entry point
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Auth, CORS, validation
│   │   ├── schedulers/         # Cron jobs
│   │   └── db/                 # Database connection
│   ├── package.json
│   └── .env.example
├── src/                         # Frontend
│   ├── pages/                  # All pages
│   ├── components/             # Reusable components
│   ├── hooks/                  # Custom hooks
│   └── lib/                    # Utilities
├── public/                     # Static assets
├── package.json
├── railway.json                # Railway config
├── RAILWAY_DEPLOY.md          # Deploy guide
└── README.md                  # This file
```

---

## ✨ Features

### ✅ Implemented

- **Authentication** - Login, registration, trial system
- **Dashboard** - Admin panel with stats and limits
- **Church Management** - Members, events, ministries
- **Prayer Requests** - 3 types, 15 themes, email confirmation
- **Live Streams** - Multi-platform (YouTube, Facebook, Instagram, Twitch)
- **Image Gallery** - Multiple upload, lightbox, reorder
- **Reviews System** - Pastor evaluations, published testimonials
- **Settings** - Logo upload, address, social media, custom domain
- **Dark Mode** - Global theme toggle
- **Responsive Design** - Mobile, tablet, desktop
- **Landing Page** - Public site with animations
- **Plans System** - Free and Essential tiers

### 🎯 Planned

- Tithes & Offerings Online
- Event Registration
- Blog/News
- Image Crop/Resize
- EmailJS Integration

---

## 🚀 Deploy to Railway

See complete guide: **[RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md)**

**Quick Deploy:**

1. Push to GitHub
2. Connect repo to Railway
3. Add MySQL database
4. Configure environment variables
5. Run migrations
6. Deploy!

---

## 📊 Environment Variables

### Backend (Railway)

```bash
# Required
DB_HOST=              # MySQL host
DB_USER=              # MySQL user
DB_PASSWORD=          # MySQL password
DB_NAME=igreja_connect
JWT_SECRET=           # Generate: openssl rand -base64 32
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=            # Your email
SMTP_PASS=            # App password
CORS_ORIGINS=         # Frontend domains
```

### Frontend (Vercel)

```bash
VITE_API_URL=         # Backend URL
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
VITE_GA_ID=           # Optional
```

---

## 🧪 Testing

```bash
# Frontend
npm run test

# Backend
cd backend-nodejs
npm test

# Build
npm run build
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 📞 Support

- **Email**: wallace.a.santos.wa@gmail.com
- **Docs**: [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md)
- **Issues**: https://github.com/YOUR-USERNAME/minhaigreja/issues

---

**Built with ❤️ for churches everywhere**
