'use client'

import { Icon20ClockOutline, Icon20UserOutline, Icon20UsersOutline } from '@vkontakte/icons'
import {
  Box,
  Button,
  Group,
  Headline,
  Image,
  List,
  MiniInfoCell,
  Panel,
  PanelHeader,
  PanelHeaderBack,
  SimpleCell,
  Spacing,
  Text,
  View,
} from '@vkontakte/vkui'
import { useRouter } from 'next/navigation'

export interface Quiz {
  /** Название квиза. */
  name: string
  /** Описание квиза. */
  description: string
  /** Имя организатора. */
  organizer: string
  /** Ссылка на изображение обложки. */
  coverImageUri: string
  /** Отметка времени начала квиза. */
  startTime: Date
  /** Отметка времени окончания квиза. */
  endTime: Date
  /** Число участников. */
  participants: number
  /** Участвует ли текущий пользователь в квизе. */
  participating: boolean
  /** Результаты квиза. */
  leaderboard?: {
    /** Имя участника. */
    name: string
    /** Количество очков. */
    score: number
  }[]
}

export function QuizView({ id, quiz }: { id: string; quiz: Quiz }) {
  const router = useRouter()

  const lines = quiz.description.split('\n')

  return (
    <View id={id} activePanel="quiz-panel">
      <Panel id="quiz-panel">
        <PanelHeader before={<PanelHeaderBack onClick={() => router.push('/quizzes')} />}>
          {quiz.name}
        </PanelHeader>
        <Group>
          <Image src={quiz.coverImageUri} alt={quiz.name} widthSize="100%" keepAspectRatio />
          <Spacing size="xl" />

          <MiniInfoCell mode="accent" before={<Icon20ClockOutline />}>
            С 12:00 до 13:00
          </MiniInfoCell>
          <MiniInfoCell mode="accent" before={<Icon20UsersOutline />}>
            {quiz.participants} участников
          </MiniInfoCell>
          <MiniInfoCell mode="accent" before={<Icon20UserOutline />}>
            Организатор: {quiz.organizer}
          </MiniInfoCell>

          <Box padding="xl">
            <Headline weight="1" useAccentWeight>
              О квизе
            </Headline>
            <Spacing size="l" />

            {lines.map((line, idx) => (
              <>
                <Text key={idx}>{line}</Text>
                {idx < lines.length - 1 && <Spacing size="s" />}
              </>
            ))}

            {quiz.leaderboard ? (
              <>
                <Spacing size="xl" />

                <Headline weight="1" useAccentWeight>
                  Рейтинг участников
                </Headline>
                <List>
                  {quiz.leaderboard.map(({ name, score }, idx) => (
                    <SimpleCell
                      key={idx}
                      before={<Text>{idx + 1}</Text>}
                      indicator={`${score} очков`}
                    >
                      {name}
                    </SimpleCell>
                  ))}
                </List>
              </>
            ) : (
              <>
                <Spacing size="4xl" />

                <Button disabled={quiz.participating} size="l" stretched>
                  {quiz.participating ? 'Вы участвуете' : 'Стать участником'}
                </Button>
              </>
            )}
          </Box>
        </Group>
      </Panel>
    </View>
  )
}
