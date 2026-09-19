import { Router } from 'express'
import {
  atualizarUsuario,
  buscarUsuario,
  criarUsuario,
  deletarUsuario,
  listarUsuarios,
  login,
  meuPerfil,
} from '../controllers/user.controller'
import { autenticar } from '../middlewares/auth'

export const userRoutes = Router()

// Rotas publicas
userRoutes.post('/login', login)
userRoutes.get('/', listarUsuarios)
userRoutes.post('/', criarUsuario)

// Rota "usuario logado" - precisa vir antes de "/:id" para nao ser
// interpretada como um id.
userRoutes.get('/me', autenticar, meuPerfil)

userRoutes.get('/:id', buscarUsuario)

// Rotas protegidas por JWT: so o dono do token edita/apaga a propria conta.
userRoutes.put('/', autenticar, atualizarUsuario)
userRoutes.delete('/', autenticar, deletarUsuario)
