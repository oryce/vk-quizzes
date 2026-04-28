'use client'

import { Icon20CupOutline } from '@vkontakte/icons'
import {
  Avatar,
  Box,
  Caption,
  Flex,
  Group,
  List,
  Panel,
  PanelHeader,
  SimpleCell,
  Spacing,
  Subhead,
  Title,
  View,
  useAdaptivityConditionalRender,
} from '@vkontakte/vkui'

import { getInitials } from '@/lib'

type Row = { place: number; name: string; score: number }

function Leader({ row, size }: { row: Row; size: 'm' | 'l' }) {
  const { place, name, score } = row

  return (
    <Flex direction="column" align="center">
      <Avatar size={size == 'm' ? 72 : 96} initials={getInitials(name)} />
      <Spacing size={size === 'm' ? 'm' : 'l'} />

      <Flex align="center" gap="xs">
        <Icon20CupOutline />
        <Caption caps level="2" weight="2">
          {place} место
        </Caption>
      </Flex>
      {size === 'l' && <Spacing size="xs" />}

      <Title align="center" level={size == 'm' ? '3' : '2'} weight="2" useAccentWeight>
        {name}
      </Title>
      {size === 'l' && <Spacing size="xs" />}

      <Subhead weight="2">{score} очков</Subhead>
    </Flex>
  )
}

function LeaderPlaceholder({ size }: { size: 'm' | 'l' }) {
  const dimensions = size === 'm' ? { width: 120, height: 120 } : { width: 160, height: 160 }
  return <Box style={dimensions} />
}

export function LeaderboardView({
  id,
  leaderboard,
}: {
  id: string
  leaderboard: { name: string; score: number }[]
}) {
  const { viewWidth } = useAdaptivityConditionalRender()

  const rowAt = (idx: number): Row | null => {
    if (idx >= leaderboard.length) return null

    const { name, score } = leaderboard[idx]
    return { place: idx + 1, name, score }
  }

  const renderRows = (rows: { name: string; score: number }[], startPlace: number) => (
    <Group>
      <List>
        {rows.map(({ name, score }, idx) => {
          const place = startPlace + idx

          return (
            <SimpleCell key={place} before={`${place}`} indicator={`${score} очков`}>
              {name}
            </SimpleCell>
          )
        })}
      </List>
    </Group>
  )

  const topRow = rowAt(0)

  return (
    <View id={id} activePanel="leaderboard-panel">
      <Panel id="leaderboard-panel">
        <PanelHeader>Рейтинг</PanelHeader>

        {viewWidth.tabletMinus && (
          <Box className={viewWidth.tabletMinus.className}>
            <Flex align="center" justify="center" padding="2xl" style={{ paddingBlockEnd: 0 }}>
              {topRow ? <Leader row={topRow} size="l" /> : <LeaderPlaceholder size="l" />}
            </Flex>
            {leaderboard.length > 1 && renderRows(leaderboard.slice(1), 2)}
          </Box>
        )}

        {viewWidth.tabletPlus && (
          <Box className={viewWidth.tabletPlus.className}>
            <Flex
              align="center"
              justify="space-between"
              padding="2xl"
              paddingBlockEnd="4xl"
            >
              {[1, 0, 2].map((idx) => {
                const row = rowAt(idx)
                const size = idx === 0 ? 'l' : 'm'

                return row ? (
                  <Leader key={idx} row={row} size={size} />
                ) : (
                  <LeaderPlaceholder key={idx} size={size} />
                )
              })}
            </Flex>
            {leaderboard.length > 3 && renderRows(leaderboard.slice(3), 4)}
          </Box>
        )}
      </Panel>
    </View>
  )
}
