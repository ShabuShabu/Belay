export class Response {
  static OK = 200
  static CREATED = 201
  static NO_CONTENT = 204
  static NOT_FOUND = 404
  static UNPROCESSABLE_ENTITY = 422

  constructor (response = {}) {
    this.response = response

    return new Proxy(this, {
      has (obj, key) {
        if (key in obj.response) {
          return true
        }

        return Reflect.has(obj, key)
      },

      get (obj, key, receiver) {
        if (key in obj.response) {
          return obj.response[key]
        }

        return Reflect.get(obj, key, receiver)
      }
    })
  }

  header (name) {
    return this.headers?.[name] ?? ''
  }

  idFromLocation () {
    return this.header('location').split('/').slice(-1)[0]
  }
}

export default Response
