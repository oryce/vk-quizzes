# VK Quizzes

Проект: Веб-приложение для проведения интерактивных опросов.

## Стек технологий

- Менеджер пакетов: pnpm
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

## Миграции

- Сгенерировать миграции: `pnpm exec drizzle-kit generate`
- Выполнить миграции: `pnpm exec drizzle-kit migrate`
- `auth-schema.ts` редактировать нельзя, он генерируется: `pnpm dlx @better-auth/cli generate --output ./src/lib/db/auth-schema.ts --yes`