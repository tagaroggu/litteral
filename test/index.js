import { render as vRender, h, ref, withDirectives, createApp, effect } from 'vue';
import { html } from 'lit-html';
import { LitHTMLWrapperComponent, vueWrapper, Facade } from './litteral.js';
// @ts-ignore
const facadeComponent = Facade({
    props: ['count'],
    render(props) {
        return html`<h4>Hello from lit-html inside vue inside lit-html inside vue. ${props.count}</h4>`;
    },
})

const vueComponent = {
    props: ['count'],
    /**
     * @param {{ count: number }} props
     */ 
    render(props) {
        return [h('h3', ['Hello from vue inside lit-html inside vue. ', props.count]), h(facadeComponent, { count: props.count })];
    }
};

/**
 * 
 * @param {{ count: import('vue').Ref<number> }} param0 
 * @returns 
 */
const litHTMLComponent = ({ count }) => html`<h2>Hello from lit-html inside vue. ${count.value}</h2><div ${vueWrapper(vueComponent, { count: count })}></div>`;

const vueApp = {
    setup() {
        const count = ref(0);
        return () => [h('h1', 'Hello from vue.'), h('button', { onClick() { count.value++ } }, count.value), h(LitHTMLWrapperComponent, { template: litHTMLComponent, count: count })];
    }
};

vRender(h(vueApp), /** @type {Element} */(document.querySelector('#app')));
