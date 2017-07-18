import Vue from 'vue';
import { ModulVue } from '../../utils/vue/vue';
import { PluginObject } from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import WithRender from './select.html?style=./select.scss';
import { SELECT_NAME } from '../component-names';
import { normalizeString } from '../../utils/str/str';
import { KeyCode } from '../../utils/keycode/keycode';
import { InputState, InputStateMixin } from '../../mixins/input-state/input-state';
import { MediaQueries } from '../../mixins/media-queries/media-queries';

const UNDEFINED: string = 'undefined';
const PAGE_STEP: number = 4;
const POPPER_CLASS_NAME: string = '.m-popper__popper';

@WithRender
@Component({
    mixins: [
        InputState,
        MediaQueries
    ]
})
export class MSelect extends ModulVue implements InputStateMixin {

    @Prop({ default: () => ['element 1', 'element 2', 'element 3', 'element 4', 'element 5', 'element 6', 'element 7', 'element 8', 'element 9', 'element 10', 'element 11'] })
    public elements: any[];
    @Prop()
    public selectedElement: any;
    @Prop()
    public getTextElement: Function;
    @Prop()
    public label: string;
    @Prop({ default: false })
    public open: boolean;
    @Prop({ default: true })
    public sort: boolean;
    @Prop()
    public sortMethod: Function;
    @Prop({ default: false })
    public widthFromCss: boolean;
    @Prop({ default: false })
    public editable: boolean;
    @Prop()
    public defaultText: string;
    @Prop({ default: false })
    public defaultFirstElement: boolean;
    // @Prop({ default: false })
    // public name: boolean;
    // @Prop({ default: false })
    // public formName: boolean;

    public componentNameL: string = SELECT_NAME;

    public isDisabled: boolean;
    public hasError: boolean;
    public isValid: boolean;
    public isScreenMaxS: boolean;

    // Copy of prop
    public propSelectedElement: any;
    public propOpen: boolean = false;

    // Initialize data for v-model to work
    public textElement: string = '';

    private elementsSorted: Array<any>;

    private selectMaxHeight: number = 198;

    @Watch('elements')
    public elementChanged(value): void {
        this.prepareElements();
    }

    @Watch('selectedElement')
    public selectedElementChanged(value): void {
        this.propSelectedElement = value;
        this.textElement = this.getSelectedElementText();
    }

    @Watch('open')
    public openChanged(value): void {
        this.propOpen = value;
    }

    public get elementsCount(): number {
        return this.elementsSortedFiltered.length;
    }

    public get elementsSortedFiltered(): Array<any> {
        if ((this.textElement == '') || (this.textElement == this.getSelectedElementText())) {
            return this.elementsSorted;
        }

        let filteredElements: Array<any> = this.elementsSorted.filter((element) => {
            return normalizeString(this.getElementListText(element)).match(normalizeString(this.textElement));
        });

        return filteredElements;
    }

    public created() {
        // Copy of prop to avoid override on re-render
        this.propSelectedElement = this.selectedElement;

        // Run in created() to run before computed data
        this.prepareElements();
    }

    public mounted() {
        this.adjustWidth();
    }

    public onSelectElement($event, element: any): void {
        this.selectElement(element);
    }

    public getSelectedElementText(): string {
        let text: string = '';

        if (typeof this.propSelectedElement != UNDEFINED) {
            text = this.getElementListText(this.propSelectedElement);
        }

        return text;
    }

    public getElementListText(element: any): string {
        let text: string = '';

        if (typeof element == UNDEFINED) {
            text = '';
        } else if (this.getTextElement) {
            text = this.getTextElement(element);
        } else {
            text = String(element);
        }

        return text;
    }

    public adjustWidth(): void {
        if (!this.widthFromCss) {
            // Hidden element to calculate width
            let hiddenField: HTMLElement = this.$refs.mSelectCalculate as HTMLElement;
            // Input or a
            let valueField: Vue = this.$refs.mSelectValue as Vue;
            // List of elements
            let elements: HTMLElement = this.$refs.mSelectElements as HTMLElement;

            let width: number = 0;

            if (this.elements && this.elements.length > 0) {
                for (let element of this.elements) {
                    width = Math.max(width, this.getTextWidth(hiddenField, this.getElementListText(element)));
                }
            } else {
                width = this.getTextWidth(hiddenField, this.getSelectedElementText());
            }

            // Add 25px for scrollbar
            width = Math.ceil(width) + 25;
            // Set width to Input and List
            valueField.$el.style.width = width + 'px';
            this.$el.style.width = width + 'px';
            elements.style.width = width + 'px';

        } else {
            let parentElement: HTMLElement = this.$refs.mSelect as HTMLElement;
            let childElement: HTMLElement = this.$refs.mSelectElements as HTMLElement;
            childElement.style.width = parentElement.offsetWidth + 'px';
        }
    }

    public toggleSelect(value: boolean): void {
        this.propOpen = value;
        if (value) {
            this.$el.style.zIndex = '10';
        } else {
            this.$el.style.removeProperty('z-index');
        }
        Vue.nextTick(() => {
            if (value) {
                this.setSelectElementFocus();
            }
        });
        this.$emit('open', value);
    }

    public setSelectElementFocus(): void {
        if (!this.editable) {
            let element: HTMLElement = this.$el.querySelector(`.is-selected a`) as HTMLElement;
            if (element) {
                element.focus();
            }
        }
    }

