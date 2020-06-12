<p align="center">
    <img alt="" src="https://github.com/ShabuShabu/Belay/blob/develop/belay.png"/>
</p>

<h1 align="center">Belay</h1>

<p align="center">
    <a href="https://github.com/ShabuShabu/Belay/actions?query=workflow%3A%22Run+Jest+tests%22">
        <img alt="Jest Tests" src="https://github.com/ShabuShabu/Belay/workflows/Run%20Jest%20tests/badge.svg"/>
    </a>
    <a href="https://github.com/ShabuShabu/Belay/blob/develop/LICENSE.md">
        <img alt="GitHub license" src="https://img.shields.io/github/license/ShabuShabu/Belay">
    </a>
    <a href="https://github.com/ShabuShabu/Belay/tags">
        <img alt="GitHub license" src="https://img.shields.io/github/v/tag/ShabuShabu/Belay.svg?sort=semver">
    </a>
</p>

An active-record(ish) implementation for a [JSON:API](https://jsonapi.org/) that gets you safely to the top

## ToDo

- Add http tests for the builder
- Add tests for scoped model events and `boot` method
- Add automatic hydration for collections/paginators to mixin
- Non-existing relationships will have to be saved before the model
- World domination

## Installation

:bangbang: Well, this will work once Belay has been published to NPM, but this early in the dev process I'll just not bother and use `yarn link`.

```
$ yarn add @shabushabu/belay
```

In `nuxt.config.js` (making sure that the module is above `@nuxtjs/axios`):

```js
export default {
  // ...

  modules: [
    // ...
    '@shabushabu/belay',
    '@nuxtjs/axios',
    // ...
  ],
  // default values
  belay: {
    useStore: true,
    namespace: 'belay',
    useMixinGlobally: false,
    disableStoreEvents: false,
    autoSaveRelationships: true,
    hierarchiesLocation: '~/models/Hierarchies'
  },
  // ...
}
```

## Usage

## Single Table Inheritance

Belay supports [STI](https://en.wikipedia.org/wiki/Single_Table_Inheritance), so something like the following is possible:

```js
export class Vehicle extends Model {
  static subTypeField () {
    return 'data.attributes.subType'
  }

  static children () {
    return {
        car: Car,
        bus: Bus
    }
  }
}

export class Car extends Vehicle {}

export class Bus extends Vehicle {}
```

The above can lead to circular imports, though, so it's necessary to create a `Hierarchies.js` file.

```js
export * from './Vehicle'
export * from './Car'
export * from './Bus'
```

We then use this file to import our models, thus avoiding the issue:

```js
import { Car, Bus } from './Hierarchies'

export class Vehicle extends Model {
  static children () {
    return {
        car: Car,
        bus: Bus
    }
  }
}
```

Here's [a great article by Michel Weststrate
](https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de) explaining things more in-depth

## Schemas

Belay uses [JSON Schema](https://json-schema.org/) for some basic validation on the model. It will somewhat intelligently merge the [JSON:API schema](http://jsonapi.org/schema) with whatever you hand to it.

`./models/schemas/category.json`

```json
{
  "definitions": {
    "attributes": {
      "properties": {
        "title": {
          "type": "string"
        },
        "createdAt": {
          "type": ["string", "null"],
          "format": "date-time"
        },
        "updatedAt": {
          "type": ["string", "null"],
          "format": "date-time"
        }
      }
    }
  }
}
```

`./models/Category.js`

```js
import { Model } from '@shabushabu/belay'
import schema from './schemas/category'

export class Category extends Model {
  constructor (resource) {
    super(resource, schema)
  }
}
```

## Model

Here is an example of a model:

```js
import { Model, DateCast } from '@shabushabu/belay'
import { Media, User, Category } from './Hierarchies'
import schema from './schemas/page'

export class Page extends Model {
  constructor (resource) {
    super(resource, schema)
  }

  static jsonApiType () {
    return 'pages'
  }

  get attributes () {
    return {
      title: '',
      content: '',
      createdAt: null,
      updatedAt: null,
      deletedAt: null
    }
  }

  get casts () {
    return {
      createdAt: new DateCast(),
      updatedAt: new DateCast(),
      deletedAt: new DateCast()
    }
  }

  get relationships () {
    return {
      user: this.hasOne(User, 'user').readOnly(),
      category: this.hasOne(Category, 'categories'),
      media: this.hasOne(Media, 'media')
    }
  }
}

export default Page
```

`jsonApiType` must be set. This would be the `data.type` field on your API response. Belay also assumes that this is the base URI for HTTP requests (can be changed by overriding the `baseUri` getter).

`attributes` lets us define any attributes and their default values.

`casts` allows us to mutate any attributes. By default Belay ships with a `DateCast` and a `CollectionCast`, but custom casts can also be created, for example for a money value object.

And finally, `relationships` lets us define `HasOne` and `HasMany` relationships. Belay also includes a flag to auto-update any relationships when the model is saved. This behaviour can be completely deactivated via `Model.autoSaveRelationships(false)`, but can also be set individually via the `readOnly` method on the relation.

### Creating

There are two ways to instantiate a new Belay model. By passing in nothing, aka undefined, or an object of attributes that is invalid JSON:API.

```js
const page = new Page({
    title: 'Contact Us'
})

page.content = "Go on, we don't bite"

const response = await page.create()
```

### Updating

When a valid JSON:API object is passed into a Belay model, then it assumes it came from the API and sets its flags accordingly. Any relationships within `includes` will also be hydrated, e.g. a `user` relationship will turn into a `User` model.

```js
const validJsonApiResponse = { data: ... }
const page = new Page(validJsonApiResponse)

page.content = "Go on, we don't bite"

const response = await page.update()
```

### Upserting

Not sure why you wouldn't know where your data comes from, but the `createOrUpdate` method got your back!

```js
const objectOfUnknownPedigree = { ... }
const page = new Page(objectOfUnknownPedigree)

page.content = "Go on, we don't bite"

const response = await page.createOrUpdate()
```

### Deleting

If the model attributes contain a `deletedAt` field and `deletedAt` is null, then Belay will set it to the current date, indicating that the model has been soft deleted.
If the `deletedAt` field is not null, however, then Belay will set the `wasDestroyed` flag to true.

The `deletedAt` attribute can be configured via the `trashedAttribute` Model option or by overriding the `trashedAttribute` getter.

```js
const page = new Page({ data: ... })

const response = await page.delete()
```

### Model Attributes & Relationships

Belay makes quite heavy use of [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).
These allow us to do some nifty stuff with attributes and relationships without having to explicitly create this functionality on the model.
The idea behind Belay is that it always keeps an up-to-date reference of a JSON:API resource in the background. So, when we update a model property Belay actually sets the value of that property on that JSON:API resource.

```js
const page = new Page()

page.title = 'Some title'
page.content = 'Lorem what?'
page.category = new Category({ name: 'Boring' })
```

The proxy first checks if the property is contained within the `attributes` of the model. If there isn't an attribute with the given key, then Belay checks the relationships.

So, the above example would actually give us something like the following JSON:API representation:

```json
{
    "data": {
        "id": "904754f0-7faa-4872-b7b8-2e2556d7a7bc",
        "type": "pages",
        "attributes": {
            "title": "Some title",
            "content": "Lorem what?",
            "createdAt": null,
            "updatedAt": null,
            "deletedAt": null
        },
        "relationships": {
            "category": {
                "data": {
                    "type": "categories",
                    "id": "9041eabb-932a-4d47-a767-6c799873354a"
                }
            }
        }
    }
}
```

Additionally, it's also possible to remove attributes and relationships like so:

```js
const page = new Page()

delete page.title
delete page.category
```

Relationships, especially `HasMany`, can also be set and removed another way:

```js
const page = new Page()

// actual method on the model
page.attach('media', media)
// handled by the proxy
page.attachMedia(media)

// actual method on the model
page.detach('media', media)
// handled by the proxy
page.detachMedia(media)
```

### Events

Belay fires off a variety of events for most of its operations. Here's a full list:

- **`Model.SAVED` / `savsed`**
    * Fires when a model was created and updated
    * Payload: `{ response, model }`
- **`Model.CREATED` / `created`**
    * Fires when a model was created
    * Payload: `{ response, model }`
- **`Model.UPDATED` / `updated`**
    * Fires when a model was updated
    * Payload: `{ response, model }`
- **`Model.TRASHED` / `trashed`**
    * Fires when a model was trashed
    * Payload: `{ response, model }`
- **`Model.DESTROYED` / `destroyed`**
    * Fires when a model was destroyed
    * Payload: `{ response, model }`
- **`Model.FETCHED` / `fetched`**
    * Fires when a model was retrieved from the API
    * Payload: `{ response, model }`
- **`Model.ATTACHED` / `attached`**
    * Fires when a relationship was attached to a model
    * Payload: `{ key, model, attached }`
- **`Model.DETACHED` / `detached`**
    * Fires when a relationship was detached to a model
    * Payload: `{ key, model, detached }`
- **`Model.COLLECTED` / `collected`**
    * Fires when a collection was retrieved
    * Payload: `{ response, collection, model }`
- **`Model.RELATIONS_SAVED` / `relationsSaved`**
    * Fires when relationships have been auto-saved
    * Payload: `{ responses, model }`
- **`Model.RELATIONSHIP_SET` / `relationshipSet`**
    * Fires when a relationship was set
    * Payload: `{ key, model, attached }`
- **`Model.RELATIONSHIP_REMOVED` / `relationshipRemoved`**
    * Fires when a relationship was removed
    * Payload: `{ key, model }`
- **`Model.ATTRIBUTE_SET` / `attributeSet`**
    * Fires when an attribute was set
    * Payload: `{ key, model }`
- **`Model.ATTRIBUTE_REMOVED` / `attributeRemoved`**
    * Fires when an attribute was removed
    * Payload: `{ key, model }`

Here are some event examples, that all do the same thing:

```js
Model.on(Model.SAVED, (payload) => { ... })
Model.onSaved((payload) => { ... })
Model.on([Model.CREATED, Model.UPDATED], (payload) => { ... })
```

Events can also be scoped to a specific model:

```js
// Prefixing the event with the model type
Model.on('pages.saved', (payload) => { ... })

// Setting the event handler on a specific model
Page.on('saved', (payload) => { ... })
Page.onSaved((payload) => { ... })
```

And finally, when setting up your models, you can just override the `boot` method to set up your scoped events:

```js
import { Model } from '@shabushabu/belay'

export class Page extends Model {
  ...

  static boot () {
    this.onSaved((payload) => { ... })
  }

  ...
}
```

## Builder

Any model can also be used statically. Under the hood `null` is passed to the model, indicating that we want to run a query.

```js
// get all pages
const response = await Page.get()

// get a single page
const page = await Page.find('904754f0-7faa-4872-b7b8-2e2556d7a7bc')
```

Query parameters can also be passed to the builder:

```js
// GET /pages?filter[title]=Cool&include=user&limit=10

const response = await Page.where('title', 'Cool').include('user').limit(10).get()
```

## Mixin

Belay ships with a mixin that can be used to automatically re-hydrate the models after getting them with `fetch`.
By default, it isn't enabled globally, but there is an option to do just that. Activate it at your own peril, tho ;)
Otherwise, you can just add it to the components that need it.

The mixin expects you to follow a certain convention. This is how you declare your models in your components:

```js
data: () => ({
  pageModel: null,
  categoriesCollection: null,
  tagsPaginator: null
})
```

Basically, it's however you want to name the prop that holds your model, suffixed by `Model`, `Collection` or `Paginator`.
In the case above, the model will then be available as `this.page`, the collection as `this.categories` and the paginator as `this.tags`. 
It is your responsibility to ensure that the property does not clash with another prop.

## :bangbang: Caveats

This package uses [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) quite a bit, so if you only target modern browsers, like  Firefox, Chrome, Safari 10+ and Edge, then you're golden. Not so much if you have to support old and tired browsers like IE. There is a [polyfill](https://github.com/GoogleChrome/proxy-polyfill), but use at your own risk.

Belay is still young and while it is tested, there will probs be bugs. I will try to iron them out as I find them, but until there's a v1 release, expect things to go :boom:. Oh, and one more thing, while this package is intended to work perfectly with Nuxt and Vue, I haven't actually gotten round to testing Belay out in a real app yet. Might have to wait for Vue 3 :grimacing:

## Tests

Do read the tests themselves to find out more about Belay!

```
$ yarn run test
```

## Credits

- [All Contributors](../../contributors)
- [BTT](https://boris.travelled.today), aka **Boris Travelled Today**, where Belay was extracted from
- [Robson Tenório](https://github.com/robsontenorio/vue-api-query) for the builder, the parser and some of the model
- [Ivan Boyko](https://www.iconfinder.com/visualpharm) [[cc]](https://creativecommons.org/licenses/by/3.0/) for the belay icon

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover any security related issues, please email boris@shabushabu.eu instead of using the issue tracker.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
