import { defineStore } from 'pinia';

interface ObjectList {
	[key: string]: string[];
}

export const usePermissStore = defineStore('permiss', {
	state: () => {
		const keys = localStorage.getItem('ms_keys');
		return {
			key: keys ? JSON.parse(keys) : <string[]>[],
			defaultList: <ObjectList>{
				admin: ['dashboard', '2', 'myMessage', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16','publishNews','hireTeacher','startClass'],
				teacher: ['dashboard','myMessage','iTeach','enrollTeach'],
				student: ['dashboard','myMessage','enrollClass','iLearn','myInterview']
			}
		};
	},
	actions: {
		handleSet(val: string[]) {
			this.key = val;
		}
	}
});
