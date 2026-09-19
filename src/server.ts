import cors from 'cors'
import dotenv from 'dotenv'
import express, { type NextFunction, type Request, type Response } from 'express'
import { prisma } from './lib/prisma'
import { logger } from './middlewares/logger'
import { postRoutes } from './routes/post.routes'
import { userRoutes } from './routes/user.routes'

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//  MIDDLEWARE GLOBAL DE LOG 
// Precisa vir ANTES das rotas para interceptar todas as requisicoes.
app.use(logger)

//  ROTAS 
app.get('/', (request: Request, response: Response) => {
  response.json({
    message: 'Bem-vindo a API da Rede Social!',
    timestamp: new Date().toISOString(),
    status: 'API funcionando!',
    rotas: {
      users: '/users',
      posts: '/posts',
      health: '/health',
    },
  })
})

app.get('/health', async (request: Request, response: Response) => {
  try {
    // Consulta trivial so para confirmar que o MySQL responde.
    await prisma.$queryRaw`SELECT 1`
    response.json({ status: 'ok', database: 'conectado' })
  } catch {
    response.status(503).json({ status: 'erro', database: 'desconectado' })
  }
})

app.use('/users', userRoutes)
app.use('/posts', postRoutes)

//  404 
app.use((request: Request, response: Response) => {
  response.status(404).json({ error: `Rota ${request.method} ${request.originalUrl} nao existe.` })
})

//  TRATAMENTO DE ERROS 
// Middleware de erro sempre tem 4 parametros e vem por ultimo.
app.use((error: Error, request: Request, response: Response, next: NextFunction) => {
  console.error('Erro nao tratado:', error)
  response.status(500).json({ error: 'Erro interno do servidor.' })
})

const server = app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`)
  console.log(`Health:  http://localhost:${port}/health`)
})

// Fecha a conexao com o banco antes de derrubar o processo.
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  server.close(() => process.exit(0))
})
