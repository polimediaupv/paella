import { ButtonPlugin } from 'paella';

import userIcon from './user.svg';

export default class TestExternalPlugin extends ButtonPlugin {
    get icon() {
        return userIcon;
    }

    async action() {
        alert("Test external plugin");
    }
}
