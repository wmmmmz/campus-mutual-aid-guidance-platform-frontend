<template>
	<div class="sidebar">
		<el-menu
			class="sidebar-el-menu"
			:default-active="onRoutes"
			:collapse="sidebar.collapse"
			background-color="#324157"
			text-color="#bfcbd9"
			active-text-color="#20a0ff"
			unique-opened
			router
		>
			<template v-for="item in items">
				<template v-if="item.subs">
					<el-sub-menu :index="item.index" :key="item.index" v-permiss="item.permiss">
						<template #title>
							<el-icon>
								<component :is="item.icon"></component>
							</el-icon>
							<span>{{ item.title }}</span>
						</template>
						<template v-for="subItem in item.subs">
							<el-sub-menu
								v-if="subItem.subs"
								:index="subItem.index"
								:key="subItem.index"
								v-permiss="item.permiss"
							>
								<template #title>{{ subItem.title }}</template>
								<el-menu-item v-for="(threeItem, i) in subItem.subs" :key="i" :index="threeItem.index">
									{{ threeItem.title }}
								</el-menu-item>
							</el-sub-menu>
							<el-menu-item v-else :index="subItem.index" v-permiss="item.permiss">
								{{ subItem.title }}
							</el-menu-item>
						</template>
					</el-sub-menu>
				</template>
				<template v-else>
					<el-menu-item :index="item.index" :key="item.index" v-permiss="item.permiss">
						<el-icon>
							<component :is="item.icon"></component>
						</el-icon>
						<template #title>{{ item.title }}</template>
					</el-menu-item>
				</template>
			</template>
		</el-menu>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSidebarStore } from '../store/sidebar';
import { useRoute } from 'vue-router';
const items = [
	{
		icon: 'Odometer',
		index: '/dashboard',
		title: '系统首页',
		permiss: 'dashboard'
	},
	{
		icon: 'Calendar',
		index: '/table',
		title: '基础表格',
		permiss: '2'
	},
	{
		icon: 'Message',
		index: '/tabs',
		title: '我的消息',
		permiss: 'myMessage'
	},
	{
		icon: 'Edit',
		index: '3',
		title: '表单相关',
		permiss: '4',
		subs: [
			{
				index: '/form',
				title: '基本表单',
				permiss: '5'
			},
			{
				index: '/upload',
				title: '文件上传',
				permiss: '6'
			},
			{
				index: '4',
				title: '三级菜单',
				permiss: '7',
				subs: [
					{
						index: '/editor',
						title: '富文本编辑器',
						permiss: '8'
					},
					{
						index: '/markdown',
						title: 'markdown编辑器',
						permiss: '9'
					}
				]
			}
		]
	},
	{
		icon: 'Setting',
		index: '/icon',
		title: '自定义图标',
		permiss: '10'
	},
	{
		icon: 'PieChart',
		index: '/charts',
		title: 'schart图表',
		permiss: '11'
	},
	{
		icon: 'Warning',
		index: '/permission',
		title: '权限管理',
		permiss: '13'
	},
	{
		icon: 'CoffeeCup',
		index: '/donate',
		title: '支持作者',
		permiss: '14'
	}, {
    icon: 'DocumentCopy',
    index: '/publishNews',
    title: '发布通知',
    permiss: 'publishNews'
  }, {
    icon: 'Edit',
    index: '/hireTeacher',
    title: '招募导生',
    permiss: 'hireTeacher'
  }, {
    icon: 'Calendar',
    index: '/startClass',
    title: '开班管理',
    permiss: 'startClass'
  }, {
    icon: 'DocumentCopy',
    index: '/enrollClass',
    title: '报名上课',
    permiss: 'enrollClass'
  }, {
    icon: 'Calendar',
    index: '/iLearn',
    title: '我的课程',
    permiss: 'iLearn'
  }, {
    icon: 'CoffeeCup',
    index: '/myInterview',
    title: '我的面试',
    permiss: 'myInterview'
  }, {
    icon: 'Calendar',
    index: '/iTeach',
    title: '我教的课',
    permiss: 'iTeach'
  }, {
    icon: 'DocumentCopy',
    index: '/2',
    title: '报名授课',
    permiss: 'enrollTeach',
    subs: [
        {
        index: '/myTeachEnroll',
        title: '我的报名',
        permiss: 'enrollTeach',
      },{
        index: '/enrollTeach',
        title: '可报名列表',
        permiss: 'enrollTeach',
      }
    ]
  }, {
    icon: 'Calendar',
    index: '/courseManager',
    title: '课程管理',
    permiss: 'courseManager'
  }, {
    icon: 'PieChart',
    index: '/termManager',
    title: '学期管理',
    permiss: 'termManager'
  }, {
    icon: 'PieChart',
    index: '/carouselChartManager',
    title: '轮播图管理',
    permiss: 'carouselChartManager'
  }
];

const route = useRoute();
const onRoutes = computed(() => {
	return route.path;
});

const sidebar = useSidebarStore();
</script>

<style scoped>
.sidebar {
	display: block;
	position: absolute;
	left: 0;
	top: 70px;
	bottom: 0;
	overflow-y: scroll;
}
.sidebar::-webkit-scrollbar {
	width: 0;
}
.sidebar-el-menu:not(.el-menu--collapse) {
	width: 250px;
}
.sidebar > ul {
	height: 100%;
}
</style>
