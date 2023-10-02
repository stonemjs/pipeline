import { PipelineException } from './exceptions/PipelineException.mjs'

/**
 * Class representing a Pipeline.
 *
 * @author Mr. Stone <pierre.evens16@gmail.com>
 */
export class Pipeline {
  #pipes
  #method
  #container
  #passable

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
  send (passable) {
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
      )(this.#passable)
  }

  /**
   * Run the pipeline and return the result.
   *
   * @return {any}
   */
  thenReturn () {
    return this.then(passable => passable)
  }

  /**
   * Get the reducer that iterate over the pipes.
   *
   * @returns {Function}
   */
  _reducer () {
    return (stack, pipe) => {
      return passable => {
        try {
          if (this.#isFunction(pipe)) {
            return pipe(passable, stack)
          } else if (this.#isClass(pipe)) {
            pipe = this.container.make(pipe)
            return this._handleReducer(pipe[this.#method](passable, stack))
          } else {
            throw new PipelineException('Middleware must be a function or a class')
          }
        } catch (error) {
          this._handleException(passable, error)
        }
      }
    }
  }

  _prepareDestination (destination) {
    return passable => {
      try {
        destination(passable)
      } catch (error) {
        this._handleException(passable, error)
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
