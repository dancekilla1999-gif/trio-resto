# Трио — сервисы для ресторана

Маркетинговый сайт пакета «Трио»:
- **Подача** — обучение официантов по меню
- **Журналка** — санитарные журналы в телефоне
- **Сводка** — отчёт по смене из iiko в Telegram

Живой сайт: https://trio-resto.vercel.app

## Структура (восстановлено с Vercel 31.10.2026)

```
index.html          — главная
podacha.html        — страница «Подача»
zhurnalka.html      — «Журналка»
svodka.html         — «Сводка»
trio.html           — пакет «Трио»
offer.html, privacy.html, consent.html, cookies.html — юридические
css/site.css
js/main.js
fonts/
media/
vendor/three.module.min.js
```

## Кабинеты (отдельные приложения)

- Подача: https://podacha-egor12.vercel.app
- Журналка: https://zhurnalka.vercel.app
- Сводка: https://svodka-egor12.vercel.app

## Локальный запуск

```bash
npx serve .
# или
python3 -m http.server 8080
```

## Деплой на Vercel

Framework: Other, Root: `.`

Исходники восстановлены с production-деплоя Vercel (HTML + CSS + JS + fonts + media).
