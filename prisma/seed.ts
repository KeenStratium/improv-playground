import { PrismaClient } from '@prisma/client'
import { random } from 'casual'
import faker = require('faker')
const prisma = new PrismaClient()

const avatarUrls = [
    'https://randomuser.me/api/portraits/men/1.jpg',
    'https://images-na.ssl-images-amazon.com/images/M/MV5BNTk2OGU4NzktODhhOC00Nzc2LWIyNzYtOWViMjljZGFiNTMxXkEyXkFqcGdeQXVyMTE1NTQwOTk@._V1_UY256_CR12,0,172,256_AL_.jpg',
    'https://images-na.ssl-images-amazon.com/images/M/MV5BMTc0MzgxMzQ5N15BMl5BanBnXkFtZTgwMzMzNjkwOTE@._V1_UX172_CR0,0,172,256_AL_.jpg',
    'https://images.pexels.com/photos/355164/pexels-photo-355164.jpeg?crop=faces&fit=crop&h=200&w=200&auto=compress&cs=tinysrgb',
    'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&crop=faces&fit=crop&h=200&w=200',
    'https://images-na.ssl-images-amazon.com/images/M/MV5BOTk1MzgzOTg5OV5BMl5BanBnXkFtZTcwNDQ4NjMxOA@@._V1_UY256_CR1,0,172,256_AL_.jpg',
    'https://uifaces.co/our-content/donated/2bvuFyb8.jpg',
    'https://images.generated.photos/B7CJLWXHEhr73EmhhiWyTK-WT39VwobNNqwknL-vwUg/rs:fit:512:512/Z3M6Ly9nZW5lcmF0/ZWQtcGhvdG9zLzA5/NzY1NDcuanBn.jpg',
    'https://uifaces.co/our-content/donated/6h0HeYG_.jpg',
    'https://images-na.ssl-images-amazon.com/images/M/MV5BNTczMzk1MjU1MV5BMl5BanBnXkFtZTcwNDk2MzAyMg@@._V1_UY256_CR2,0,172,256_AL_.jpg'
]

const sampleMediaUrls = [
    'https://images.unsplash.com/photo-1506702315536-dd8b83e2dcf9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2550&q=80',
    'https://images.unsplash.com/photo-1587763483696-6d41d2de6084?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1234&q=80',
    'https://images.unsplash.com/photo-1560782202-154b39d57ef2?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1234&q=80',
    'https://images.unsplash.com/photo-1569527151622-5ccd6275e21e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1234&q=80',
    'https://images.unsplash.com/photo-1554863804-69546eb96737?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2247&q=80'
]

