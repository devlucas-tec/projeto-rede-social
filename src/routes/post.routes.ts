import { Router } from 'express'
import { criarPost, deletarPost, listarPosts } from '../controllers/post.controller'

export const postRoutes = Router()

postRoutes.get('/', listarPosts)
postRoutes.post('/', criarPost)
postRoutes.delete('/:id', deletarPost)
