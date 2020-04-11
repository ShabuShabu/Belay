<p align="center">
    <img alt="" src="https://github.com/boris-glumpler/Belay/blob/develop/belay.png"/>
</p>

# Belay

Active-record(ish) implementation for a [JSON:API](https://jsonapi.org/)

## Installation

```
$ yarn add @shabushabu/belay
```

## Vue.js

Set it up in an entry file:

```js
import Vue from 'vue'
import axios from 'axios'
import { Model, Response, EventBus } from '@shabushabu/belay'
import { Post, Category, Tag } from './Hierarchies'

axios.interceptors.response.use(
  data => new Response(data),
  error => Promise.reject(error)
)

Model.setAxios(axios)
Model.setEventBus(new EventBus(new Vue()))
Model.setTypeMap({ 
  posts: Post, 
  categories: Category, 
  tags: Tag 
})
```

### Nuxt.js

Create a plugin (plugins/belay.js):

```js
import Vue from 'vue'
import { Post, Category, Tag } from './Hierarchies'
import { Model, Response, EventBus } from '@shabushabu/belay'

export default ({ $axios, store }) => {
  $axios.onResponse(data => new Response(data))
  store.$events = new Vue()

  Model.setAxios($axios)
  Model.setEventBus(new EventBus(store.$events))
  Model.setTypeMap({ 
    posts: Post, 
    categories: Category, 
    tags: Tag 
  })
}
```

## Usage


## Credits

- [Robson Tenório](https://github.com/robsontenorio/vue-api-query) for the builder, the parser and some of the model
- [Ivan Boyko](https://www.iconfinder.com/visualpharm) for the belay icon