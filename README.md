<p align="center">
    <img alt="" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMC8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvVFIvMjAwMS9SRUMtU1ZHLTIwMDEwOTA0L0RURC9zdmcxMC5kdGQnPjxzdmcgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMjQgMjQiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGNpcmNsZSBjeD0iMTEiIGN5PSI0IiByPSIyIi8+PHBvbHlnb24gcG9pbnRzPSIxMy45LDggMTQuMywxMS40IDEwLjUsMTMuMiA5LjQsOS43ICIvPjxwYXRoIGQ9Ik0xNSw5LjVjMS4xLDAsNS41LTAuNSw1LjUtNy41IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIvPjxsaW5lIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiB4MT0iMTQuNSIgeDI9IjE0LjUiIHkxPSIyMiIgeTI9IjE0Ii8+PHBhdGggZD0iTTQuMyw1LjhjMCwwLDAuOCwxLjMsMS41LDIuNWMwLjcsMS4xLDIsMS41LDMuMiwxICBsNS43LTIuNGMwLjctMC4zLDEuMy0wLjksMS41LTEuN0MxNi42LDQsMTcsMi40LDE3LDIuNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik04LjcsMTguMWMwLjItMS4xLDEtMi4xLDItMi42bDQuNi0yLjMgIGMwLjktMC40LDEuOSwwLjEsMiwxLjFsMC41LDQuNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS13aWR0aD0iMiIvPjxwb2x5Z29uIHBvaW50cz0iOC45LDIyIDkuNywxOC4zIDcuNywxNy45IDYuOCwyMiAiLz48L3N2Zz4=" />
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