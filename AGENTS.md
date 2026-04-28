# VK Quizzes

Проект: Веб-приложение для проведения интерактивных опросов.

## Стек технологий

- Next.js 16, App Router
- VKUI 7
- BetterAuth
- Drizzle ORM, PostgreSQL

## Требования к коду

- Пиши читаемый, сопровождаемый, production-grade код
- Следуй установленным в проекте паттернам:
  - Для компонентов используй `function`, для всех остальных функций — `const`
  - Компоненты в `app` получают данные и передают их в `client`. VKUI не умеет в RSC
  - и т.д.

### VKUI

- Используй компоненты из VKUI 7.11.5: https://vkui.io/7.11.5
- Используй иконки из `@vkontakte/icons`: https://github.com/VKCOM/icons/tree/master/packages/icons/src/svg
- Не используй deprecated API:
  - `<Div />` → `<Box />`
  - и т.д.
