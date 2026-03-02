import { QuizzesView } from '@/client/quizzes/QuizzesView'

export default async function Page() {
  const sections = [
    {
      header: 'Идут сейчас',
      cards: [
        {
          slug: 'quiz-1',
          cardImageUri: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          name: 'Квиз 1',
          startTime: new Date('2024-01-01T12:00:00Z'),
          endTime: new Date('2024-01-01T13:00:00Z'),
          participants: 10,
        },
        {
          slug: 'quiz-2',
          cardImageUri: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          name: 'Квиз 1',
          startTime: new Date('2024-01-01T12:00:00Z'),
          endTime: new Date('2024-01-01T13:00:00Z'),
          participants: 10,
        },
        {
          slug: 'quiz-3',
          cardImageUri: 'https://example.com/quiz-1.jpg',
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
