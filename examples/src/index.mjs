import { Pipeline } from '../../src/index.mjs'

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
]

new Pipeline()
  .send('Middleware')
  .through(middleware)
  .then(data => console.log(data))