import { PluginObject } from 'vue';
import { FRENCH } from '../utils/i18n';

const FrenchMetaPlugin: PluginObject<any> = {
    install(v, options) {
        if ((v as any).$i18n) {
            (v as any).$i18n.addMessages(FRENCH, require('./meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/accordion/accordion.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/accordion-group/accordion-group.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/button/button.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/checkbox/checkbox.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/dialog/dialog.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/dropdown/dropdown.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/dynamic-template/dynamic-template.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/i18n/i18n.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/icon/icon.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/input/input.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/link/link.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/list-bullet/list-bullet.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/message/message.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/panel/panel.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/popper/popper.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/status-list/status-list.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/step/step.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/table/table.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/text-icon/text-icon.meta.fr.json'));
            (v as any).$i18n.addMessages(FRENCH, require('../components/upload/upload.meta.fr.json'));

            (v as any).$i18n.addMessages(FRENCH, require('../directives/ripple-effect/ripple-effect.meta.fr.json'));
        } else {
            throw new Error('FrenchMetaPlugin.install -> You must use the i18n plugin.');
        }
    }
};

export default FrenchMetaPlugin;
