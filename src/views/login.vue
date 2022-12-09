<template>
	<div class="login-wrap">
		<div class="ms-login">
			<div class="ms-title">校园互助辅导平台</div>
			<el-form :model="param" :rules="rules" ref="login" label-width="0px" class="ms-content">
				<el-form-item prop="username">
					<el-input v-model="param.username" placeholder="username">
						<template #prepend>
							<el-button :icon="User"></el-button>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item prop="password">
					<el-input
						type="password"
						placeholder="password"
						v-model="param.password"
						@keyup.enter="submitForm(login)"
					>
						<template #prepend>
							<el-button :icon="Lock"></el-button>
						</template>
					</el-input>
				</el-form-item>
				<div class="identity-btn">
          &nbsp&nbsp&nbsp&nbsp
          <el-radio-group v-model="param.identity">
            <el-radio label="student">学生</el-radio>
            <el-radio label="teacher">导生</el-radio>
            <el-radio label="admin">管理员</el-radio>
          </el-radio-group>
				</div>
        <div class="login-btn">
          <el-button type="primary" size="mini" @click="submitForm(login)">登陆</el-button>
        </div>
        <p class="login-tips">{{errorMessage}}</p>
			</el-form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useTagsStore } from '../store/tags';
import { usePermissStore } from '../store/permiss';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { Lock, User } from '@element-plus/icons-vue';
import axios from "axios";
import {unReadCntStore} from "../store/unreadCnt";

interface LoginInfo {
	username: string;
	password: string;
  identity: string;
}
const form = reactive({
  unreadedCnt : 0
})
let dataUrl: string
let errorMessage: string
const router = useRouter();
const param = reactive<LoginInfo>({
	username: 'admin',
	password: '111111',
  identity: 'admin'
});

const rules: FormRules = {
	username: [
		{
			required: true,
			message: '请输入用户名',
			trigger: 'blur'
		}
	],
	password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};
const permiss = usePermissStore();
const login = ref<FormInstance>();
interface Notify{
  title:string
  content:string
  createTime:''
  status:string
}
const submitForm = (formEl: FormInstance | undefined) => {
	if (!formEl) return;
	formEl.validate((valid: boolean) => {
		if (valid) {
      const data = {
        username: param.username,
        pwd: param.password,
        role: param.identity
      };
      axios.post("/login", data).then(response=>{
        const data = response.data
        if (data.code === 200){
          const keys = permiss.defaultList[param.identity];
          permiss.handleSet(keys);
          localStorage.setItem('ms_keys', JSON.stringify(keys));
          localStorage.setItem('stuId', data.data!.stuId)
          localStorage.setItem('username', data.data!.name)
          if ( data.data!.tel != undefined)
            localStorage.setItem('telephone', data.data!.tel)
          localStorage.setItem('role', data.data!.role)
          if ( data.data!.description != undefined)
            localStorage.setItem('description', data.data!.description)
          if ( data.data!.wx != undefined)
          localStorage.setItem('wx', data.data!.wx)
          if ( data.data!.className != undefined)
            localStorage.setItem('className', data.data!.className)
          localStorage.setItem('sa_token', data.data!.saTokenValue)
          localStorage.setItem('img', data.data!.imgBase64)
          // localStorage.setExpire("sa_token", data.data, 50)
          // get unread message number
          getNotifyList()
          ElMessage.success('登录成功');
          router.push('/');
        }else {
          errorMessage = data.message
          ElMessage.error(errorMessage);
          return false;
        }
      }).catch(error => {
        console.log(error.response)
      });

		} else {
			ElMessage.error('登录成功');
			return false;
		}
	});
};
const unReadCntChange = unReadCntStore()
const getNotifyList = () => {
  const data = {
    stuId : localStorage.getItem('stuId'),
    role: localStorage.getItem('role'),
  }
  axios.get('/user/getNotifyList', {params:data}).then(re => {
    if (re.data.code == 200){
      const unReadList = re.data.data["UNREADED"] as Array<Notify>
      if(unReadList == undefined){
        form.unreadedCnt = 0
      }else{
        form.unreadedCnt = unReadList.length
      }
      unReadCntChange.handleUnReadCnt(form.unreadedCnt)
    }
  })
}
const imgUrlToBase64 = (imageUrl: string): string =>{
  let image = new Image() // 一定要设置为let，不然图片不显示
  image.setAttribute('crossOrigin', 'anonymous') // 解决跨域问题
  image.src = imageUrl // 如果是本地图片替换为 image.src = imageUrl
  image.onload = () => {
    var canvas = document.createElement("canvas")
    canvas.width = image.width
    canvas.height = image.height
    var context = canvas.getContext('2d')
    context!.drawImage(image, 0, 0, image.width, image.height)
    var quality = 0.8
    dataUrl = canvas.toDataURL("image/jpeg", quality) // 使用toDataUrl将图片转换成jpeg的格式,不要把图片压缩成png，因为压缩成png后base64的字符串可能比不转换前的长！
  }
  console.log(dataUrl)
  return dataUrl;
}

// Storage.prototype.setExpire=(key: string, value: any, expire: any) =>{
//   let obj={
//     data:value,
//     time:Date.now(),
//     expire:expire
//   };
//   localStorage.setItem(key,JSON.stringify(obj));
// }
// Storage.prototype.getExpire= (key: string) =>{
//   let val =localStorage.getItem(key);
//   if(!val){
//     return val;
//   }
//   val =JSON.parse(val);
//   if(Date.now()-val.time>val.expire){
//     localStorage.removeItem(key);
//     return null;
//   }
//   return val.data;
// }
const tags = useTagsStore();
tags.clearTags();
</script>

<style scoped>
.login-wrap {
	position: relative;
	width: 100%;
	height: 100%;
	background-image: url(../assets/img/login-bg.jpg);
	background-size: 100%;
}
.ms-title {
	width: 100%;
	line-height: 50px;
	text-align: center;
	font-size: 20px;
	color: #fff;
	border-bottom: 1px solid #ddd;
}
.ms-login {
	position: absolute;
	left: 50%;
	top: 50%;
	width: 350px;
	margin: -190px 0 0 -175px;
	border-radius: 5px;
	background: rgba(255, 255, 255, 0.3);
	overflow: hidden;
}
.ms-content {
	padding: 30px 30px;
}
.login-btn {
	text-align: center;
}
.login-btn button {
	width: 100%;
	height: 36px;
	margin-bottom: 10px;
}
.identity-btn div{
  height: 36px;
  margin-bottom: 10px;
}
.login-tips {
	font-size: 12px;
	line-height: 30px;
	color: #fff;
}
</style>
