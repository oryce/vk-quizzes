import { QuizzesView } from '@/client/quizzes/QuizzesView'

export default async function Page() {
  const sections = [
    {
      header: 'Идут сейчас',
      cards: [
        {
          slug: 'quiz-1',
          cardImageUri: 'https://placehold.co/200',
          name: 'Квиз 1',
          startTime: new Date('2024-01-01T12:00:00Z'),
          endTime: new Date('2024-01-01T13:00:00Z'),
          participants: 10,
        },
        {
          slug: 'quiz-2',
          cardImageUri: 'https://placehold.co/200',
          name: 'Квиз 1',
          startTime: new Date('2024-01-01T12:00:00Z'),
          endTime: new Date('2024-01-01T13:00:00Z'),
          participants: 10,
        },
        {
          slug: 'quiz-3',
          cardImageUri: 'https://placehold.co/200',
          name: 'Квиз 1',
          startTime: new Date('2024-01-01T12:00:00Z'),
          endTime: new Date('2024-01-01T13:00:00Z'),
          participants: 10,
        },
      ],
    },
  ]

  return <QuizzesView id="quizzes" sections={sections} />
}
