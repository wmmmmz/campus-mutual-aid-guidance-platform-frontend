<template>
  <div>
    <el-row :gutter="5" >
      <el-col :span="7">
        <el-card shadow="hover" :style="form.getHeight">
          <template #header>
            <el-select style="width: 60%"
                v-model="value"
                filterable
                remote
                reserve-keyword
                placeholder="请输入学生姓名"
                remote-show-suffix
                :remote-method="remoteMethod"
                :loading="loading"
            >
              <el-option
                  v-for="item in options"
                  :key="item.name"
                  :label="`${item.name}`"
                  :value="item.stuId"
              />
            </el-select>
            &nbsp;&nbsp;<el-button style="width: 30%" icon="Plus">新增聊天</el-button>
          </template>
          <el-scrollbar :height="form.getScrollbarHeight">
            <el-menu
                default-active="2"
                class="el-menu-vertical-demo"
                @select="handleSelect"
            >
              <el-menu-item  v-for="item in 10" :key="item"  :index="item"
                            style="height:80px;border-bottom: 1px solid #dcdbdb; border-right: none">

                <div style="width: 100%">
                  <el-row>
                    <el-col :span="6">
                      <div class="avatar1">
                        <el-badge :value="12" class="item">
                        <el-avatar :size="50" :src="form.imgSrc"/>
                        </el-badge>
                      </div>
                    </el-col>
                    <el-col :span="18">
                      <div>
                      <span class="span1" style="font-size: 15px">王萌哲</span>
                      <span class="span3">12:11</span>
                      </div>
                      <div>
                      <span class="span2" style="font-size: 13px; width: 70%; text-overflow: ellipsis;overflow: hidden;">你好你好你好你好你好你好你好你好你好</span>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </el-menu-item>
            </el-menu>
          </el-scrollbar>
        </el-card>
      </el-col>
      <el-col :span="17">
        <el-card shadow="hover" :style="form.getHeight">
          <template #header>
              <el-avatar :size="50" :src="form.imgSrc"/>
              &nbsp;<span style="font-size: 23px;top: 4%; position: absolute;transform: translateY(-4%);">{{form.name}}</span>
          </template>
          <div class="talk">
            <div class="talk-content" :style="form.getContentHeight" >

              <div v-for="item  in contentDiv" style="margin-top: 15px;">

                <div style="text-align: center">
                  <p style="font-size: 1px;color: #9b9b9b"> {{item.time}}</p>
                </div>
                <div style="display: flex;">

                  <div class="name_right" v-if="item.show">
                    <p style="font-size: 1px; "> {{item.name}} </p>
                  </div>
                  <div class="url_right" v-if="item.show">
                    <el-avatar shape="circle" :size="30" :src="item.url"></el-avatar>
                  </div>
                  <div class="url-left" v-if="!item.show">
                    <el-avatar shape="circle" :size="30" :src="item.url"></el-avatar>
                  </div>


                  <div class="name_left" v-if="!item.show">
                    <p style="font-size: 1px;"> {{item.name}} </p>
                  </div>

                </div>


                <div v-html="item.content"
                     class="content_left" v-if="!item.show">
                </div>

                <div v-html="item.content"
                     class="content_right" v-if="item.show">
                </div>

              </div>

            </div>


            <div class=" talk-message">

              <div class="talk-message-face">
                <svg class="icon" aria-hidden="true" @click="isShow">
                  <use xlink:href="#icon-biaoqing"></use>
                </svg>
                <Emotion :emotionIsShow="form.emotionIsShow" @sendEmotionSelect="getValue"></Emotion>
              </div>
              <div class="talk-message-content">

                <el-input
                    v-model="form.textarea"
                    resize="none"
                    type="textarea"
                    rows="1"
                    @keyup.enter.native="submit"
                ></el-input>
              </div>
              <div class="talk-message-send">
                <el-button type="text" style="color:#9b9b9b" @click="submit">发送</el-button>
              </div>
            </div>

          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref, watch} from 'vue';
