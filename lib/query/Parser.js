import qs from 'qs'

export class Parser {
  constructor (builder) {
    this.builder = builder
    this.uri = ''
  }

  query () {
    return this.includes()
      .appends()
      .fields()
      .filters()
      .sorts()
      .page()
      .limit().uri
  }

  hasIncludes () {
    return this.builder.includes.length > 0
  }

  hasAppends () {
    return this.builder.appends.length > 0
  }

  hasFields () {
    return Object.keys(this.builder.fields).length > 0
  }

  hasFilters () {
    return Object.keys(this.builder.filters).length > 0
  }

  hasSorts () {
    return this.builder.sorts.length > 0
  }

  hasPage () {
    return this.builder.pageValue !== null
  }

  hasLimit () {
    return this.builder.limitValue !== null
  }

  stringify (payload) {
    return qs.stringify(payload, { encode: false })
  }

  prepend (value) {
    return this.uri === '' ? `?${value}` : `&${value}`
  }

  includes () {
    if (this.hasIncludes()) {
      this.uri += this.prepend(`include=${this.builder.includes}`)
    }

    return this
  }

  appends () {
    if (this.hasAppends()) {
      this.uri += this.prepend(`append=${this.builder.appends}`)
    }

    return this
  }

  fields () {
    if (this.hasFields()) {
      this.uri += this.prepend(this.stringify({ fields: this.builder.fields }))
    }

    return this
  }

  filters () {
    if (this.hasFilters()) {
      this.uri += this.prepend(this.stringify({ filter: this.builder.filters }))
    }

    return this
  }

  sorts () {
    if (this.hasSorts()) {
      this.uri += this.prepend(`sort=${this.builder.sorts}`)
    }

    return this
  }

  page () {
    if (this.hasPage()) {
      this.uri += this.prepend(`page=${this.builder.pageValue}`)
    }

    return this
  }

  limit () {
    if (this.hasLimit()) {
      this.uri += this.prepend(`limit=${this.builder.limitValue}`)
    }

    return this
  }
}

export default Parser
