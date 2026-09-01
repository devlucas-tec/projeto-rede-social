import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

export async function listarPosts(request: Request, response: Response) {
  const posts = await prisma.post.findMany({
    orderBy: { criadoEm: 'desc' },
    include: {
      autor: { select: { id: true, nome: true } },
    },
  })

  return response.json({
    message: `Lista de posts (${posts.length})`,
    posts,
  })
}

export async function criarPost(request: Request, response: Response) {
  const { conteudo, autorId } = request.body

  if (!conteudo || !autorId) {
    return response
      .status(400)
      .json({ error: 'Os campos conteudo e autorId sao obrigatorios.' })
  }

  const autor = await prisma.user.findUnique({ where: { id: Number(autorId) } })

  if (!autor) {
    return response.status(404).json({ error: 'Autor nao encontrado.' })
  }

  const post = await prisma.post.create({
    data: { conteudo, autorId: Number(autorId) },
    include: { autor: { select: { id: true, nome: true } } },
  })

  return response.status(201).json({ message: 'Post publicado!', post })
}

export async function deletarPost(request: Request, response: Response) {
  const id = Number(request.params.id)

  if (Number.isNaN(id)) {
    return response.status(400).json({ error: 'O id precisa ser um numero.' })
  }

  const existe = await prisma.post.findUnique({ where: { id } })

  if (!existe) {
    return response.status(404).json({ error: 'Post nao encontrado.' })
  }

  await prisma.post.delete({ where: { id } })

  return response.status(204).send()
}
