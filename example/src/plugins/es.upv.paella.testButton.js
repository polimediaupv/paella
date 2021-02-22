import { ButtonPlugin } from 'paella'

export default class TestButtonPlugin extends ButtonPlugin {
    async action() {
        console.log("Test");
    }
}