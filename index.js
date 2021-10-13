'use strict'

require('dotenv').config()
const bookshelf = require('./bookshelf')
const User = require('./User')

async function main () {
  const debug = process.argv.includes('--verbose')

  const Models = [User]
  for await (const Model of Models) {
    const tableName = Model.prototype.tableName
    const tableExists = await bookshelf.knex.schema.hasTable(tableName)
    if (tableExists) {
      console.log(`Drop ${tableName} table...`)
      await bookshelf.knex.schema.dropTable(tableName)
    }
    console.log(`Creating ${tableName} table...`)
    await Model.createTable()
  }

  await User.upsert({
    login: 'abuchholz',
    firstName: 'arnaud',
    lastName: 'buchholz'
  })

  const user1 = await new User({ id: 1 }).fetch()
  console.log('Using bookshelp helper', user1.attributes)

  const byId = await User.byId(1)
  console.log('Using knex (byId)', byId)

  const byLogin = await User.byLogin('abuchholz')
  console.log('Using knex (byLogin)', byLogin)

  bookshelf.knex.destroy(() => console.log('ending...'))
}

main()
