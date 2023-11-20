import { Pipeline } from '../../src/index.mjs'

/**
 * Middleware example
 * Middleware can be any functions, sync or async 
 * and must return the next method invoked.
 */
const middleware = [
  function (data, data2, next) {
    return next(`${data} - 1`, `${data2} - A`)
  },
  function (data, data2, next) {
    return next(`${data} - 2`, `${data2} - B`)
  },
  (data, data2, next) => next(`${data} - 3`, `${data2} - C`),
  (data, data2, next) => next(`${data} - 4`, `${data2} - D`),
  (data, data2, next) => next(`${data} - 5`, `${data2} - E`),
  (data, data2, next) => next(`${data} - 6`, `${data2} - F`),
  async function (data, data2, next) {
    return next(await Promise.resolve(`${data} - 7 async`), `${data2} - G`)
  },
]

class NameMiddleware {
  handle (data, data2, next) {
    return next(`${data} - Stone's Class Middleware`, `${data2} - H`)
  }
}

middleware.push(NameMiddleware)

/**
 * Dummy Container for test purpose
 */
const DummyContainer = { make (Class) { return new Class() } }

async function test () {
  try {
    const val = await new Pipeline(DummyContainer).send('Middleware Request', 'Response').through(middleware).then((req, res) => res)
    console.log('value', val)
  } catch (error) {
    console.log('error', val)
  }
}

await test()