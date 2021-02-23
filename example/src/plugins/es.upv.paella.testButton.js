import { ButtonPlugin } from 'paella'

import helpIcon from '../icons/help.svg';

export default class TestButtonPlugin extends ButtonPlugin {
    get icon() { return helpIcon; }
    
    async action() {
        console.log("Test");
        alert("Test button");
    }
    
    
}