import Emotion from './emotion.vue'
import '../utils/iconfont';
import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';
import avatar from '../assets/img/img.jpg';
import axios from "axios";
import {useRoute} from "vue-router";
import { ElMessage } from 'element-plus';
import router from "../router";
const stuId = localStorage.getItem('stuId');
const className = localStorage.getItem('className');
let telephone = localStorage.getItem('telephone');
const description = localStorage.getItem('description');
const wx = localStorage.getItem('wx');
const username = localStorage.getItem('username');
const role = localStorage.getItem('role');
const form = reactive({
  getHeight:"",
  imgSrc: localStorage.getItem('img'),
  name:"王萌哲",
  emotionIsShow: false,
  url :"https:/rescdn.qqmail.com/node/wwopen/wwopenmng/images/qq_emotion/qq/",
  textarea:"",
  textarea1:"",
  eList: ['占位', '微笑', '撇嘴', '色', '发呆', '得意', '流泪', '害羞', '闭嘴', '睡', '大哭',
    '尴尬', '发怒', '调皮', '呲牙', '惊讶', '难过', '酷', '冷汗', '抓狂', '吐', '偷笑', '可爱',
    '白眼', '傲慢', '饥饿', '困', '惊恐', '流汗', '憨笑', '大兵', '奋斗', '咒骂', '疑问', '嘘',
    '晕', '折磨', '衰', '骷髅', '敲打', '再见', '擦汗', '抠鼻', '鼓掌', '糗大了', '坏笑', '左哼哼',
    '右哼哼', '哈欠', '鄙视', '委屈', '快哭了', '阴险', '亲亲', '吓', '可怜', '菜刀', '西瓜', '啤酒',
    '篮球', '乒乓', '咖啡', '饭', '猪头', '玫瑰', '凋谢', '示爱', '爱心', '心碎', '蛋糕', '闪电', '炸弹',
    '刀', '足球', '瓢虫', '便便', '月亮', '太阳', '礼物', '拥抱', '强', '弱', '握手', '胜利', '抱拳', '勾引',
    '拳头', '差劲', '爱你', 'NO', 'OK', '爱情', '飞吻', '跳跳', '发抖', '怄火', '转圈', '磕头', '回头', '跳绳', '挥手',
    '激动', '街舞', '献吻', '左太极', '右太极'],
  getContentHeight:"",
  getScrollbarHeight:""
});
interface Chat{
  name:string,
  url:string,
  content:string,
  show:true,
  time:string
}
// const contentDiv = ref<Chat>()
const contentDiv = [
  {
    name:"string",
    url:"string",
    content:"string",
    show:false,
    time:"2022-10-10"
  },{
    name:"string",
    url:"string",
    content:"string",
    show:false,
    time:"2022-10-10"
  },{
    name:"string",
    url:"string",
    content:"string",
    show:false,
    time:"2022-10-10"
  },{
    name:"string",
    url:"string",
    content:"string",
    show:false,
    time:"2022-10-10"
  },{
    name:"string",
    url:"string",
    content:"string",
    show:false,
    time:"2022-10-10"
  },{
    name:"string",
    url:"string",
    content:"string",
    show:false,
    time:"2022-10-10"
  },{
    name:"string",
    url:"string",
    content:"string",
    show:false,
    time:"2022-10-10"
  },{
    name:"string",
    url:"string",
    content:"string",
    show:false,
    time:"2022-10-10"
  }
]
const studentList = ref<User[]>([])
interface User {
  name: string
  stuId:string
  className:string
  tel: string
  wx: string
  locked: any
}
interface ListItem {
  name: string
  stuId: string
}

