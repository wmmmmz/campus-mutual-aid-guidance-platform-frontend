import {createRouter, createWebHashHistory, RouteRecordRaw} from "vue-router";
import { usePermissStore } from '../store/permiss'
import Home from "../views/home.vue";

const routes:RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/dashboard'
    }, {
        path: "/",
        name: "Home",
        component: Home,
        children: [
            {
                path: "/dashboard",
                name: "dashboard",
                meta: {
                    title: '系统首页',
                    permiss: 'dashboard'
                },
                component: () => import ( /* webpackChunkName: "dashboard" */ "../views/dashboard.vue")
            }, {
                path: "/tabs",
                name: "tabs",
                meta: {
                    title: '我的消息',
                    permiss: 'myMessage'
                },
                component: () => import ( /* webpackChunkName: "tabs" */ "../views/tabs.vue")
            }, {
                path: '/user',
                name: 'user',
                meta: {
                    title: '个人中心'
                },
                component: () => import (/* webpackChunkName: "user" */ '../views/user.vue')
            }, {
                path: '/publishNews',
                name: 'publishNews',
                meta: {
                    title: '发布通知',
                    permiss: 'publishNews'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/publishNews.vue')
            }, {
                path: '/hireTeacher',
                name: 'hireTeacher',
                meta: {
                    title: '招募导生',
                    permiss: 'hireTeacher'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/hireTeacher.vue')
            }, {
                path: '/startClass',
                name: 'startClass',
                meta: {
                    title: '开班管理',
                    permiss: 'startClass'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/startClass.vue')
            }, {
                path: '/iLearn',
                name: 'iLearn',
                meta: {
                    title: '我的课程',
                    permiss: 'iLearn'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/iLearn.vue')
            }, {
                path: '/classDetails',
                name: 'classDetails',
                meta: {
                    title: '课程详情',
                    permiss: 'iLearn'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/classDetails.vue')
            }, {
                path: '/iTeach',
                name: 'iTeach',
                meta: {
                    title: '我教的课',
                    permiss: 'iTeach'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/iTeach.vue')
            }, {
                path: '/teachDetails',
                name: 'teachDetails',
                meta: {
                    title: '课程详情',
                    permiss: 'iTeach'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/teachDetails.vue')
            }, {
                path: '/enrollTeach',
                name: 'enrollTeach',
                meta: {
                    title: '我的报名',
                    permiss: 'enrollTeach'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/enrollTeach.vue')
            }, {
                path: '/courseManager',
                name: 'courseManager',
                meta: {
                    title: '课程管理',
                    permiss: 'courseManager'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/courseManager.vue')
            }, {
                path: '/termManager',
                name: 'termManager',
                meta: {
                    title: '学期管理',
                    permiss: 'termManager'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/termManager.vue')
            }, {
                path: '/carouselChartManager',
                name: 'carouselChartManager',
                meta: {
                    title: '轮播图管理',
                    permiss: 'carouselChartManager'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/carouselChartManager.vue')
            }, {
                path: '/myTeachEnroll',
                name: 'myTeachEnroll',
                meta: {
                    title: '我的报名',
                    permiss: 'enrollTeach'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/myTeachEnroll.vue')
            }, {
                path: '/myClassEnroll',
                name: 'myClassEnroll',
                meta: {
                    title: '我的报名',
                    permiss: 'enrollClass'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/myClassEnroll.vue')
            }, {
                path: '/enrollClass',
                name: 'enrollClass',
                meta: {
                    title: '可报名列表',
                    permiss: 'enrollClass'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/enrollClass.vue')
            }, {
                path: '/adminManager',
                name: 'adminManager',
                meta: {
                    title: '管理员管理',
                    permiss: 'adminManager'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/adminManager.vue')
            }, {
                path: '/chatBox',
                name: 'chatBox',
                meta: {
                    title: '聊天室',
                    permiss: 'chatBox'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/chatBox.vue')
            }
        ]
    }, {
        path: "/login",
        name: "Login",
        meta: {
            title: '登录'
        },
        component: () => import ( /* webpackChunkName: "login" */ "../views/login.vue")
    }, {
        path: '/403',
        name: '403',
        meta: {
            title: '没有权限'
        },
        component: () => import (/* webpackChunkName: "403" */ '../views/403.vue')
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title} | 校园互助辅导平台`;
    const role = localStorage.getItem('sa_token');
    const permiss = usePermissStore();
    if (!role && to.path !== '/login') {
        next('/login');
    } else if (to.meta.permiss && !permiss.key.includes(to.meta.permiss)) {
        // 如果没有权限，则进入403
        next('/403');
    } else {
        next();
    }
});

export default router;