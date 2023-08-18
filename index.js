import { render as vRender, ref, effect, stop, h, defineComponent, withDirectives } from 'vue';
import { render as lRender, noChange } from 'lit-html';
import { AsyncDirective, directive, PartType } from 'lit-html/async-directive.js';
import { isTemplateResult } from 'lit-html/directive-helpers.js'

/**
 * @type {import('vue').FunctionDirective}
 */
export const litHTMLWrapper = (el, binding) => {
    if (Array.isArray(binding.value)) {
        lRender(binding.value[0](binding.value[1]), el);
    } else if (typeof binding.value === 'function') {
        lRender(binding.value(), el);
    } else {
        lRender(binding.value, el);
    }
}

export const LitHTMLWrapperComponent = defineComponent({
    props: {
        template: {
            validator(value) {
                return (typeof value === 'object'
                    && Array.isArray(value)
                    && typeof value[0] === 'function') || 
                (typeof value === 'function') ||
                (isTemplateResult(value));
            },
            required: true
        },
        is: {
            type: String,
            default: 'div'
        }
    },
    setup(props, ctx) {
        return () => withDirectives(h(props.is), [[litHTMLWrapper, typeof props.template === 'function' ? [props.template, ctx.attrs] : props.template]])
    }
});

export class VueWrapper extends AsyncDirective {
    /** @type {import('vue').ReactiveEffectRunner | undefined} */ effect;
    /** @type {import('vue').Ref<any>} */ data;
    // @ts-ignore Defined during update method
    /** @type {import('vue').Component} */ component;
    // @ts-ignore Defined during update method
    /** @type {import('lit-html').ElementPart} */ part;

    /** @param {import('lit-html/async-directive.js').PartInfo} partInfo */
    constructor(partInfo) {
        if (partInfo.type !== PartType.ELEMENT) throw new Error('VueWrapper directive must be used in Element position.');
        super(partInfo);

        this.data = ref();
    }

    /**
     * 
     * @param {import('lit-html').ElementPart} part 
     * @param {[import('vue').Component, any]} param1 
     */
    update(part, [component, data=undefined]) {
        this.part = part;
        this.component = component;
        this.data.value = data;

        this.createEffect();

        return this.render(component, data);
    }

    /**
     * 
     * @param {import('vue').Component} _component 
     * @param {any} _data 
     */
    render(_component, _data=undefined) {
        return noChange;
    }

    disconnected() {
        if (this.effect) stop(this.effect);
        this.effect = undefined;
    }

    reconnected() {
        this.createEffect();
    }

    createEffect() {
        if (!this.effect) {
            this.effect = effect(() => {
                vRender(h(this.component, this.data.value), this.part.element);
            })
        }
    }
}

export const vueWrapper = directive(VueWrapper);