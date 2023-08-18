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

This currently is a simple working version. A facade component factory function that wraps a function that returns a lit-html template is planned. Support for passing around children is also planned.