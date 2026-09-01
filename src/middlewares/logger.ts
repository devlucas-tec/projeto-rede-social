import type { NextFunction, Request, Response } from 'express'

/**
 * Middleware global de log.
 * Intercepta TODAS as requisicoes, imprime metodo + rota no console
 * e libera o fluxo chamando next().
 */
export function logger(request: Request, response: Response, next: NextFunction) {
  const inicio = Date.now()
  const dataHora = new Date().toLocaleString('pt-BR')

  console.log(`[${dataHora}] --> ${request.method} ${request.originalUrl}`)

  // 'finish' dispara quando a resposta termina de ser enviada.
  // Assim conseguimos logar tambem o status e o tempo gasto.
  response.on('finish', () => {
    const duracao = Date.now() - inicio
    console.log(
      `[${dataHora}] <-- ${request.method} ${request.originalUrl} ${response.statusCode} (${duracao}ms)`,
    )
  })

  next() // libera o fluxo para o proximo middleware / rota
}
