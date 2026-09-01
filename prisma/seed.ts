import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Populando o banco...')

  // Limpa antes para o seed poder rodar varias vezes.
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()

  const senhaHash = await bcrypt.hash('123456', 10)

  const winnicius = await prisma.user.create({
    data: { nome: 'Winnicius', email: 'winni@gmail.com', senha: senhaHash },
  })

  const joao = await prisma.user.create({
    data: { nome: 'Joao Silva', email: 'joao@email.com', senha: senhaHash },
  })

  await prisma.user.create({
    data: { nome: 'Maria Santos', email: 'maria@email.com', senha: senhaHash },
  })

  await prisma.post.createMany({
    data: [
      { conteudo: 'Primeiro post da rede social!', autorId: winnicius.id },
      { conteudo: 'Estudando Prisma com MySQL hoje.', autorId: winnicius.id },
      { conteudo: 'Bom dia, pessoal!', autorId: joao.id },
    ],
  })

  console.log('Banco populado. Senha de todos os usuarios: 123456')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
