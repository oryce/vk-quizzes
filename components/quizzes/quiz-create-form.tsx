"use client"

import * as React from "react"
import {
  Add01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  createQuizAction,
  type CreateQuizFormValues,
  type CreateQuizState,
} from "@/app/quizzes/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

type AnswerDraft = {
  id: string
  text: string
  isCorrect: boolean
}

type QuestionDraft = {
  id: string
  text: string
  timeLimitSeconds: number
  answers: AnswerDraft[]
}

type QuizInfoDraft = {
  title: string
  description: string
  startsAt: string
  maxParticipants: string
}

const emptyInfo: QuizInfoDraft = {
  title: "",
  description: "",
  startsAt: "",
  maxParticipants: "30",
}

function createAnswer(): AnswerDraft {
  return {
    id: crypto.randomUUID(),
    text: "",
    isCorrect: false,
  }
}

function createQuestion(): QuestionDraft {
  return {
    id: crypto.randomUUID(),
    text: "",
    timeLimitSeconds: 30,
    answers: [
      { ...createAnswer(), isCorrect: true },
      createAnswer(),
    ],
  }
}

function createInfo(values?: CreateQuizFormValues): QuizInfoDraft {
  return values
    ? {
        title: values.title,
        description: values.description,
        startsAt: values.startsAt,
        maxParticipants: values.maxParticipants,
      }
    : emptyInfo
}

function createQuestions(values?: CreateQuizFormValues): QuestionDraft[] {
  if (!Array.isArray(values?.questions)) {
    return []
  }

  return values.questions.map((question) => {
    const questionRecord =
      question && typeof question === "object"
        ? (question as Record<string, unknown>)
        : {}
    const answers = Array.isArray(questionRecord.answers)
      ? questionRecord.answers
      : []

    return {
      id: crypto.randomUUID(),
      text: typeof questionRecord.text === "string" ? questionRecord.text : "",
      timeLimitSeconds:
        typeof questionRecord.timeLimitSeconds === "number"
          ? questionRecord.timeLimitSeconds
          : 30,
      answers: answers.map((answer) => {
        const answerRecord =
          answer && typeof answer === "object"
            ? (answer as Record<string, unknown>)
            : {}

        return {
          id: crypto.randomUUID(),
          text: typeof answerRecord.text === "string" ? answerRecord.text : "",
          isCorrect: answerRecord.isCorrect === true,
        }
      }),
    }
  })
}

