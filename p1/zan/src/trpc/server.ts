import { createCallerFactory } from '../server/trpc'
import { appRouter } from '../server/routers/_app'
import { createTRPCContext } from '../server/trpc'
import { headers } from 'next/headers'

const createCaller = createCallerFactory(appRouter)

export const apiServer = async () => {
  return createCaller(await createTRPCContext({ headers: headers() }))
}
