# SKU Mockup Foundry — Product Mockup Visualization

AI студио за фотореалистични продуктови мокъпи (тениски, чаши и др.) с лога.
Хостинг: **GitHub (код) + Vercel (деплой)**.

## Архитектура

- Фронтенд: React + Vite (статичен)
- `api/gemini.ts`: Vercel Serverless функция — прокси към Gemini API.
  **Ключът стои само във Vercel env** (`GEMINI_API_KEY`), никога в браузъра.
- Модели (безплатен tier): `gemini-2.5-flash-image` (мокъпи/лога/продукти),
  `gemini-2.5-flash` (маркетингови описания)
- Без ключ / изчерпан лимит → автоматичен fallback към вградения локален
  canvas композитор, приложението винаги работи.

## Деплой (стъпка по стъпка)

1. **GitHub** — качи кода:
   ```bash
   git init
   git add .
   git commit -m "initial"
   git branch -M main
   git remote add origin https://github.com/ТВОЯ_ПОТРЕБИТЕЛ/ИМЕ_НА_REPO.git
   git push -u origin main
   ```

2. **Vercel**:
   - vercel.com → **Add New → Project** → Import на repo-то от GitHub
   - Framework се разпознава автоматично (Vite) — нищо не пипай
   - Преди Deploy (или после в Settings): **Environment Variables** →
     - Name: `GEMINI_API_KEY`
     - Value: безплатен ключ от https://aistudio.google.com/apikey (без карта)
   - **Deploy**

3. Всеки следващ `git push` към `main` → автоматичен нов деплой.

## Локална разработка

```bash
npm install
npx vercel dev        # пуска и фронтенда, и /api функцията
```
(за `vercel dev` сложи ключа в `.env` като `GEMINI_API_KEY=...` или
`vercel env pull`). Само `npm run dev` също работи, но без AI — само
локалния композитор.

## Ограничения

- Безплатният Gemini tier има дневен лимит на image заявките
  (нулира се в полунощ Pacific). При лимит → локален режим автоматично.
- Vercel serverless приема тела до ~4.5MB — качвай снимки с разумен
  размер (под ~3MB), иначе заявката към AI ще падне към локалния режим.
