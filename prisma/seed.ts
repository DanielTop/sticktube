import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'

const prisma = new PrismaClient()

const testVideos = [
  {
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up',
    description: 'The official video for "Never Gonna Give You Up" by Rick Astley.',
    duration: 213,
    tags: 'music,80s,classic',
  },
  {
    youtubeId: 'jNQXAC9IVRw',
    title: 'Me at the zoo',
    description: 'The first video on YouTube. Shot at the San Diego Zoo.',
    duration: 19,
    tags: 'first,youtube,historic',
  },
  {
    youtubeId: '9bZkp7q19f0',
    title: 'PSY - GANGNAM STYLE',
    description: 'PSY - GANGNAM STYLE Official Music Video',
    duration: 253,
    tags: 'kpop,music,viral',
  },
  {
    youtubeId: 'kJQP7kiw5Fk',
    title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
    description: 'Despacito official music video',
    duration: 282,
    tags: 'latin,music,despacito',
  },
  {
    youtubeId: 'JGwWNGJdvx8',
    title: 'Ed Sheeran - Shape of You',
    description: 'The official music video for Ed Sheeran - Shape of You',
    duration: 263,
    tags: 'pop,music,edsheeran',
  },
  {
    youtubeId: 'RgKAFK5djSk',
    title: 'Wiz Khalifa - See You Again ft. Charlie Puth',
    description: 'From Furious 7 Soundtrack',
    duration: 237,
    tags: 'hiphop,music,furious7',
  },
  {
    youtubeId: 'fJ9rUzIMcZQ',
    title: 'Queen - Bohemian Rhapsody',
    description: 'The official Bohemian Rhapsody music video',
    duration: 359,
    tags: 'rock,queen,classic',
  },
  {
    youtubeId: 'hT_nvWreIhg',
    title: 'OneRepublic - Counting Stars',
    description: 'OneRepublic - Counting Stars Official Music Video',
    duration: 267,
    tags: 'pop,rock,music',
  },
  {
    youtubeId: 'CevxZvSJLk8',
    title: 'Katy Perry - Roar',
    description: 'Katy Perry - Roar (Official)',
    duration: 269,
    tags: 'pop,music,katyperry',
  },
  {
    youtubeId: 'YQHsXMglC9A',
    title: 'Adele - Hello',
    description: 'Hello - Adele',
    duration: 367,
    tags: 'pop,music,adele',
  },
  {
    youtubeId: 'OPf0YbXqDm0',
    title: 'Mark Ronson - Uptown Funk ft. Bruno Mars',
    description: 'Uptown Funk - Mark Ronson ft. Bruno Mars',
    duration: 271,
    tags: 'funk,music,brunomars',
  },
]

const testShorts = [
  {
    youtubeId: 'SXHMnicI6Pg',
    title: 'Невероятный трюк! 🔥',
    description: 'Смотри до конца!',
    duration: 30,
    tags: 'shorts,viral,трюк',
  },
  {
    youtubeId: 'ZZ5LpwO-An4',
    title: 'Смешные коты 😹',
    description: 'Подборка смешных котов',
    duration: 45,
    tags: 'shorts,коты,funny',
  },
  {
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Короткий клип Rick Astley',
    description: 'Never Gonna Give You Up - короткая версия',
    duration: 30,
    tags: 'shorts,music,rickroll',
  },
  {
    youtubeId: '9bZkp7q19f0',
    title: 'Gangnam Style - момент',
    description: 'Лучший момент из Gangnam Style',
    duration: 15,
    tags: 'shorts,dance,kpop',
  },
  {
    youtubeId: 'kJQP7kiw5Fk',
    title: 'Despacito Short',
    description: 'Танец под Despacito',
    duration: 20,
    tags: 'shorts,dance,latin',
  },
]

async function main() {
  console.log('Seeding database...')

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'demo@stiktube.com' },
    update: {},
    create: {
      email: 'demo@stiktube.com',
      name: 'StikTube Demo',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=stiktube',
    },
  })

  console.log('Created user:', user.name)

  // Create test channel
  const channel = await prisma.channel.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      name: 'StikTube Music',
      handle: 'stiktubemusic',
      description: 'Лучшие музыкальные клипы на StikTube! Подписывайтесь и ставьте лайки.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=music',
      userId: user.id,
    },
  })

  console.log('Created channel:', channel.name)

  // Create videos
  for (const videoData of testVideos) {
    const video = await prisma.video.upsert({
      where: {
        id: `seed-${videoData.youtubeId}`,
      },
      update: {
        title: videoData.title,
        description: videoData.description,
        duration: videoData.duration,
        tags: videoData.tags,
      },
      create: {
        id: `seed-${videoData.youtubeId}`,
        youtubeId: videoData.youtubeId,
        title: videoData.title,
        description: videoData.description,
        thumbnail: `https://img.youtube.com/vi/${videoData.youtubeId}/hqdefault.jpg`,
        duration: videoData.duration,
        views: Math.floor(Math.random() * 1000000),
        tags: videoData.tags,
        channelId: channel.id,
      },
    })
    console.log('Created video:', video.title)
  }

  // Create shorts
  for (const shortData of testShorts) {
    const short = await prisma.video.upsert({
      where: {
        id: `short-${shortData.youtubeId}`,
      },
      update: {
        title: shortData.title,
        description: shortData.description,
        duration: shortData.duration,
        tags: shortData.tags,
        isShort: true,
      },
      create: {
        id: `short-${shortData.youtubeId}`,
        youtubeId: shortData.youtubeId,
        title: shortData.title,
        description: shortData.description,
        thumbnail: `https://img.youtube.com/vi/${shortData.youtubeId}/hqdefault.jpg`,
        duration: shortData.duration,
        views: Math.floor(Math.random() * 500000),
        tags: shortData.tags,
        isShort: true,
        channelId: channel.id,
      },
    })
    console.log('Created short:', short.title)
  }

  // Add some subscribers
  const subscribers = await prisma.subscription.count({
    where: { channelId: channel.id },
  })

  console.log(`\nDone! Created ${testVideos.length} videos and ${testShorts.length} shorts.`)
  console.log(`Channel has ${subscribers} subscribers.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
