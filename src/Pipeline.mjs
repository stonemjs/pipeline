import { isConstructor, isFunction, isString } from '@stone-js/common'

/**
 * Class representing a Pipeline.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class Pipeline {
  #pipes
  #method
  #isSync
  #passable
  #container

  /**
   * The Container class.
   *
   * @external Container
   * @see {@link https://github.com/stonemjs/service-container/blob/main/src/Container.mjs|Container}
   */

  /**
   * Create a pipeline.
   *
   * @param  {external:Container} [container=null]
   * @return {Pipeline}
   */
  static create (container = null) {
    return new this(container)
  }

  /**
   * Create a pipeline.
   *
   * @param {external:Container} [container=null]
   */
  constructor (container = null) {
    this.#pipes = []
    this.#method = 'handle'
    this.#container = container
  }

  /**
   * Get the array of configured pipes.
   *
   * @return {Array}
   */
  get pipes () {
    return this.#pipes
  }

  /**
   * Get the container instance.
   *
   * @return {Container}
   * @throws {TypeError}
   */
  get container () {
    if (!this.#container) {
      throw new TypeError('No container instance has been provided.')
    }

    return this.#container
  }

  /**
   * Set the passable object being sent on the pipeline.
   *
   * @param  {...*} passable
   * @return {this}
   */
  send (...passable) {
    this.#passable = passable
    return this
  }

  /**
   * Set the pipes of the pipeline.
   *
   * @param  {Array} pipes
   * @return {this}
   */
  through (pipes) {
    this.#pipes = [...pipes]
    return this
  }

  /**
   * Push additional pipes onto the pipeline.
   *
   * @param  {Array|Function} pipe
   * @return {this}
   */
  pipe (pipe) {
    this.#pipes = this.#pipes.concat(pipe)
    return this
  }

  /**
   * Set the method to call on the stops.
   *
   * @param  {string} method
   * @return {this}
   */
  via (method) {
    this.#method = method
    return this
  }

  /**
   * Make pipeline sync.
   *
   * @param  {boolean} value
   * @return {this}
   */
  sync (value = true) {
    this.#isSync = value
    return this
  }

  /**
   * Destination callback.
   *
   * @callback destinationCallback
   * @param  {...*} passable - The passable object being sent on the pipeline.
   * @return {*} The passable.
   */

  /**
   * Run the pipeline with a final destination callback.
   *
   * @param  {destinationCallback} destination
   * @return {*}
   */
  then (destination) {
    return this
      .pipes
      .reverse()
      .reduce(
        this.#isSync ? this._reducer() : this._asyncReducer(),
        (...passable) => destination(...passable)
      )(...this.#passable)
  }

  /**
   * Run the pipeline and return the result.
   *
   * @return {*}
   */
  thenReturn () {
    return this.then((passable) => passable)
  }

  /**
   * Get the async reducer that iterate over the pipes.
   *
   * @return {Function}
   * @throws {TypeError}
   */
  _asyncReducer () {
    return (stack, pipe) => {
      return async (...passable) => {
        if (isString(pipe) || isConstructor(pipe)) {
          return await this.#executePipe(pipe, this.#makeArgs(passable, stack))
        } else if (isFunction(pipe)) {
          return await pipe(...this.#makeArgs(passable, stack))
        } else {
          throw new TypeError('Pipe must be a function, a class or a service alias.')
        }
      }
    }
  }

  /**
   * Get the reducer that iterate over the pipes.
   *
   * @return {Function}
   * @throws {TypeError}
   */
  _reducer () {
    return (stack, pipe) => {
      return (...passable) => {
        if (isString(pipe) || isConstructor(pipe)) {
          return this.#executePipe(pipe, this.#makeArgs(passable, stack))
        } else if (isFunction(pipe)) {
          return pipe(...this.#makeArgs(passable, stack))
        } else {
          throw new TypeError('Pipe must be a function, a class or a service alias.')
        }
      }
    }
  }

  /**
   * Resolve and execute Pipe.
   *
   * @param  {(string|Function)} Pipe - Pipe can be a class or a service alias string.
   * @param  {Array} args - Pipe Arguments.
   * @return {Object}
   * @throws {TypeError}
   */
  #executePipe (Pipe, args) {
    let instance = null

    if (this.#container) {
      instance = this.#container.resolve(Pipe)
    } else if (isFunction(Pipe)) {
      instance = new Pipe()
    } else {
      throw new TypeError(`Cannot resolve this pipe ${Pipe}.`)
    }

    if (!instance[this.#method]) {
      throw new TypeError(`No method with this name(${this.#method}) exists in this constructor(${instance.constructor.name})`)
    }

    return instance[this.#method](...args)
  }

  #makeArgs (passable, stack) {
    return [].concat(passable, stack)
  }
}
