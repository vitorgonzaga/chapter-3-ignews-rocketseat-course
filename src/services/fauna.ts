import { Client } from 'faunadb'

const clientConfig = {
  secret: process.env.FAUNADB_KEY as string
}

export const fauna = new Client(clientConfig)