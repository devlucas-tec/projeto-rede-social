import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

// Estendemos o tipo Request para carregar o id do usuario autenticado
// depois que o token for validado.
declare global {
  namespace Express {
    interface Request {
      userId?: number
    }
  }
}

interface TokenPayload {
  id: number
}

/**
 * Middleware de autenticacao.
 * Le o header "Authorization: Bearer <token>", valida o JWT e injeta
 * o id do usuario logado em request.userId para os controllers usarem.
 */
export function autenticar(request: Request, response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    return response.status(401).json({ error: 'Token nao informado.' })
  }

  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return response.status(401).json({ error: 'Formato de token invalido. Use: Bearer <token>' })
  }

  try {
    const secret = process.env.JWT_SECRET as string
    const payload = jwt.verify(token, secret) as TokenPayload

    request.userId = payload.id

    return next()
  } catch {
    return response.status(401).json({ error: 'Token invalido ou expirado.' })
  }
}
