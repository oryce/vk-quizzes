"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Login01Icon,
  Logout01Icon,
  Menu01Icon,
  Quiz03Icon,
  RankingIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { signOut } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

type HeaderUser = {
  name: string
  email: string
  image?: string | null
  firstName?: string | null
  lastName?: string | null
}

type SiteHeaderClientProps = {
  user: HeaderUser | null
}

const navItems = [
  {
    href: "/quizzes",
    label: "Квизы",
    icon: Quiz03Icon,
  },
  {
    href: "/rating",
    label: "Рейтинг",
    icon: RankingIcon,
  },
]

function getInitials(user: HeaderUser) {
  const first = user.firstName?.at(0) ?? user.name.at(0) ?? "U"
  const last = user.lastName?.at(0) ?? ""

  return `${first}${last}`.toUpperCase()
}

function HeaderAvatar({ user }: { user: HeaderUser }) {
  return (
    <Avatar size="lg">
      {user.image ? <AvatarImage src={user.image} alt="" /> : null}
      <AvatarFallback>{getInitials(user)}</AvatarFallback>
    </Avatar>
  )
}

export function SiteHeaderClient({ user }: SiteHeaderClientProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push("/sign-in")
    router.refresh()
  }

  function isActive(href: string) {
    return href === "/quizzes"
      ? pathname.startsWith("/quizzes")
      : pathname === href
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto] items-center gap-3 px-4 md:grid-cols-[1fr_auto_1fr]">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            className="truncate text-lg font-semibold tracking-normal"
          >
            VK Quizzes
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant={isActive(item.href) ? "secondary" : "ghost"}
            >
              <Link href={item.href}>
                <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <div className="hidden md:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-lg" className="rounded-full">
                    <HeaderAvatar user={user} />
                    <span className="sr-only">Открыть меню профиля</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <span className="block truncate font-medium text-foreground">
                      {user.name}
                    </span>
                    <span className="block truncate">{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />
                      Профиль
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost">
                  <Link href="/sign-in">Войти</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Регистрация</Link>
                </Button>
              </div>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button className="md:hidden" size="icon" variant="outline">
                <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
                <span className="sr-only">Открыть навигацию</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>VK Quizzes</SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-2 px-6">
                {navItems.map((item) => (
                  <SheetClose key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium",
                        isActive(item.href)
                          ? "bg-secondary text-secondary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>

              <div className="mt-auto border-t p-6">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <HeaderAvatar user={user} />
                      <div className="min-w-0 text-sm">
                        <p className="truncate font-medium">{user.name}</p>
                        <p className="truncate text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <SheetClose asChild>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/profile">
                            <HugeiconsIcon
                              icon={UserCircleIcon}
                              strokeWidth={2}
                            />
                            Профиль
                          </Link>
                        </Button>
                      </SheetClose>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleSignOut}
                      >
                        <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                        Выйти
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/sign-in">
                          <HugeiconsIcon icon={Login01Icon} strokeWidth={2} />
                          Войти
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full">
                        <Link href="/sign-up">Регистрация</Link>
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
