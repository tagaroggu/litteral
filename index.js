import { render as vRender, ref, effect, stop, h, defineComponent, withDirectives, unref, toValue } from 'vue';
import { render as lRender, noChange } from 'lit-html';
import { AsyncDirective, directive, PartType } from 'lit-html/async-directive.js';
import { isTemplateResult } from 'lit-html/directive-helpers.js'

/** @type {Map<HTMLElement, import('vue').ReactiveEffectRunner>} */
const litHTMLWrapperMap = new Map();

/**
 * @type {import('vue').Directive}
 */
export const litHTMLWrapper = {
    beforeMount(el, binding) {
        litHTMLWrapperMap.set(el, effect(() => {
            let template = toValue(binding.value);
            if (Array.isArray(template)) {
                lRender(template[0](template[1]), el);
            } else /*if (typeof template === 'function') {
                lRender(template.value(), el);
            } else */{ // Remove a chunk just by letting toValue handle whether template is a function or a TemplateResult
                lRender(toValue(template.value), el);
            }
        }));
    },
    beforeUnmount(el) {
        stop(/** @type { import('vue').ReactiveEffectRunner } */(litHTMLWrapperMap.get(el)));
        litHTMLWrapperMap.delete(el);
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

/** @param {import('vue').Component & { render(arg0: any): import('lit-html').TemplateResult<1>, is?: string }} definition */
export function Facade(definition) {
    return Object.assign({}, definition, {
        /** @param {any} props */
        render(props) {
            return withDirectives(h(definition.is || 'div'), [[litHTMLWrapper, [definition.render, props]]])
        }
    });
}