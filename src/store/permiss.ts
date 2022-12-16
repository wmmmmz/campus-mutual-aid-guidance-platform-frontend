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
				superAdmin:['dashboard', 'myMessage', 'adminManager', 'chatBox'],
				admin: ['dashboard', 'myMessage', '4', '7', '8', '9', '10', '13',
					'publishNews','hireTeacher','startClass','termManager','courseManager', 'carouselChartManager', 'chatBox'],
				teacher: ['dashboard','myMessage','iTeach','enrollTeach', 'chatBox'],
				student: ['dashboard','myMessage','enrollClass','iLearn','enrollTeach', 'chatBox']
			}
		};
	},
	actions: {
		handleSet(val: string[]) {
			this.key = val;
		}
	}
});
