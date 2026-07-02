# SKU Mockup Foundry — Product Mockup Visualization

AI студио за фотореалистични продуктови мокъпи (тениски, чаши и др.) с лога.
Работи изцяло в браузъра — подходящо за **GitHub Pages**.

## Как работи API-то (безплатно)

- При първо отваряне приложението пита за **безплатен Gemini API ключ** от
  [Google AI Studio](https://aistudio.google.com/apikey) (не иска карта).
- Ключът се пази **само в localStorage на браузъра** — не се качва никъде.
- Използвани модели (безплатен tier):
  - `gemini-2.5-flash-image` — генериране на мокъпи, лога и продуктови снимки
  - `gemini-2.5-flash` — маркетингови описания
- **Без ключ** приложението пак работи: вграден локален canvas композитор
  (блендинг, сенки, позициониране) + локален генератор на лога.

## Локално пускане

```bash
npm install
npm run dev
```

## Деплой в GitHub Pages

1. Създай ново repo и качи файловете:
   ```bash
   git init
   git add .
   git commit -m "initial"
   git branch -M main
   git remote add origin https://github.com/ТВОЯ_ПОТРЕБИТЕЛ/ИМЕ_НА_REPO.git
   git push -u origin main
   ```
2. В GitHub: **Settings → Pages → Source: GitHub Actions**
3. Готово — workflow-ът `.github/workflows/deploy.yml` билдва и публикува
   автоматично при всеки push към `main`.

## Бележки за безплатния лимит

Безплатният tier на Gemini има дневен лимит на заявките за image модела
(ограничен брой генерации на ден, нулира се в полунощ Pacific време).
При изчерпан лимит или невалиден ключ приложението автоматично минава
на локалния композитор, така че никога не спира да работи.
