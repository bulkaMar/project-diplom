# 🚀 Деплой: Vercel (Frontend) + Railway (Backend)

## Що куди деплоїмо

| Сервіс | Хостинг | URL (після деплою) |
|--------|---------|-------------------|
| Next.js (client) | Vercel | `https://your-app.vercel.app` |
| NestJS (server) | Railway | `https://your-server.up.railway.app` |
| PostgreSQL | Railway | (внутрішній) |
| Redis | Railway | (внутрішній) |

---

## Крок 1: Підготовка — Генерація нових секретів

### 1.1 Новий JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Збережи результат — це твій новий `JWT_SECRET`.

### 1.2 Оновити Google OAuth Callback URL
1. Зайди на [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services → Credentials → твій OAuth Client**
3. В "Authorized redirect URIs" додай:
   ```
   https://YOUR_RAILWAY_SERVER_DOMAIN/auth/google/callback
   ```
   > ⚠️ Domain отримаєш після деплою бекенду на Railway (Крок 2)

---

## Крок 2: Railway — Бекенд (NestJS + PostgreSQL + Redis)

### 2.1 Реєстрація і створення проєкту
1. Зайди на [railway.app](https://railway.app) → Sign in with GitHub
2. **New Project → Deploy from GitHub repo**
3. Вибери репозиторій → вибери папку `server` як **Root Directory**

### 2.2 Додати PostgreSQL
1. В проєкті натисни **+ New → Database → Add PostgreSQL**
2. Railway автоматично додасть `DATABASE_URL` у змінні

### 2.3 Додати Redis
1. **+ New → Database → Add Redis**
2. Railway автоматично додасть `REDIS_URL` або `REDIS_HOST`/`REDIS_PORT`

### 2.4 Налаштувати Environment Variables
В розділі **Variables** твого server сервісу додай:

```env
JWT_SECRET=<згенерований на кроці 1.1>
GOOGLE_CLIENT_ID=730046534229-bj26h4tkc6mic17p64gn5bkcua592thi.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<твій реальний секрет>
GOOGLE_CALLBACK_URL=https://<твій-railway-domain>/auth/google/callback
FRONTEND_URL=https://<твій-vercel-domain>.vercel.app
GEMINI_API_KEY=<твій ключ>
MAIL_USER=bulahmarina@knu.ua
MAIL_PASS=<твій app password>
PORT=3000
```

> ℹ️ `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT` Railway підставить автоматично при підключенні БД

### 2.5 Отримати домен
1. Зайди в **Settings → Networking → Generate Domain**
2. Запам'ятай URL — він буде виглядати як `https://server-production-xxxx.up.railway.app`

---

## Крок 3: Оновити Google OAuth Callback

Повернись у [Google Cloud Console](https://console.cloud.google.com):
- Додай `https://YOUR_RAILWAY_DOMAIN/auth/google/callback` як Authorized Redirect URI
- Оновити `GOOGLE_CALLBACK_URL` в Railway Variables

---

## Крок 4: Vercel — Фронтенд (Next.js)

### 4.1 Деплой
1. Зайди на [vercel.com](https://vercel.com) → Import Project
2. Вибери репозиторій → вибери папку `client` як **Root Directory**
3. Framework: Next.js (автовизначиться)

### 4.2 Environment Variables
В Vercel → **Settings → Environment Variables** додай:

```env
NEXT_PUBLIC_API_URL=https://YOUR_RAILWAY_SERVER_DOMAIN
```

### 4.3 Оновити FRONTEND_URL у Railway
Після деплою Vercel ти отримаєш URL типу `https://your-app.vercel.app`.
Поверніться в Railway і оновіть:
```env
FRONTEND_URL=https://your-app.vercel.app
```

---

## Крок 5: Перевірка

- [ ] Відкрий `https://your-app.vercel.app` — сторінка завантажується
- [ ] Реєстрація нового користувача працює
- [ ] Вхід через Google OAuth працює
- [ ] Курси відображаються

---

## Локальна розробка (залишається без змін)

```bash
# server/.env — залиш локальні налаштування
# client/.env.local — залиш http://192.168.x.x:3001

cd diploma
docker-compose up  # або запускай server і client окремо
```

---

## ⚠️ Важливо: Не коміть `.env` файли!

Перевір що в `.gitignore` є:
- `server/.env` ✅
- `client/.env.local` ✅

`.env.example` файли — **можна** комітити (вони без реальних секретів).
