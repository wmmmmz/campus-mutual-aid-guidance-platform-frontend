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
		icon: 'Message',
		index: '/tabs',
		title: '我的消息',
		permiss: 'myMessage'
	},
  {
    icon: 'Notification',
    index: '/publishNews',
    title: '发布通知',
    permiss: 'publishNews'
  }, {
    icon: 'User',
    index: '/hireTeacher',
    title: '招募导生',
    permiss: 'hireTeacher'
  }, {
    icon: 'Calendar',
    index: '/startClass',
    title: '开班管理',
    permiss: 'startClass'
  }, {
    icon: 'Calendar',
    index: '/iLearn',
    title: '我的课程',
    permiss: 'iLearn',
    subs: [
      {
        index: '/iLearn',
        title: '我的课表',
        permiss: 'iLearn',
      },{
        index: '/classDetails',
        title: '课程详情',
        permiss: 'iLearn',
      }
    ]
  }, {
    icon: 'Calendar',
    index: '/iTeach',
    title: '我教的课',
    permiss: 'iTeach',
    subs: [
      {
        index: '/iTeach',
        title: '我的课表',
        permiss: 'iTeach',
      },{
        index: '/teachDetails',
        title: '课程详情',
        permiss: 'iTeach',
      }
    ]
  }, {
    icon: 'Service',
    index: '/enrollTeach',
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
    icon: 'Notebook',
    index: '/courseManager',
    title: '课程管理',
    permiss: 'courseManager'
  }, {
    icon: 'Clock',
    index: '/termManager',
    title: '学期管理',
    permiss: 'termManager'
  }, {
    icon: 'PictureRounded',
    index: '/carouselChartManager',
    title: '轮播图管理',
    permiss: 'carouselChartManager'
  }, {
    icon: 'Headset',
    index: '/enrollClass',
    title: '报名上课',
    permiss: 'enrollClass',
    subs: [
      {
        index: '/myClassEnroll',
        title: '我的报名',
        permiss: 'enrollClass',
      },{
        index: '/enrollClass',
        title: '可报名列表',
        permiss: 'enrollClass',
      }
    ]
  }, {
    icon: 'Connection',
    index: '/adminManager',
    title: '管理员管理',
    permiss: 'adminManager'
  }, {
    icon: 'ChatLineRound',
    index: '/chatBox',
    title: '聊天室',
    permiss: 'chatBox'
  },
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
