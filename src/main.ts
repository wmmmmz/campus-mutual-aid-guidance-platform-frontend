import {createApp} from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import router from './router'
import { usePermissStore } from './store/permiss'
import 'element-plus/dist/index.css'
import './assets/css/icon.css'
import axios from "axios"

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
    locale: zhCn,
})
axios.defaults.baseURL = 'http://127.0.0.1:22222'
// http request拦截器 添加一个请求拦截器
axios.interceptors.request.use(function (config) {
    // Do something before request is sent
    let token = window.localStorage.getItem("sa_token")
    if (token != null) {
        config.headers!.token = token;
    }
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

axios.interceptors.response.use(data=> {
    // 对响应数据做点什么
    console.log(data.data.code)
    if (data.data.code === 403){
        router.push("/login")
    }
    return data;
}, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
});




// 注册elementplus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
// 自定义权限指令
const permiss = usePermissStore()
app.directive('permiss', {
    mounted(el, binding) {
        if(!permiss.key.includes(String(binding.value))){
            el['hidden'] = true;
        }
    }
})

app.mount('#app')