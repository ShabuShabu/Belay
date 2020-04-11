<p align="center">
    <svg height="50" width="50" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h50v50H0z"/><path d="M27 5.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"/><path d="M39.707 36.83s-.859-11.768-1.011-12.829-1.191-1.804-2.172-1.667c-1.122.158-2.424.808-6.031 2.853l.937-9.838s5.812-11.164 6.047-11.794c.356-.97.57-1.855-.491-2.387-1.227-.613-2.142 1.053-2.142 1.053L28 13s-4.713.476-6.355.536c-.864.031-1.536.322-2.608.879-.951.495-4.304 2.36-4.304 2.36s-4.411-5.039-5.053-5.882c-.804-1.055-1.722-.933-2.356-.5s-.224 1.816.321 2.786c.593 1.055 3.718 5.445 4.785 6.714 1.229 1.462 1.827 1.232 2.75.857s4.571-1.679 4.571-1.679l1.157 9.839c-.061.145-5.647 13.328-6.859 16.658-.404 1.111-.202 2.525.924 3.061 1.684.799 3.065-.383 3.672-1.646.841-1.752 7.48-13.232 7.48-13.232 3 .375 4.328-.984 5.167-1.502.839-.519 3.566-2.842 3.566-2.842l.808 7.677s.405 2.879 2.273 2.525 1.768-2.779 1.768-2.779zM21.019 28.244C33.394 28.244 45 11.883 45 1M29 48l.068-14" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"/></svg>
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