async function main() {
    const cities = await prisma.city.createMany({
        data: [
            {
                name: 'Bacolod'
            },
            {
                name: 'Talisay'
            },
            {
                name: 'Silay'
            },
            {
                name: 'Sagay'
            }
        ]
    })

    const improvAcc = await prisma.account.create({
        data: {
            username: 'improv',
            password: 'improv123',
            type: 'Citizen',
            user: {
                create: {
                    avatarUrl: 'https://images-na.ssl-images-amazon.com/images/M/MV5BNTczMzk1MjU1MV5BMl5BanBnXkFtZTcwNDk2MzAyMg@@._V1_UY256_CR2,0,172,256_AL_.jpg',
                    cityId: 1,
                    firstName: 'Improv',
                    lastName: 'Stratium',
                    displayName: 'anon-8972',
                    isAnonymous: false
                }
            }
        }
    })

    const johnAcc = await prisma.account.create({
        data: {
            username: 'john',
            password: 'john123',
            type: 'Citizen',
            user: {
                create: {
                    avatarUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&crop=faces&fit=crop&h=200&w=200',
                    cityId: 1,
                    firstName: 'Joe',
                    lastName: 'Appleseed',
                    displayName: faker.internet.userName(),
                    isAnonymous: false
                }
            }
        }
    })

    const reportValues = await prisma.valueMeta.createMany({
        data: [
            {
                id: 'rt-1',
                value: 'Road Development'
            },
            {
                id: 'rt-2',
                value: 'Lighting Issue'
            },
            {
                id: 'rt-3',
                value: 'Road Obstruction'
            },
            {
                id: 'rt-4',
                value: 'Pothole'
            },
            {
                id: 'rt-5',
                value: 'Chemical Hazard'
            },
            {
                id: 'rt-6',
                value: 'Public Area Hazard'
            },
            {
                id: 'rt-7',
                value: 'Public Area Foul Smell'
            },
            {
                id: 'rt-8',
                value: 'Crash Prone Area'
            },
            {
                id: 'rt-9',
                value: 'Water Leak'
            },
            {
                id: 'rt-10',
                value: 'Convulated Power Lines',
            }
        ]
    })

    const statusValues = await prisma.valueMeta.createMany({
        data: [
            {
                id: 'st-1',
                value: 'In-progress'
            },
            {
                id: 'st-2',
                value: 'Resolved'
            },
            {
                id: 'st-3',
                value: 'Abandoned'
            }
        ]
    })

    const mediaUploads = await prisma.mediaUpload.createMany({
        data: [
            {
                mediaUrls: getRandomUrls(),
            },
            {
                mediaUrls: getRandomUrls(),
            },
            {
                mediaUrls: getRandomUrls(),
            },
            {
                mediaUrls: getRandomUrls(),
            },
            {
                mediaUrls: getRandomUrls(),
            },
        ]
    })

    const posts = await prisma.post.createMany({
        data: [
            {
                userId: 1,
                title: getRandomTitle(),
                content: faker.lorem.sentences(),
                reactionCount: getReactionCount(),
                mediaUploadId: 1,
                typeId: 'rt-1',
                cityId: 1,
                state: 1
            },
            {
                userId: 2,
                title: getRandomTitle(),
                content: faker.lorem.sentences(),
                reactionCount: getReactionCount(),
                mediaUploadId: 2,
                typeId: 'rt-2',
                cityId: 1,
                state: 1
            },
            {
                userId: 1,
                title: getRandomTitle(),
                content: faker.lorem.sentences(),
                reactionCount: getReactionCount(),
                mediaUploadId: 3,
                typeId: 'rt-3',
                cityId: 1,
                state: 1
            },
            {
                userId: 2,
                title: getRandomTitle(),
                content: faker.lorem.sentences(),
                reactionCount: getReactionCount(),
                typeId: 'rt-5',
                cityId: 1,
                state: 1
            }
        ]
    })

    const comments = await prisma.comment.createMany({
        data: [
            {
                userId: 1,
                content: faker.lorem.sentences(),
                state: 1,
                reactionCount: getReactionCount(),
                postId: 1
            },
            {
                userId: 2,
                content: faker.lorem.sentences(),
                state: 1,
                reactionCount: getReactionCount(),
                postId: 1
            },
            {
                userId: 1,
                content: faker.lorem.sentences(),
                state: 1,
                reactionCount: getReactionCount(),
                postId: 2
            },
            {
                userId: 2,
                content: faker.lorem.sentences(),
                state: 1,
                reactionCount: getReactionCount(),
                mediaUploadId: 4,
                postId: 2,
                parentCommentId: 3
            },
            {
                userId: 1,
                content: faker.lorem.sentences(),
                state: 1,
                reactionCount: getReactionCount(),
                postId: 2,
                parentCommentId: 3
            },
            {
                userId: 2,
                content: faker.lorem.sentences(),
                state: 1,
                reactionCount: getReactionCount(),
                postId: 2,
                parentCommentId: 5
            },
            {
                userId: 1,
                content: faker.lorem.sentences(),
                state: 1,
                reactionCount: getReactionCount(),
                mediaUploadId: 5,
                postId: 2,
                parentCommentId: 4
            },
            {
                userId: 2,
                content: faker.lorem.sentences(),
                state: 1,
                reactionCount: getReactionCount(),
                mediaUploadId: 1,
                postId: 3,
            }
        ]
    })

    console.log({ cities, improvAcc, johnAcc, reportValues, statusValues, mediaUploads, posts, comments })
}

function getRandomUrls() {
    const randomUrls = faker.random.arrayElements(
        sampleMediaUrls,
        faker.random.number({
            min: 1,
            max: sampleMediaUrls.length
        })
    )

    return randomUrls;
}

function getRandomTitle() {
    return faker.lorem.sentence(faker.random.number({
        min: 4,
        max: 12
    }))
}

function getReactionCount() {
    return {
        like: faker.random.number({
            min: 0,
            max: 999
        })
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })