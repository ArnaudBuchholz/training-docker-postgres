'use strict'

const bookshelf = require('../bookshelf')

const Post = bookshelf.model('Post', {
  tableName: 'posts',
  hasTimestamps: true
})

Post.createTable = async function () {
  const { knex } = bookshelf
  await knex.schema.createTable(Post.prototype.tableName, table => {
    table.increments('id')
      .primary()

    table.timestamp('posted_at', true)
      .defaultTo(knex.raw('now()'))
    table.timestamp('updated_at', true)
      .notNullable()
      .defaultTo(knex.raw('now()'))
    table.timestamp('deleted_at', true)

    table.string('message')
      .notNullable()

    table.integer('user_id').references('users.id')
  })
}

Post.insert = (userId, message) => bookshelf.knex(Post.prototype.tableName)
  .insert({
    user_id: userId,
    message
  })

module.exports = Post
