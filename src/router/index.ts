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
                path: "/table",
                name: "basetable",
                meta: {
                    title: '表格',
                    permiss: '2'
                },
                component: () => import ( /* webpackChunkName: "table" */ "../views/table.vue")
            }, {
                path: "/charts",
                name: "basecharts",
                meta: {
                    title: '图表',
                    permiss: '11'
                },
                component: () => import ( /* webpackChunkName: "charts" */ "../views/charts.vue")
            }, {
                path: "/form",
                name: "baseform",
                meta: {
                    title: '表单',
                    permiss: '5'
                },
                component: () => import ( /* webpackChunkName: "form" */ "../views/form.vue")
            }, {
                path: "/tabs",
                name: "tabs",
                meta: {
                    title: '我的消息',
                    permiss: 'myMessage'
                },
                component: () => import ( /* webpackChunkName: "tabs" */ "../views/tabs.vue")
            }, {
                path: "/donate",
                name: "donate",
                meta: {
                    title: '鼓励作者',
                    permiss: '14'
                },
                component: () => import ( /* webpackChunkName: "donate" */ "../views/donate.vue")
            }, {
                path: "/permission",
                name: "permission",
                meta: {
                    title: '权限管理',
                    permiss: '13'
                },
                component: () => import ( /* webpackChunkName: "permission" */ "../views/permission.vue")
            }, {
                path: "/upload",
                name: "upload",
                meta: {
                    title: '上传插件',
                    permiss: '6'
                },
                component: () => import ( /* webpackChunkName: "upload" */ "../views/upload.vue")
            }, {
                path: "/icon",
                name: "icon",
                meta: {
                    title: '自定义图标',
                    permiss: '10'
                },
                component: () => import ( /* webpackChunkName: "icon" */ "../views/icon.vue")
            },  {
                path: '/user',
                name: 'user',
                meta: {
                    title: '个人中心'
                },
                component: () => import (/* webpackChunkName: "user" */ '../views/user.vue')
            }, {
                path: '/editor',
                name: 'editor',
                meta: {
                    title: '富文本编辑器',
                    permiss: '8'
                },
                component: () => import (/* webpackChunkName: "editor" */ '../views/editor.vue')
            }, {
                path: '/markdown',
                name: 'markdown',
                meta: {
                    title: 'markdown编辑器',
                    permiss: '9'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/markdown.vue')
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
                path: '/enrollClass',
                name: 'enrollClass',
                meta: {
                    title: '报名上课',
                    permiss: 'enrollClass'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/enrollClass.vue')
            }, {
                path: '/iLearn',
                name: 'iLearn',
                meta: {
                    title: '我的课程',
                    permiss: 'iLearn'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/iLearn.vue')
            }, {
                path: '/myInterview',
                name: 'myInterview',
                meta: {
                    title: '我的面试',
                    permiss: 'myInterview'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/myInterview.vue')
            }, {
                path: '/iTeach',
                name: 'iTeach',
                meta: {
                    title: '我教的课',
                    permiss: 'iTeach'
                },
                component: () => import (/* webpackChunkName: "markdown" */ '../views/iTeach.vue')
            }, {
                path: '/enrollTeach',
                name: 'enrollTeach',
                meta: {
                    title: '报名授课',
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