const list = ref<ListItem[]>([])
const options = ref<ListItem[]>([])
const value = ref<string[]>([])
const loading = ref(false)
const activeIndex = ref('1')
const remoteMethod = (query: string) => {
  if (query) {
    loading.value = true
    setTimeout(() => {
      loading.value = false
      options.value = list.value.filter((item) => {
        return item.name.toLowerCase().includes(query.toLowerCase()) || item.stuId.includes(query)
      })
    }, 200)
    console.log(value.value)
  } else {
    options.value = []
  }
}
const getStudentList = () => {
  axios.get('/user/getStudentList').then(re =>{
    if (re.data.code == 200){
      studentList.value = re.data.data
      list.value = studentList.value.map((item) => {
        return { name: `${item.name}`, stuId: `${item.stuId}` }
      })
    }
  })
}
const handleSelect = (key: string) => {
  console.log(key)
}
onMounted(() =>{
  window.addEventListener("resize", getHeight);
})
const getHeight = () => {
  form.getHeight = "height:" + (window.innerHeight - 130) + "px"
  form.getContentHeight = "height:" + (window.innerHeight - 310) + "px"
  form.getScrollbarHeight = (window.innerHeight - 230) + "px"
}
const isShow = () =>{
  if (form.emotionIsShow === false) {
    form.emotionIsShow = true;
  } else {
    form.emotionIsShow = false;
  }
}
const getValue = (val : string, item : any) => {
  let img = '<img src="' + form.url + val + '.png"  style= "width: 22px;height: 22px">';
  let el = '[' + item + ']'
  form.emotionIsShow = false;
  form.textarea = form.textarea + el;
  form.textarea1 += img;
}
const submit = () => {
  let a = form.textarea;
  let pre = 0;
  let last = 0;
  let flag = false;
  while (true) {
    if (!a.match("]")) {
      break;
    }
    pre = a.indexOf("[");
    last = a.indexOf("]");

    let face = a.substring(pre + 1, last);
    let b;
    for (let j = 0; j < form.eList.length; j++) {
      if (face == form.eList[j]) {
        b = j;
        break;
      }
    }
    let img = '<img src="' + form.url + b + '.png"  style= "width: 22px;height: 22px">';
    a = a.substring(0, pre) + img + a.substring(last + 1, a.length);
    pre = 0;
    last = 0;
    flag = false;


  }

  let c = {
    "name": "锅包肉",
    "url": "https://img0.baidu.com/it/u=3953639057,245238928&fm=15&fmt=auto&gp=0.jpg",
    "content": a,
    "show": true,
    "time": "2021-7-12 17:12:12"
  };

  let d = {
    "name": "糖醋里脊",
    "url": "https://img0.baidu.com/it/u=1741172190,3962404342&fm=26&fmt=auto&gp=0.jpg",
    "content": "大佬你好啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊",
    "show": false,
    "time": "2021-7-12 17:12:46"
  };

  form.textarea = "";
  form.textarea1 = "";
  contentDiv.push(c);
  contentDiv.push(d);
}
watch(

    () => router.currentRoute.value.path,

    (newValue, oldValue) => {
      getStudentList()
    },

    { immediate: true }

);
</script>

<style scoped>
.item {
  margin-top: 2px;
  margin-right: 15px;
}
.avatar1{
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
.span2{
  position: absolute;
  top: 20%;
  transform: translateY(-20%);
}
.span1{
  position: absolute;
  top: 70%;
  transform: translateY(-70%);
}
.span3{
  position: absolute;
  right: 0%;
  top: 70%;
  transform: translate(-10%, -70%)
}
.name_right {
  margin-left: 310px;
}

.name_left {
  margin-left: 10px;
}

.content_right {

  word-wrap: break-word;
  width: 50%;
  margin-left: 150px;
  font-size: 10px;
  text-align: right;
  margin-bottom: 20px;
}

.content_left {
  word-wrap: break-word;
  width: 50%;
  margin-left: 60px;
  font-size: 10px;
  text-align: left;
  margin-bottom: 20px;
}

.url_right {
  margin-left: 10px;

}

.url-left {
  margin-left: 15px;

}

::-webkit-scrollbar {
  height: 10px !important;
  width: 10px !important;
}

::-webkit-scrollbar-thumb {
  border-radius: 0;
  border-style: dashed;
  background-color: #DCE1E6;
  border-color: #e2242400;
  border-width: 1px;
  background-clip: padding-box;
}



::-webkit-scrollbar-track { /*滚动条里面轨道*/
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  /*border-radius: 10px;*/
  background: white;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(157, 165, 183, 0.7)
}


.word-break {
  word-break: break-all;
}


.infinite-list-wrapper p {
  text-align: center;
}


.show-input-content {
  height: 100%;
  width: 100%;
  border: 1px solid black;

}

.emotion {
  width: 22px !important;
  height: 22px !important;
  margin-right: 4px;
  line-height: 40px;
  top: 5px;

}


.icon {
  width: 2em;
  height: 2em;
  padding-top: 10px;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.talk {
  /*border: 1px solid #DCE1E6;*/
  width: 100%;
  height: auto;
  margin: 0 auto;
}

.talk-header {
  width: 100%;
  height: 30px;
  z-index: 1;
  border-bottom: 1px solid #DCE1E6;
}

.talk-header-icon {
  padding-left: 330px;
}

.talk-content {
  overflow-y: auto;
  height: 90%;
}

.talk-message {
  border-top: 1px solid #DCE1E6;
  height: 50px;
  display: flex;
}

.talk-message-face {
  width: 40px;
  padding-left: 2px;
  padding-top: 10px;
}

.talk-message-content {
  padding-top: 20px;
  padding-bottom: 20px;
  width: 100%;
  height: 100px;
}

.talk-message-send {
  padding-top: 17px;
  width: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
