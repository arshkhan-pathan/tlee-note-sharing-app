import { redirect } from 'next/navigation'
import { HERONAMES, ADJECTIVES } from '@/constants'

function getRandomElement(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateRandomHeroName(): string {
  const adj = getRandomElement(ADJECTIVES)
  const hero = getRandomElement(HERONAMES)
  return adj + hero
}

export default function Home() {
  const id = generateRandomHeroName()
  redirect(`/${id}`)
  return <>Home page</>
}
