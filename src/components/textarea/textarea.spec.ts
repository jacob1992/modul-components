import { mount } from '@vue/test-utils';
import Vue from 'vue';

import { renderComponent } from '../../../tests/helpers/render';
import TextareaPlugin from '../../components/textarea/textarea';
import { MTextarea } from './textarea';

describe('MTextArea', () => {
    beforeEach(() => {
        Vue.use(TextareaPlugin);
    });

    it('should render correctly', () => {
        const txtarea = mount(MTextarea);

        return expect(renderComponent(txtarea.vm)).resolves.toMatchSnapshot();
    });

    describe('max-length', () => {
        it('should render correctly state when text length is lesser than max length', () => {
            const txtarea = mount(MTextarea, {
                propsData: {
                    maxLength: 8,
                    value: '1'
                }
            });

            return expect(
                renderComponent(txtarea.vm)
            ).resolves.toMatchSnapshot();
        });

        it('should render invalid state when text length is greater than max length', () => {
            const txtarea = mount(MTextarea, {
                propsData: {
                    maxLength: 8,
                    value: '123456789'
                }
            });

            return expect(
                renderComponent(txtarea.vm)
            ).resolves.toMatchSnapshot();
        });
    });
});
