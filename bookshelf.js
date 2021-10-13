'use strict'

require('dotenv').config()

const debug = process.argv.includes('--verbose')

const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  },
  pool: {
    afterCreate: (conn, done) => {
      console.log('Connected')
      done(null, conn)
    }
  },
  debug
})

module.exports = require('bookshelf')(knex)
