'use strict'

require('dotenv').config()
const bookshelf = require('./bookshelf')
const User = require('./models/User')
const Post = require('./models/Post')

async function main () {
  const debug = process.argv.includes('--verbose')

  const Models = [User, Post]
  for await (const Model of Models) {
    const tableName = Model.prototype.tableName
    const tableExists = await bookshelf.knex.schema.hasTable(tableName)
    if (!tableExists) {
      console.log(`Creating ${tableName} table...`)
      await Model.createTable()
    }
  }

  await User.upsert({
    login: 'abuchholz',
    firstName: 'arnaud',
    lastName: 'buchholz'
  })

  const userId = (await User.byLogin('abuchholz')).id
  await Post.insert(userId, 'Test')
  await Post.insert(userId, 'Test 2')

  const userWithPosts = await new User({ id: userId }).fetch({ withRelated: ['posts'] })
  console.log(`User has ${userWithPosts.related('posts').length} posts`)

  bookshelf.knex.destroy(() => console.log('ending...'))
}

main()
