'use strict'

require('dotenv').config()

async function main () {
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
    }
  })
 
  const usersTableExists = await knex.schema.hasTable('users')
  console.log('users :', usersTableExists)
}

main()

/*
const bookshelf = require('bookshelf')(pg)

const User = bookshelf.model('User', {
  tableName: 'users',
  posts() {
    return this.hasMany(Posts)
  }
})
   
const Post = bookshelf.model('Post', {
  tableName: 'posts',
  tags() {
    return this.belongsToMany(Tag)
  }
})
   
const Tag = bookshelf.model('Tag', {
  tableName: 'tags'
})
   
new User({id: 1}).fetch({withRelated: ['posts.tags']}).then((user) => {
  console.log(user.related('posts').toJSON())
}).catch((error) => {
  console.error(error)
})
*/