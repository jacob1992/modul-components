import Vue from 'vue';
import { ModulVue } from '../../utils/vue/vue';
import { PluginObject } from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import WithRender from './dropdown.html?style=./dropdown.scss';
import { DROPDOWN_NAME } from '../component-names';
import { normalizeString } from '../../utils/str/str';
import { KeyCode } from '../../utils/keycode/keycode';
import { MDropDownItemInterface } from '../dropdown-item/dropdown-item';

const UNDEFINED: string = 'undefined';
const PAGE_STEP: number = 4;

export interface SelectedValue {
    key: string | undefined;
    value: any;
    label: string;
}

export interface MDropdownInterface extends Vue {
    selected: Array<SelectedValue>;
    currentElement: SelectedValue;
    addAction: boolean;
    nbItems: number;
    nbItemsVisible: number;
    multiple: boolean;
    getElement(key: string): Vue | undefined;
}

@WithRender
@Component
export class MDropdown extends ModulVue implements MDropdownInterface {

    @Prop()
    public label: string;
    @Prop()
    public defaultText: string;
    @Prop({ default: false })
    public open: boolean;
    @Prop({ default: false })
    public disabled: boolean;
    @Prop({ default: false })
    public editable: boolean;
    @Prop({ default: false })
    public multiple: boolean;
    @Prop({ default: '200px' })
    public width: string;
    @Prop({ default: false })
    public defaultFirstElement: boolean;
    @Prop()
    public textNoData: string;
    @Prop()
    public textNoMatch: string;

    public componentName: string = DROPDOWN_NAME;

    public selected: Array<SelectedValue> = [];
    public currentElement: SelectedValue = {'key': undefined, 'value': undefined, 'label': ''};
    public addAction: true;
    public nbItems: number = 0;
    public nbItemsVisible: number = 0;
    public selectedText: string = '';

    // Copy of prop
    public propOpen: boolean = false;

    public getElement(key: string): Vue | undefined {
        let element: Vue | undefined;

        for (let child of this.$children) {
            if (child.$options.name == 'MPopper' && child.$el.nodeName != '#comment') {
                element = this.recursiveGetElement(key, child);
                break;
            }
        }
        return element;
    }

    // private created() {
    // }

    private mounted() {
        // Obtenir le premier dropdown-item
        if (this.defaultFirstElement && !this.multiple && !this.disabled) {
            let firstElement: Vue | undefined = this.getFirstElement();
            if (firstElement) {

                (firstElement as MDropDownItemInterface).onSelectElement();
                // this.selected.push(this.currentElement);
                // this.addAction = true;
            }
        }
    }

    @Watch('selected')
    private selectedChanged(value): void {
        this.$emit('change', this.selected, this.addAction);
    }

    @Watch('currentElement')
    private currentElementChanged(value): void {
        this.selectedText = '';
        for (let item of this.selected ) {
            if (this.selectedText != '') {
                this.selectedText += ', ';
            }
            this.selectedText += item.label;
        }
        this.$emit('elementSelected', this.currentElement, this.addAction);
    }

    @Watch('open')
    private openChanged(value): void {
        this.propOpen = value;
    }

    @Watch('isScreenMaxS')
    private isScreenMaxSChanged(value: boolean): void {
        if (!value) {
            this.$nextTick(() => {
                console.log('YOOOOO');
                // this.adjustWidth();
            });
        }
    }

    // private adjustWidth(): void {
    //     if (!this.widthFromCss) {
    //         // Hidden element to calculate width
    //         let hiddenField: HTMLElement = this.$refs.mDropdownCalculate as HTMLElement;
    //         // Input or a
    //         let valueField: Vue = this.$refs.mDropdownValue as Vue;
    //         // List of elements
    //         let elements: HTMLElement = this.$refs.mDropdownElements as HTMLElement;

    //         let width: number = 0;

    //         if (elements && elements.children.length > 0) {
    //             for (let i = 0; i < elements.children.length; i++) {

    //                 if ((elements.children[i].children.length > 0) &&
    //                     (elements.children[i].children.item(0).classList.contains('m-dropdown-group'))) {

    //                     let elementsChild: HTMLElement = elements.children[i] as HTMLElement;
    //                     for (let j = 0; j < elementsChild.children.length; j++) {
    //                         width = Math.max(width, this.getElementWidth(hiddenField, elementsChild.children[j] as HTMLElement));
    //                     }
    //                 } else {
    //                     width = Math.max(width, this.getElementWidth(hiddenField, elements.children[i] as HTMLElement));
    //                 }
    //             }
    //         } else {
    //             // width = this.getElementWidth(hiddenField, this.getSelectedElementText());
    //         }

    //         // Add 25px for scrollbar
    //         width = Math.ceil(width) + 25;
    //         // Set width to Input and List
    //         valueField.$el.style.width = width + 'px';
    //         this.$el.style.width = width + 'px';
    //         elements.style.width = width + 'px';

    //     } else {
    //         let parentElement: HTMLElement = this.$refs.mDropdown as HTMLElement;
    //         let childElement: HTMLElement = this.$refs.mDropdownElements as HTMLElement;
    //         childElement.style.width = parentElement.offsetWidth + 'px';
    //     }
    // }

