export default class EventBus {
  /**
   * @param {object} bus
   */
  constructor (bus) {
    this.bus = bus
  }

  /**
   * Fire an event
   * @param name
   * @param payload
   */
  fire (name, payload) {
    this.bus.$emit(name, payload)
  }
}
