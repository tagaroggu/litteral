# Litteral

Use lit-html templates in vue and vice-versa. See test/index.js for details on usage. For `litHTMLWrapper`, it can be used in three different ways.
1. Use a template directly
```js
[litHTMLWrapper, html`<h1>Hello, world</h1>`];
```
2. Use a function that returns a template
```js
[litHTMLWrapper, () => html`<h1>Hello, world</h1>`]
```
3. Use an array to pass values to a function that returns a template
```js
[litHTMLWrapper, [({ name }) => html`<h1>Hello, ${name}</h1>`, { name: 'Alice' }]]
```

For using `litHTMLWrapper` in SFCs, prefix the name with `v` when importing.
```vue
<script setup>
import { litHTMLWrapper as vWrapper } from 'litteral'; // Or some other name.
import litTemplate from 'a-different-file.js';
</script>

<template>
    <div vWrapper="litTemplate"></div>
</template>
```

With `litHTMLWrapperComponent`:
```vue
<script setup>
    import { litHTMLWrapperComponent } from 'litteral';
    import content from './content.js';
</script>
<template>
    <!-- Optional is prop to control what element to create to render into. Defaults to div -->
    <litHTMLWrapperComponent is="main" :template="content" />
</template>
```

## Facade
The exported `Facade` function takes a component definition that is the same as the object-based one used by Vue, except with 2 differences:
1. Requirement to use `render` method, not to return render function from `setup`,
2. Return a lit-html template from `render`, and
3. Optionally, set the `is` prop to change what element is created to render into.

The `Facade` function simply wraps around `render` and returns a component definition object that is usable by vue.

This currently is a simple working version.

```js
// litComponent.js
import { Facade } from 'litteral';
import { html } from 'lit-html';

export const litComponent = Facade({
    props: {
        name: {
            type: String,
            default: 'World'
        }
    },
    render(data) {
        return html`<h1>Hello, ${data.name}!</h1>`
    }
})

// vueComponent.js
import { h } from 'vue';
import { litComponent } from './litComponent.js';

export const vueComponent = {
    render() {
        return h(Facade, { name: 'Alice' })
    }
}
```