    public keyupReference($event): void {
        if (!this.propOpen && ($event.keyCode == KeyCode.M_DOWN || $event.keyCode == KeyCode.M_SPACE)) {
            $event.preventDefault();
            (this.$refs.mSelectValue as Vue).$el.click();
        }

        if (this.propOpen && ($event.keyCode == KeyCode.M_DOWN || $event.keyCode == KeyCode.M_END || $event.keyCode == KeyCode.M_PAGE_DOWN)) {
            $event.preventDefault();
            let htmlElement: HTMLElement = this.$el.querySelector(`[data-index='0']`) as HTMLElement;
            if (htmlElement) {
                htmlElement.focus();
            }
        }
    }

    public keyupItem($event: KeyboardEvent, index: number): void {
        let selector: string = '';
        switch ($event.keyCode) {
            case KeyCode.M_UP:
                if (index == 0) {
                    selector = `[data-index='0']`;
                } else {
                    selector = `[data-index='${index - 1}']`;
                }
                break;
            case KeyCode.M_HOME:
                selector = `[data-index='0']`;
                break;
            case KeyCode.M_PAGE_UP:
                index -= PAGE_STEP;
                if (index < 0) {
                    index = 0;
                }
                selector = `[data-index='${index}']`;
                break;
            case KeyCode.M_DOWN:
                if (index == this.elementsSortedFiltered.length - 1) {
                    selector = `[data-index='${this.elementsSortedFiltered.length - 1}']`;
                } else {
                    selector = `[data-index='${index + 1}']`;
                }
                break;
            case KeyCode.M_END:
                selector = `[data-index='${this.elementsSortedFiltered.length - 1}']`;
                break;
            case KeyCode.M_PAGE_DOWN:
                index += PAGE_STEP;
                if (index >= this.elementsSortedFiltered.length) {
                    index = this.elementsSortedFiltered.length - 1;
                }
                selector = `[data-index='${index}']`;
                break;
            case KeyCode.M_ENTER:
            case KeyCode.M_RETURN:
                let element: HTMLElement = this.$el.querySelector(`[data-index='${index}']`) as HTMLElement;
                if (element) {
                    element.click();
                }
                return;
        }

        if (selector.trim() != '') {
            let element: HTMLElement = this.$el.querySelector(selector) as HTMLElement;
            if (element) {
                element.focus();
            }
        }
    }

    private selectElement(element: any): void {
        this.propSelectedElement = element;
        this.textElement = this.getSelectedElementText();
        this.$emit('elementSelected', this.propSelectedElement);
    }

    private getTextWidth(element: HTMLElement, text: string): number {
        element.innerHTML = text;
        return element.offsetWidth;
    }

    private prepareElements(): void {
        let elementsSorted: any[] = new Array();

        if (this.elements) {
            // Create a separe copy of the array, to prevent triggering infinite loop on watcher of elements
            elementsSorted = this.elements.slice(0);

            // Sorting options
            if (this.sort) {
                if (typeof this.sortMethod == UNDEFINED) {
                    // Default sort: Alphabetically
                    if (typeof this.getTextElement == UNDEFINED) {
                        elementsSorted = elementsSorted.sort((a, b) => a.localeCompare(b));
                    } else {
                        elementsSorted = elementsSorted.sort((a, b) => this.getElementListText(a).localeCompare(this.getElementListText(b)));
                    }
                } else {
                    elementsSorted = this.sortMethod(elementsSorted);
                }
            }

            // Default element
            if (this.defaultFirstElement && elementsSorted[0]) {
                this.selectElement(elementsSorted[0]);
            }
            this.textElement = this.getSelectedElementText();
        }

        this.elementsSorted = elementsSorted;
    }

    private focusOnResearchInput(): void {
        this.$refs.researchInput['focus']();
    }

    private get hasLabel(): boolean {
        return this.label == '' || this.label == undefined ? false : true;
    }

    private get researchText(): string {
        return this.$i18n.translate('m-select:research');
    }

    private animEnter(element: HTMLElement, done: any): void {
        let el: HTMLElement = element.querySelector(POPPER_CLASS_NAME) as HTMLElement;
        let height: number = el.clientHeight > this.selectMaxHeight ? this.selectMaxHeight : el.clientHeight;
        let transition: string = '0.3s max-height ease';
        el.style.transition = transition;
        el.style.webkitTransition = transition;
        el.style.overflowY = 'hidden';
        el.style.maxHeight = '0';
        setTimeout(() => {
            el.style.maxHeight = height + 'px';
            done();
        }, 0);
    }

    private animAfterEnter(element: HTMLElement): void {
        let el: HTMLElement = element.querySelector(POPPER_CLASS_NAME) as HTMLElement;
        setTimeout(() => {
            el.style.maxHeight = this.selectMaxHeight + 'px';
            el.style.overflowY = 'auto';
        }, 300);
    }

    private animLeave(element: HTMLElement, done: any): void {
        let el: HTMLElement = element.querySelector(POPPER_CLASS_NAME) as HTMLElement;
        let height: number = el.clientHeight;
        el.style.maxHeight = height + 'px';
        el.style.overflowY = 'hidden';
        el.style.maxHeight = '0';
        setTimeout(() => {
            el.style.maxHeight = 'none';
            done();
        }, 300);
    }

}

const SelectPlugin: PluginObject<any> = {
    install(v, options) {
        v.component(SELECT_NAME, MSelect);
    }
};

export default SelectPlugin;