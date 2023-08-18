import { render as vRender, h } from 'vue';
import { html } from 'lit-html';
import { LitHTMLWrapperComponent, vueWrapper } from './litteral.js';

const vueComponent = {
    render() {
        return h('h3', 'Hello from vue inside lit-html inside vue.');
    }
};

const litHTMLComponent = html`<h2>Hello from lit-html inside vue.</h2><div ${vueWrapper(vueComponent)}></div>`;

const vueApp = {
    render() {
        return [h('h1', 'Hello from vue.'), h(LitHTMLWrapperComponent, { template: litHTMLComponent })];
    }
};

vRender(h(vueApp), /** @type {Element} */(document.querySelector('#app')));