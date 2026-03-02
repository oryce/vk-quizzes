'use client'

import { Icon12Clock, Icon12Users } from '@vkontakte/icons'
import {
  Box,
  Button,
  CardScroll,
  ContentBadge,
  ContentCard,
  Flex,
  Group,
  Header,
  Panel,
  PanelHeader,
  Spacing,
  useAdaptivityConditionalRender,
  View,
} from '@vkontakte/vkui'
import { useRouter } from 'next/navigation'

export interface QuizSection {
  /** Заголовок секции. */
  header: string
  /** Квизы в секции. */
  cards: QuizCard[]
}

export interface QuizCard {
  /** Слаг квиза. */
  slug: string
  /** Ссылка на изображение карточки. */
  cardImageUri: string
  /** Название квиза. */
  name: string
  /** Отметка времени начала квиза. */
  startTime: Date
  /** Отметка времени окончания квиза. */
  endTime: Date
  /** Число участников. */
  participants: number
}

function QuizCard({ card }: { card: QuizCard }) {
  const formatTime = (time: Date) =>
    time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const startTime = formatTime(card.startTime)
  const endTime = formatTime(card.endTime)

  const router = useRouter()

  return (
    <ContentCard
      src={card.cardImageUri}
      title={card.name}
      description={
        <>
          <Flex gap="xs">
            <ContentBadge mode="primary" appearance="neutral">
              <ContentBadge.IconSlot>
                <Icon12Clock />
              </ContentBadge.IconSlot>
              {startTime}&ndash;{endTime}
            </ContentBadge>
            <ContentBadge mode="primary" appearance="neutral">
              <ContentBadge.IconSlot>
                <Icon12Users />
              </ContentBadge.IconSlot>
              {card.participants}
            </ContentBadge>
          </Flex>
          <Spacing />
          <Button stretched onClick={() => router.push(`/quizzes/${card.slug}`)}>
            Подробнее
          </Button>
        </>
      }
    />
  )
}

export function QuizzesView({ id, sections }: { id: string; sections: QuizSection[] }) {
  const { viewWidth } = useAdaptivityConditionalRender()

  return (
    <View id={id} activePanel="quizzes-panel">
      <Panel id="quizzes-panel">
        <PanelHeader>Квизы</PanelHeader>
        {sections.map(({ header, cards: quizzes }, idx) => (
          <Group key={idx} header={<Header>{header}</Header>}>
            <Box padding="m">
              {/* Keep `CardScroll` elements in `Box`es to avoid unwanted spacing. */}
              {viewWidth.tabletPlus && (
                <Box className={viewWidth.tabletPlus.className}>
                  <CardScroll size="s">
                    {quizzes.map((quiz) => (
                      <QuizCard key={quiz.slug} card={quiz} />
                    ))}
                  </CardScroll>
                </Box>
              )}
              {viewWidth.tabletMinus && (
                <Box className={viewWidth.tabletMinus.className}>
                  <CardScroll size="m">
                    {quizzes.map((quiz) => (
                      <QuizCard key={quiz.slug} card={quiz} />
                    ))}
                  </CardScroll>
                </Box>
              )}
            </Box>
          </Group>
        ))}
      </Panel>
    </View>
  )
}
