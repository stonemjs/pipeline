/**
 * Class representing a PipelineException.
 */
export class PipelineException extends Error {
  static CODE = 'PIPE-500'

  constructor (message, metadata = {}) {
    super()
    this.message = message
    this.metadata = metadata
    this.code = PipelineException.CODE
    this.name = 'stonejs.pipeline'
  }
}
