# Трио — сервисы для ресторана

Маркетинговый сайт пакета «Трио»:
- **Подача** — обучение официантов по меню
- **Журналка** — санитарные журналы в телефоне
- **Сводка** — отчёт по смене из iiko в Telegram

Живой сайт: https://trio-resto.vercel.app

## Структура

```
index.html          — главная
podacha/            — страница сервиса «Подача»
zhurnalka/          — «Журналка»
svodka/             — «Сводка»
trio/               — пакет «Трио»
offer/, privacy/, consent/, cookies/ — юридические
css/site.css
js/main.js, particles.js
fonts/
media/
vendor/             — three.js, lenis
```

## Кабинеты (отдельные приложения на Vercel)

- Подача: https://podacha-egor12.vercel.app
- Журналка: https://zhurnalka.vercel.app
- Сводка: https://svodka-egor12.vercel.app

Страница «Контроль» на маркетинговом сайте отсутствует (404). Возможно, она внутри одного из кабинетов.

## Локальный запуск

```bash
npx serve .
# или
python3 -m http.server 8080
```

## Деплой на Vercel

Framework: Other, Root: `.`
