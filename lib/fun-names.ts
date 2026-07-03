const adjectives = [
  'Silly', 'Cosmic', 'Turbo', 'Quantum', 'Mega', 'Funky', 'Sleepy', 'Speedy',
  'Gentle', 'Fancy', 'Lucky', 'Mighty', 'Noble', 'Precious', 'Rapid', 'Secret',
  'Tricky', 'Ultra', 'Velvet', 'Witty', 'Zesty', 'Bouncy', 'Chilly', 'Dizzy',
  'Frosty', 'Giddy', 'Humble', 'Jolly', 'Krispy', 'Lively', 'Nifty', 'Peppy',
  'Quirky', 'Snappy', 'Vivid', 'Whimsy', 'Cozy', 'Breezy', 'Crispy', 'Jazzy',
]

const nouns = [
  'Koala', 'Panda', 'Wombat', 'Narwhal', 'Dragon', 'Phoenix', 'Otter', 'Badger',
  'Llama', 'Moose', 'Raven', 'Tiger', 'Whale', 'Zebra', 'Corgi', 'Dolphin',
  'Falcon', 'Gecko', 'Hedgehog', 'Jaguar', 'Kiwi', 'Lemur', 'Manatee', 'Octopus',
  'Penguin', 'Quokka', 'Raccoon', 'Sloth', 'Toucan', 'Viper', 'Wolf', 'Yak',
]

export function generateFunName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 999) + 1
  return `${adj}${noun}${num}`
}

export function getPlayerId(): string {
  let id = localStorage.getItem('flamingo_player_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('flamingo_player_id', id)
  }
  return id
}

export function getPlayerName(): string {
  let name = localStorage.getItem('flamingo_player_name')
  if (!name) {
    name = generateFunName()
    localStorage.setItem('flamingo_player_name', name)
  }
  return name
}

export function setPlayerName(name: string): void {
  localStorage.setItem('flamingo_player_name', name)
}
