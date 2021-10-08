'use strict'

require('dotenv').config()

async function main () {
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

  const TABLENAMES = {
    USERS: 'users'
  }
 
  const usersTableExists = await knex.schema.hasTable(TABLENAMES.USERS)
  if (usersTableExists) {
    console.log('Drop users table...')
    await knex.schema.dropTable(TABLENAMES.USERS)
  }

  console.log('Creating users table...')
  await knex.schema.createTable(TABLENAMES.USERS, table => {
    table.increments('id')
      .primary()
    table.enum('status', ['pending', 'active', 'locked', 'deleted'])
      .notNullable()
      .defaultTo('pending')
      .index()

    table.timestamp('created_at', true)
      .defaultTo(knex.raw('now()'))
    table.timestamp('updated_at', true)
      .notNullable()
      .defaultTo(knex.raw('now()'))
    table.timestamp('deleted_at', true)

    table.string('login')
      .notNullable()
      .index()
    table.string('firstName')
      .notNullable()
    table.string('lastName')
      .notNullable()

    /* Create relation between audience and connection */
    // table.integer('connection_id').references('connections.id');
    table.unique(['login'])
  })
  console.log("Table created.")

  const bookshelf = require('bookshelf')(knex)
  const User = bookshelf.Model.extend({
    tableName: TABLENAMES.USERS,
    hasTimestamps: true
  })

  User.upsert = function (user) {
    const { login, firstName, lastName } = user
    if (!login || !firstName || !lastName) {
      throw Error('login, firstName and lastName must be specified')
    }
    console.log('User.upsert', user, '...')
    return knex(TABLENAMES.USERS)
      .first('id')
      .where({
        login
      })
      .then(record => {
        if (record) {
          console.log('\trecord found, updating...')
          return knex(TABLENAMES.USERS)
            .update({
              ...user,
              updated_at: new Date()
            })
            .where({ id })
        }
        console.log('\tno record found, creating...')
        return knex(TABLENAMES.USERS)
          .insert(user)
          .returning('id')
          .then(ids => ids[0])
      })
      .then(value => {
        console.log('\tdone.')
        return value
      })
  }

  User.byId = function (id, columns) {
    columns = columns || ['id', 'status', 'login', 'firstName', 'lastName']
    return knex(TABLENAMES.USERS)
      .first(columns)
      .where({ id })
  }

  await User.upsert({
    login: 'abuchholz',
    firstName: 'arnaud',
    lastName: 'buchholz'
  })

  const user1 = await new User({ id: 1 }).fetch()
  console.log('Using bookshelp helper', user1.attributes)

  const byId = await User.byId(1)
  console.log('Using knex', byId)

  bookshelf.knex.destroy(() => console.log('ending...'))
}

main()
