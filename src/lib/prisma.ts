import { PrismaClient } from '@prisma/client'

// Uma unica instancia do PrismaClient para toda a aplicacao.
// Criar varias instancias abre varias conexoes com o MySQL e derruba o pool.
export const prisma = new PrismaClient({
  log: ['warn', 'error'],
})