    // private getElementWidth(elementContainer: HTMLElement, elementText: HTMLElement): number {
    //     // console.log(elementContainer);
    //     // console.log(elementText);
    //     elementContainer.innerHTML = elementText.innerText;
    //     let width: number = elementContainer.offsetWidth;
    //     // elementContainer.removeChild(elementText);
    //     // if (element.$el.)
    //     // elementContainer.innerHTML = element;
    //     return width;
    // }

    private get propEditable(): boolean {
        return this.editable && this.selected.length == 0;
    }

    private get propTextNoData(): string {
        if (this.textNoData) {
            return this.textNoData;
        } else {
            return this.$i18n.translate('m-dropdown:no-data');
        }
    }

    private get propTextNoMatch(): string {
        if (this.textNoMatch) {
            return this.textNoMatch;
        } else {
            return this.$i18n.translate('m-dropdown:no-result');
        }
    }

    private recursiveGetElement(key: string, node: Vue): Vue | undefined {
        let element: Vue | undefined;

        for (let child of node.$children) {
            if (child.$options.name == 'MDropdownGroup') {
                element = this.recursiveGetElement(key, child);
                if (element) {
                    return element;
                }
            } else if (child.$options.name == 'MDropdownItem' && child.$el.nodeName != '#comment' && child.$el.attributes['data-key'].value == key) {
                return child;
            }
        }
        return element;
    }

    private getFirstElement(): Vue | undefined {
        let firstElement: Vue | undefined;

        for (let child of this.$children) {
            if (child.$options.name == 'MPopper' && child.$el.nodeName != '#comment') {
                firstElement = this.recursiveGetFirstElement(child);
                break;
            }
        }
        return firstElement;
    }

    private recursiveGetFirstElement(node: Vue): Vue | undefined {
        let firstElement: Vue | undefined;

        for (let child of node.$children) {
            if (child.$options.name == 'MDropdownGroup') {
                firstElement = this.recursiveGetFirstElement(child);
                if (firstElement) {
                    return firstElement;
                }
            } else if (child.$options.name == 'MDropdownItem' && child.$el.nodeName != '#comment') {
                return child;
            }
        }
        return firstElement;
    }

    private filterDropdown(text: string): void {
        if (this.selected.length == 0) {
            for (let child of this.$children) {
                if (child.$options.name == 'MPopper' && child.$el.nodeName != '#comment') {
                    this.propagateTextFilter(normalizeString(text.trim()), child);
                }
            }
        }
    }

    private propagateTextFilter(text: string, node: Vue): void {
        for (let child of node.$children) {
            if (child.$options.name == 'MDropdownGroup') {
                this.propagateTextFilter(text, child);
            } else if (child.$options.name == 'MDropdownItem' && child.$el.nodeName != '#comment') {
                (child as MDropDownItemInterface).filter = text;
            }
        }
    }

    private toggleDropdown(value: boolean): void {
        Vue.nextTick(() => {
            this.propOpen = value;
            if (value) {
                this.$el.style.zIndex = '10';
                this.setDropdownElementFocus();
            } else {
                this.$el.style.removeProperty('z-index');
            }
            this.$emit('open', value);
        });
    }

    private setDropdownElementFocus(): void {
        // if (!this.as<DropdownTemplateMixin>().editable) {
        //     let element: HTMLElement = this.$el.querySelector(`.is-selected a`) as HTMLElement;
        //     if (element) {
        //         element.focus();
        //     }
        // }
    }

    private keyupReference($event): void {
        if (!this.propOpen && ($event.keyCode == KeyCode.M_DOWN || $event.keyCode == KeyCode.M_SPACE)) {
            $event.preventDefault();
            (this.$refs.mDropdownValue as Vue).$el.click();
        }

        if (this.propOpen && ($event.keyCode == KeyCode.M_DOWN || $event.keyCode == KeyCode.M_END || $event.keyCode == KeyCode.M_PAGE_DOWN)) {
            $event.preventDefault();
            let htmlElement: HTMLElement = this.$el.querySelector(`[data-index='0']`) as HTMLElement;
            if (htmlElement) {
                htmlElement.focus();
            }
        }
    }

    private keyupItem($event: KeyboardEvent, index: number): void {
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
            // case KeyCode.M_DOWN:
            //     if (index == this.elementsSortedFiltered.length - 1) {
            //         selector = `[data-index='${this.elementsSortedFiltered.length - 1}']`;
            //     } else {
            //         selector = `[data-index='${index + 1}']`;
            //     }
            //     break;
            // case KeyCode.M_END:
            //     selector = `[data-index='${this.elementsSortedFiltered.length - 1}']`;
            //     break;
            // case KeyCode.M_PAGE_DOWN:
            //     index += PAGE_STEP;
            //     if (index >= this.elementsSortedFiltered.length) {
            //         index = this.elementsSortedFiltered.length - 1;
            //     }
            //     selector = `[data-index='${index}']`;
            //     break;
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
}

const DropdownPlugin: PluginObject<any> = {
    install(v, options) {
        v.component(DROPDOWN_NAME, MDropdown);
    }
};

export default DropdownPlugin;
