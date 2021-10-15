'use strict'

const bookshelf = require('../bookshelf')
const Post = require('./Post')

const User = bookshelf.model('User', {
  tableName: 'users',
  hasTimestamps: true,
  posts() {
    return this.hasMany(Post)
  }
})

User.createTable = async function () {
  const { knex } = bookshelf
  await knex.schema.createTable(User.prototype.tableName, table => {
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

    table.unique(['login'])
  })
}

User.upsert = function (user) {
  const { login, firstName, lastName } = user
  if (!login || !firstName || !lastName) {
    throw Error('login, firstName and lastName must be specified')
  }
  const { knex } = bookshelf
  return knex(User.prototype.tableName)
    .first('id')
    .where({ login })
    .then(record => {
      if (record) {
        // Record found, updating...
        return knex(User.prototype.tableName)
          .update({
            ...user,
            updated_at: new Date()
          })
          .where({ id: record.id })
      }
      // No record found, creating...
      return knex(User.prototype.tableName)
        .insert(user)
        .returning('id')
        .then(ids => ids[0])
    })
}

User.defaultColumns = () => ['id', 'status', 'login', 'firstName', 'lastName']

User.byId = (id, columns = User.defaultColumns()) => bookshelf.knex(User.prototype.tableName)
  .first(columns)
  .where({ id })

User.byLogin = (login, columns = User.defaultColumns()) => bookshelf.knex(User.prototype.tableName)
  .first(columns)
  .where({ login })

module.exports = User