function getMinDateTimeLocal() {
  const now = new Date()
  now.setSeconds(0, 0)

  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

export function QuizCreateForm() {
  const [state, formAction, isPending] = React.useActionState<
    CreateQuizState,
    FormData
  >(createQuizAction, null)
  const [activeTab, setActiveTab] = React.useState("info")
  const [info, setInfo] = React.useState<QuizInfoDraft>(() =>
    createInfo(state?.values)
  )
  const [questions, setQuestions] = React.useState<QuestionDraft[]>(() =>
    createQuestions(state?.values)
  )
  const minDateTime = React.useMemo(() => getMinDateTimeLocal(), [])

  function updateInfo(field: keyof QuizInfoDraft, value: string) {
    setInfo((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function addQuestion() {
    const question = createQuestion()
    setQuestions((current) => [...current, question])
    setActiveTab(question.id)
  }

  function updateQuestion(
    questionId: string,
    updater: (question: QuestionDraft) => QuestionDraft
  ) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId ? updater(question) : question
      )
    )
  }

  function removeQuestion(questionId: string) {
    setQuestions((current) => {
      const next = current.filter((question) => question.id !== questionId)

      if (activeTab === questionId) {
        setActiveTab(next.at(0)?.id ?? "info")
      }

      return next
    })
  }

  return (
    <form action={formAction} noValidate>
      <input
        type="hidden"
        name="questions"
        value={JSON.stringify(
          questions.map((question) => ({
            clientId: question.id,
            text: question.text,
            timeLimitSeconds: question.timeLimitSeconds,
            answers: question.answers.map((answer) => ({
              text: answer.text,
              isCorrect: answer.isCorrect,
            })),
          }))
        )}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="max-w-full flex-wrap justify-start">
          <TabsTrigger value="info">Основная информация</TabsTrigger>
          {questions.map((question, index) => (
            <TabsTrigger key={question.id} value={question.id}>
              Вопрос {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="info" className="mt-6" forceMount>
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Название</Label>
                  <Input
                    id="title"
                    name="title"
                    value={info.title}
                    onChange={(event) => updateInfo("title", event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">
                    Максимум участников
                  </Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    min={1}
                    value={info.maxParticipants}
                    onChange={(event) =>
                      updateInfo("maxParticipants", event.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  name="description"
                  className="min-h-28"
                  value={info.description}
                  onChange={(event) =>
                    updateInfo("description", event.target.value)
                  }
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startsAt">Начало</Label>
                  <Input
                    id="startsAt"
                    name="startsAt"
                    type="datetime-local"
                    min={minDateTime}
                    value={info.startsAt}
                    onChange={(event) =>
                      updateInfo("startsAt", event.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="showcaseImage">
                    Изображение 200x200
                  </Label>
                  <Input
                    id="showcaseImage"
                    name="showcaseImage"
                    type="file"
                    accept="image/*"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverImage">Обложка 600x300</Label>
                  <Input
                    id="coverImage"
                    name="coverImage"
                    type="file"
                    accept="image/*"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {questions.map((question, questionIndex) => (
          <TabsContent
            key={question.id}
            value={question.id}
            className="mt-6"
            forceMount
          >
            <Card>
              <CardHeader className="gap-4 sm:grid-cols-[1fr_auto]">
                <CardTitle>Вопрос {questionIndex + 1}</CardTitle>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeQuestion(question.id)}
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                  Удалить
                </Button>
              </CardHeader>
              <CardContent className="grid gap-5">
                <div className="space-y-2">
                  <Label htmlFor={`question-${question.id}`}>
                    Текст вопроса
                  </Label>
                  <Textarea
                    id={`question-${question.id}`}
                    value={question.text}
                    onChange={(event) =>
                      updateQuestion(question.id, (current) => ({
                        ...current,
                        text: event.target.value,
                      }))
                    }
                    className="min-h-24"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                  <div className="space-y-2">
                    <Label htmlFor={`question-image-${question.id}`}>
                      Изображение вопроса
                    </Label>
                    <Input
                      id={`question-image-${question.id}`}
                      name={`questionImage_${question.id}`}
                      type="file"
                      accept="image/*"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`question-time-${question.id}`}>
                      Время ответа, сек.
                    </Label>
                    <Input
                      id={`question-time-${question.id}`}
                      type="number"
                      min={5}
                      max={300}
                      value={question.timeLimitSeconds}
                      onChange={(event) =>
                        updateQuestion(question.id, (current) => ({
                          ...current,
                          timeLimitSeconds: Number(event.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <Label>Варианты ответа</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateQuestion(question.id, (current) => ({
                          ...current,
                          answers: [...current.answers, createAnswer()],
                        }))
                      }
                    >
                      <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                      Вариант
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {question.answers.map((answer, answerIndex) => (
                      <div
                        key={answer.id}
                        className="grid gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                      >
                        <Input
                          value={answer.text}
                          placeholder={`Вариант ${answerIndex + 1}`}
                          onChange={(event) =>
                            updateQuestion(question.id, (current) => ({
                              ...current,
                              answers: current.answers.map((item) =>
                                item.id === answer.id
                                  ? { ...item, text: event.target.value }
                                  : item
                              ),
                            }))
                          }
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={answer.isCorrect}
                            onCheckedChange={(checked) =>
                              updateQuestion(question.id, (current) => ({
                                ...current,
                                answers: current.answers.map((item) =>
                                  item.id === answer.id
                                    ? { ...item, isCorrect: checked === true }
                                    : item
                                ),
                              }))
                            }
                          />
                          Правильный
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={question.answers.length <= 2}
                          onClick={() =>
                            updateQuestion(question.id, (current) => ({
                              ...current,
                              answers: current.answers.filter(
                                (item) => item.id !== answer.id
                              ),
                            }))
                          }
                        >
                          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                          <span className="sr-only">Удалить вариант</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {state?.error ? (
        <p className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="sticky bottom-0 mt-6 flex flex-col-reverse gap-3 border-t bg-background/95 py-4 backdrop-blur sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={addQuestion}>
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
          Добавить вопрос
        </Button>
        <Button disabled={isPending || questions.length === 0}>
          {isPending ? "Создаём" : "Создать квиз"}
        </Button>
      </div>
    </form>
  )
}
