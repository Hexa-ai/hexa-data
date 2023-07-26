import Redis from '@ioc:Adonis/Addons/Redis'
import { base64, safeEqual } from '@poppinss/utils/build/helpers'
import { createHash } from 'crypto'
import { Ws } from 'Contracts/ws'

function generateHash(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export default async function authenticate(socket: Ws, next: any) {
  const err = new Error('not authorized')
  // @ts-ignore
  err.data = { status: 403, message: 'Invalid or Expired Token.' }
  const bearer = socket.handshake.headers.authorization
  if (bearer) {
    const userToken = bearer.split(' ')[1]
    if (userToken) {
      const parts = userToken.split('.')

      if (parts.length === 2) {
        const tokenId = base64.urlDecode(parts[0], undefined, true)

        if (tokenId) {
          const value = await Redis.get(`api:${tokenId}`)

          if (value) {
            const token = JSON.parse(value)

            const parsedToken = { tokenId, value: parts[1] }

            if (safeEqual(token.token, generateHash(parsedToken.value))) {
              socket.user = token.user_id
              return next()
            }
          }
        }
      }
    }
  }
  return next(err)
}
