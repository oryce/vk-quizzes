import { QuizView } from '@/client/quizzes/QuizView'

export default async function Page() {
  const quiz = {
    name: 'Квиз 1',
    description:
      'Погрузись в мир неожиданных фактов, логических ловушек и цифровых загадок.\nТебя ждут вопросы из IT, поп-культуры, истории технологий и немного абсурдной эрудиции.\nПроверь, сможешь ли ты отличить баг от фичи и миф от реальности 😉',
    organizer: 'Дмитрий Фролов',
    coverImageUri: 'https://placehold.co/600x300',
    startTime: new Date(),
    endTime: new Date(),
    participants: 100,
    participating: false,
    leaderboard: [
      {
        name: 'Дмитрий Фролов',
        score: 100,
      },
      {
        name: 'Денис Рыжков',
        score: 80,
      },
    ],
  }

  return <QuizView id="quiz-view" quiz={quiz} />
}
