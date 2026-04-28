import { LeaderboardView } from '@/client/LeaderboardView'

export default async function Page() {
  const leaderboard = [
    {
      name: 'Олег Корнев',
      score: 100,
    },
    {
      name: 'Денис Рыжков',
      score: 80,
    },
    {
      name: 'Игорь Згуря',
      score: 60,
    },
    {
      name: 'Дмитрий Фролов',
      score: 50,
    },
  ]

  return <LeaderboardView id="leaderboard" leaderboard={leaderboard} />
}
