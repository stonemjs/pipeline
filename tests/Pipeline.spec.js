import { Pipeline } from '../src/Pipeline.mjs'
import { isConstructor, isString } from '@stone-js/common'

describe('Pipeline', () => {
  describe('#create', () => {
    it('Must create a Pipeline', () => {
      // Act
      const pipeline = Pipeline.create()

      // Assert
      expect(pipeline).toBeTruthy()
    })
  })

  describe('#container', () => {
    // Arrange
    const container = {
      bound: () => true,
      resolve: (Class) => new Class()
    }

    it('Must get the container', () => {
      // Arrange
      const pipeline = new Pipeline(container)

      // Assert
      expect(pipeline.container).toBeTruthy()
      expect(pipeline.container.resolve).toBeTruthy()
      expect(pipeline.container.bound).toBeTruthy()
    })

    it('Must launch an exception on container accessing', () => {
      // Arrange
      const pipeline = new Pipeline()

      try {
        // Act
        pipeline.container?.resolve()
      } catch (error) {
        // Assert
        expect(error.message).toBe('No container instance has been provided.')
      }
    })
  })

  describe('Execute pipeline', () => {
    // Arrange
    const container = {
      bound: () => true,
      make: (Class) => new Class(),
      resolve: (Class) => {
        if (isConstructor(Class)) return new Class()
        else throw new TypeError('Pipe must be a function or a class or a service alias.')
      }
    }
    const host = 'www.example.com'
    const authorization = 'Bearer token'
    const pipeline = new Pipeline(container)
    const request = { headers: {} }
    const AuthMiddleware = class {
      handle (request, next) {
        request.headers.authorization = authorization
        return next(request)
      }
    }
    const HostMiddleware = (request, next) => {
      request.host = host
      return next(request)
    }

    it('Must throw an exception when `handle` method not exists, asynchronously', async () => {
      try {
        // Arrange
        const pipeline = new Pipeline()

        // Act
        await pipeline
          .send(request)
          .through([AuthMiddleware])
          .pipe(HostMiddleware)
          .via('execute')
          .sync(false)
          .thenReturn()
      } catch (error) {
        // Assert
        expect(error.message).toBe('No method with this name(execute) exists in this constructor(AuthMiddleware)')
      }
    })

    it('Must throw an exception when `handle` method not exists, synchronously', () => {
      try {
        // Act
        pipeline
          .send(request)
          .through([AuthMiddleware])
          .pipe(HostMiddleware)
          .via('execute')
          .sync()
          .thenReturn()
      } catch (error) {
        // Assert
        expect(error.message).toBe('No method with this name(execute) exists in this constructor(AuthMiddleware)')
      }
    })

    it('Must throw an exception when pipe is neither a class nor a function nor a service alias, synchronously', () => {
      try {
        // Act
        pipeline
          .send(request)
          .pipe({})
          .via('handle')
          .sync()
          .thenReturn()
      } catch (error) {
        // Assert
        expect(error.message).toBe('Pipe must be a function, a class or a service alias.')
      }
    })

    it('Must throw an exception when pipe is neither a class nor a function nor a service alias, asynchronously', async () => {
      try {
        // Act
        await Pipeline.create()
          .send(request)
          .pipe({})
          .via('handle')
          .sync(false)
          .thenReturn()
      } catch (error) {
        // Assert
        expect(error.message).toBe('Pipe must be a function, a class or a service alias.')
      }
    })

    it('Must throw an exception when passable throw an exception, synchronously', () => {
      try {
        // Act
        pipeline
          .send(request)
          .through([AuthMiddleware])
          .via('handle')
          .sync()
          .then(() => { throw new TypeError('Exception message') })
      } catch (error) {
        // Assert
        expect(error.message).toBe('Exception message')
      }
    })

    it('Must throw an exception when passable throw an exception, asynchronously', async () => {
      try {
        // Act
        await pipeline
          .send(request)
          .through([AuthMiddleware])
          .via('handle')
          .sync(false)
          .then(() => { throw new TypeError('Exception message') })
      } catch (error) {
        // Assert
        expect(error.message).toBe('Exception message')
      }
    })

    it('Must throw an exception when pipe is neither a constructor nor a function and when container is null', async () => {
      try {
        // Act
        await Pipeline
          .create()
          .send(request)
          .through(['AuthMiddleware'])
          .thenReturn()
      } catch (error) {
        // Assert
        expect(error.message).toBe('Cannot resolve this pipe AuthMiddleware.')
      }
    })

    it('Execute pipeline asynchronously', async () => {
      // Act
      const newRequest = await pipeline
        .send(request)
        .through([AuthMiddleware])
        .pipe(HostMiddleware)
        .via('handle')
        .sync(false)
        .thenReturn()

      // Assert
      expect(newRequest.host).toBe(host)
      expect(newRequest.headers).toEqual({ authorization })
    })

    it('Execute pipeline synchronously', () => {
      // Act
      const newRequest = pipeline
        .send(request)
        .through([AuthMiddleware])
        .pipe(HostMiddleware)
        .via('handle')
        .sync()
        .thenReturn()

      // Assert
      expect(newRequest.host).toBe(host)
      expect(newRequest.headers).toEqual({ authorization })
    })

    it('Execute pipeline synchronously with alias pipe', () => {
      // Arrange
      const container = {
        bound: () => true,
        make: (Class) => new Class(),
        resolve: (Class) => {
          if (isConstructor(Class)) return new Class()
          else if (isString(Class)) return new AuthMiddleware()
          else throw new TypeError('Pipe must be a function or a class or a service alias.')
        }
      }

      // Act
      const newRequest = Pipeline
        .create(container)
        .send(request)
        .through(['AuthMiddleware'])
        .pipe(HostMiddleware)
        .via('handle')
        .sync()
        .thenReturn()

      // Assert
      expect(newRequest.host).toBe(host)
      expect(newRequest.headers).toEqual({ authorization })
    })
  })
})
