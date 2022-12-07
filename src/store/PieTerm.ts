import { defineStore } from 'pinia';

export const PieTermStore = defineStore('pieTerm', {
    state: () => {
        return {
            pieTermChoose: ''
        };
    },
    getters: {},
    actions: {
        handlePieTermChoose(termName : string) {
            this.pieTermChoose = termName;
        }
    }
});
