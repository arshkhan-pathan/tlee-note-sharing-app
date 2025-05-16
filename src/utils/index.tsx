import { HERONAMES, ADJECTIVES } from '@/constants'

function getRandomElement(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateRandomHeroName(): string {
  const adj = getRandomElement(ADJECTIVES)
  const hero = getRandomElement(HERONAMES)
  return adj + hero
}
