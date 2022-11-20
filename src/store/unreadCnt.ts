import { defineStore } from 'pinia';
export const unReadCntStore = defineStore('unReadCnt',{
    state: () => {
        return {
            unReadCnt: 0
        };
    },
    actions: {
        handleUnReadCnt(val: number) {
            this.unReadCnt = val;
        }
    }
})