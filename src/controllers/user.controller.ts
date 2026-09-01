import bcrypt from 'bcryptjs'
import type { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

// Campos que a API pode devolver. A senha NUNCA entra aqui.
const dadosPublicos = {
  id: true,
  nome: true,
  email: true,
  criadoEm: true,
}

export async function listarUsuarios(request: Request, response: Response) {
  const users = await prisma.user.findMany({
    select: dadosPublicos,
    orderBy: { id: 'asc' },
  })

  return response.json({
    message: `Lista de usuarios (${users.length})`,
    users,
  })
}

export async function buscarUsuario(request: Request, response: Response) {
  const id = Number(request.params.id)

  if (Number.isNaN(id)) {
    return response.status(400).json({ error: 'O id precisa ser um numero.' })
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...dadosPublicos,
      posts: {
        select: { id: true, conteudo: true, criadoEm: true },
        orderBy: { criadoEm: 'desc' },
      },
    },
  })

  if (!user) {
    return response.status(404).json({ error: 'Usuario nao encontrado.' })
  }

  return response.json({ user })
}

export async function criarUsuario(request: Request, response: Response) {
  const { nome, email, senha } = request.body

  if (!nome || !email || !senha) {
    return response
      .status(400)
      .json({ error: 'Os campos nome, email e senha sao obrigatorios.' })
  }

  const emailJaExiste = await prisma.user.findUnique({ where: { email } })

  if (emailJaExiste) {
    return response.status(409).json({ error: 'Este email ja esta cadastrado.' })
  }

  // Nunca salve senha em texto puro no banco.
  const senhaHash = await bcrypt.hash(senha, 10)

  const user = await prisma.user.create({
    data: { nome, email, senha: senhaHash },
    select: dadosPublicos,
  })

  return response.status(201).json({ message: 'Usuario criado com sucesso!', user })
}

export async function atualizarUsuario(request: Request, response: Response) {
  const id = Number(request.params.id)
  const { nome, email } = request.body

  if (Number.isNaN(id)) {
    return response.status(400).json({ error: 'O id precisa ser um numero.' })
  }

  const existe = await prisma.user.findUnique({ where: { id } })

  if (!existe) {
    return response.status(404).json({ error: 'Usuario nao encontrado.' })
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      nome: nome ?? existe.nome,
      email: email ?? existe.email,
    },
    select: dadosPublicos,
  })

  return response.json({ message: 'Usuario atualizado!', user })
}

export async function deletarUsuario(request: Request, response: Response) {
  const id = Number(request.params.id)

  if (Number.isNaN(id)) {
    return response.status(400).json({ error: 'O id precisa ser um numero.' })
  }

  const existe = await prisma.user.findUnique({ where: { id } })

  if (!existe) {
    return response.status(404).json({ error: 'Usuario nao encontrado.' })
  }

  // Os posts do usuario somem junto por causa do onDelete: Cascade no schema.
  await prisma.user.delete({ where: { id } })

  return response.status(204).send()
}

export async function login(request: Request, response: Response) {
  const { email, senha } = request.body

  if (!email || !senha) {
    return response.status(400).json({ error: 'Informe email e senha.' })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // Mesma mensagem nos dois casos: nao entregamos quais emails existem.
  if (!user || !(await bcrypt.compare(senha, user.senha))) {
    return response.status(401).json({ error: 'Email ou senha invalidos.' })
  }

  return response.json({
    message: 'Login realizado com sucesso!',
    user: { id: user.id, nome: user.nome, email: user.email },
  })
}
