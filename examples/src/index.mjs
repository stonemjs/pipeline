import { Pipeline } from '../../src/index.mjs'

/**
 * Middleware example
 * Middleware can be any functions, sync or async 
 * and must return the next method invoked.
 */
const middleware = [
  function (data, next) {
    return next(`${data} - 1`)
  },
  function (data, next) {
    return next(`${data} - 2`)
  },
  (data, next) => next(`${data} - 3`),
  (data, next) => next(`${data} - 4`),
  (data, next) => next(`${data} - 5`),
  (data, next) => next(`${data} - 6`),
  async function (data, next) {
    return next(await Promise.resolve(`${data} - 7 async`))
  },
]

class NameMiddleware {
  handle (data, next) {
    return next(`${data} - Stone's Class Middleware`)
  }
}

middleware.push(NameMiddleware)

/**
 * Dummy Container for test purpose
 */
const DummyContainer = { make (Class) { return new Class() } }

new Pipeline(DummyContainer)
  .send('Middleware')
  .through(middleware)
  .then(data => console.log(data))