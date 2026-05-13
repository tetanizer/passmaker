# passmaker

Статичный веб‑сервис генерации паролей: настройки длины и набора символов, список паролей с копированием и выгрузкой в `.txt`. Все вычисления выполняются в браузере, отдельного бэкенда нет.

**Репозиторий:** [github.com/tetanizer/passmaker](https://github.com/tetanizer/passmaker)

## Возможности

- Длина пароля (8–64), количество строк (до 500), чекбоксы наборов: прописные, строчные, цифры, спецсимволы.
- Базовые исключения неоднозначных символов: **O**, **0**, **I**, **l**, **1**.
- Опция **«Исключение неоднозначных символов»** — дополнительный набор похожих символов (S/5, B/8, G/6, Z/2, `|`, кавычки, дефисы, `_` в спецсимволах и т.д.).
- Сохранение настроек в `localStorage`, автогенерация при открытии страницы (значения по умолчанию можно задать в разметке/логике).
- Шрифты **Roboto** и **Roboto Mono** подключены **локально** (каталог `fonts/`), без запросов к CDN.
- Сборка **Docker** (nginx alpine) и публикация образа в **GitHub Container Registry** через GitHub Actions.

## Быстрый старт

### Docker Compose

```bash
docker compose up --build -d
```

Откройте в браузере: [http://localhost:8080](http://localhost:8080) (порт по умолчанию задан в `docker-compose.yml`).

### Только Docker

```bash
docker build -t passmaker .
docker run --rm -p 8080:80 passmaker
```

Снова: [http://localhost:8080](http://localhost:8080).

### Без Docker

Достаточно открыть `index.html` через локальный HTTP‑сервер (копирование в буфер и некоторые API надёжнее работают не с `file://`). Например:

```bash
npx --yes serve -p 3000 .
```

## Скрипты (`scripts/`)

| Скрипт | Назначение |
|--------|------------|
| `docker-build.sh` / `docker-build.ps1` | Локальная сборка образа (`IMAGE` / тег по умолчанию см. в файлах). |
| `ghcr-publish.sh` / `ghcr-publish.ps1` | Сборка и `docker push` в `ghcr.io`; нужны `IMAGE=ghcr.io/владелец/репозиторий` и `docker login ghcr.io`. |

На Linux/macOS при необходимости: `chmod +x scripts/*.sh`.

## CI и GitHub Container Registry

Файл [`.github/workflows/docker-ghcr.yml`](.github/workflows/docker-ghcr.yml):

- при push в ветки **`main`** / **`master`** и при тегах **`v*`** — сборка и отправка образа в **GHCR**;
- для **pull request** — только сборка, без push;
- имя образа: `ghcr.io/<владелец>/<репозиторий>` (нижний регистр), теги формирует `docker/metadata-action`;
- после успешной отправки образа создаётся или обновляется **черновик релиза** на GitHub с блоком «Образ в GHCR» (реестр, примеры `docker pull`, список тегов) и ссылкой на **[CHANGELOG.md](CHANGELOG.md)**; для тегов **`v*`** в текст подставляется фрагмент секции `## [vX.Y.Z]` из CHANGELOG, если она есть;
- для веток **main/master** используется тег **`continuous-draft`** (перезаписывается при каждом push) — один «живой» черновик; при включённой защите веток может понадобиться разрешить **Actions** создавать/обновлять этот тег.

После первого успешного запуска пакет появится в разделе **Packages** организации или пользователя. При необходимости сделайте пакет **Public**, чтобы `docker pull` работал без авторизации.

Пример `docker-compose` с образом из GHCR (вместо `build: .`):

```yaml
image: ghcr.io/tetanizer/passmaker:main
```

(подставьте свой владелец/репозиторий и тег с учётом ветки или semver.)

## Структура репозитория

```
├── app.js              # логика генерации, UI, localStorage
├── index.html
├── style.css
├── fonts.css           # @font-face для Roboto / Roboto Mono
├── fonts/              # файлы .woff2 (подмножества Unicode)
├── Dockerfile
├── docker-compose.yml
├── scripts/            # локальная сборка и push в GHCR
├── CHANGELOG.md
└── .github/workflows/  # CI → GHCR и черновики релизов
```

## Лицензии сторонних материалов

Шрифты **Roboto** и **Roboto Mono** распространяются по **SIL Open Font License 1.1** (файлы в `fonts/`).
