import { Router } from 'express'
import {
  atualizarUsuario,
  buscarUsuario,
  criarUsuario,
  deletarUsuario,
  listarUsuarios,
  login,
} from '../controllers/user.controller'

export const userRoutes = Router()

userRoutes.post('/login', login)
userRoutes.get('/', listarUsuarios)
userRoutes.get('/:id', buscarUsuario)
userRoutes.post('/', criarUsuario)
userRoutes.put('/:id', atualizarUsuario)
userRoutes.delete('/:id', deletarUsuario)
