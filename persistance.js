const { PrismaClient, Prisma } = require('@prisma/client');

const prisma = new PrismaClient()

async function find(id){
    return await prisma.mission_counter.findUnique({
        where: {
            id: id
        }
    })
}

async function create(server){
    return await prisma.mission_counter.create({data: server})
}

async function save(server){
    return await prisma.mission_counter.update({
        data: server,
        where: {
            id: server.id
        }
    })
}

async function upsert(server){
    return await prisma.mission_counter.upsert({
        where: {
          id: server.id,
        },
        update: {
            categoryId: server.categoryId
        },
        create: {
          id: server.id,
          categoryId: server.categoryId,
        },
      })
}

async function count(id){
    return await prisma.mission_counter.count({
        where: {
            id: id
        }
    })
}



exports.find = find;
exports.create = create;
exports.save = save;
exports.upsert = upsert;
exports.count = count