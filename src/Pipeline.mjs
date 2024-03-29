import { PipelineException } from './exceptions/PipelineException.mjs'

/**
 * Class representing a Pipeline.
 *
 * @author Mr. Stone <pierre.evens16@gmail.com>
 */
export class Pipeline {
  #pipes
  #method
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
   * @param {Container} container
   */
  static create (container) {
    return new this(container)
  }

  /**
   * Create a pipeline.
   *
   * @param {Container} container
   */
  constructor (container) {
    this.#pipes = []
    this.#method = 'handle'
    this.#container = container
  }

  /**
   * Get the array of configured pipes.
   *
   * @return {array}
   */
  get pipes () {
    return this.#pipes
  }

  /**
   * Get the container instance.
   *
   * @return {Container}
   * @throws {PipelineException}
   */
  get container () {
    if (!this.#container) {
      throw new PipelineException('A container instance has not been passed to the Pipeline.')
    }

    return this.#container
  }

  /**
   * Set the passable object being sent on the pipeline.
   *
   * @param  {any}  passable
   * @return {this}
   */
  send (...passable) {
    this.#passable = passable
    return this
  }

  /**
   * Set the pipes of the pipeline.
   *
   * @param  {array} pipes
   * @return {this}
   */
  through (pipes) {
    this.#pipes = pipes
    return this
  }

  /**
   * Push additional pipes onto the pipeline.
   *
   * @param  {array|Function} pipe
   * @return {this}
   */
  pipe (pipe) {
    pipe = Array.isArray(pipe) ? pipe : [pipe]
    this.#pipes.push(...pipe)
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
   * Run the pipeline with a final destination callback.
   *
   * @param  {Function} destination
   * @return {any}
   */
  then (destination) {
    return this
      .pipes
      .reverse()
      .reduce(
        this._reducer(),
        this._prepareDestination(destination)
      )(...this.#passable)
  }

  /**
   * Run the pipeline and return the result.
   *
   * @return {any}
   */
  thenReturn () {
    return this.then((...passable) => passable)
  }

  /**
   * Get the reducer that iterate over the pipes.
   *
   * @returns {Function}
   */
  _reducer () {
    return (stack, Pipe) => {
      return async (...passable) => {
        try {
          const args = [].concat(passable, stack)

          if (this.#isClass(Pipe)) {
            Pipe = this.#container ? this.#container.make(Pipe) : new Pipe()

            if (!Pipe[this.#method]) {
              throw new PipelineException(`No method with this name(${this.#method}) exists in this class(${Pipe.constructor.name})`)
            }

            return await this._handleReducer(Pipe[this.#method](...args))
          } else if (this.#isFunction(Pipe)) {
            return await Pipe(...args)
          } else {
            throw new PipelineException('Pipe must be a function or a class.')
          }
        } catch (error) {
          return this._handleException(passable, error)
        }
      }
    }
  }

  _prepareDestination (destination) {
    return async (...passable) => {
      try {
        return await destination(...passable)
      } catch (error) {
        return this._handleException(passable, error)
      }
    }
  }

  _handleReducer (reducer) {
    return reducer
  }

  _handleException (passable, error) {
    throw error
  }

  #isFunction (value) {
    return typeof value === 'function'
  }

  #isClass (value) {
    return this.#isFunction(value) && /^\s*class/.test(value.toString())
  }
}
