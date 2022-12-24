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
                placeholder="请输入学生姓名或学号"
                remote-show-suffix
                :remote-method="remoteMethod"
                :loading="loading"
            >
              <el-option
                  v-for="item in options"
                  :key="item.name"
                  :label="`${item.name}` + ' (' + `${item.stuId}` + '）'"
                  :value="item.stuId"
              />
            </el-select>
            &nbsp;&nbsp;<el-button style="width: 30%" icon="Plus" @click="addConversation(value)">新增聊天</el-button>
          </template>
          <el-scrollbar :height="form.getScrollbarHeight">
            <el-menu
                default-active="1"
                class="el-menu-vertical-demo"
                @select="handleSelect"
            >
              <el-menu-item  v-for="item in conversationList" :key="item"  :index="item"
                            style="height:80px;border-bottom: 1px solid #dcdbdb; border-right: none">

                <div style="width: 100%">
                  <el-row>
                    <el-col :span="6">
                      <div class="avatar1">
                        <el-badge v-if="item.unreadCnt !== 0" :value="item.unreadCnt" class="item">
                        <el-avatar :size="50" :src="item.avatar"/>
                        </el-badge>
                        <el-avatar v-if="item.unreadCnt === 0" :size="50" :src="item.avatar"/>
                      </div>
                    </el-col>
                    <el-col :span="18">
                      <div>
                      <span class="span1" style="font-size: 15px">{{ item.name }}</span>
                      <span class="span3">{{item.latestMessageTime}}</span>
                      </div>
                      <div>
                      <div class="span2" v-html="item.latestMessage"
                            style="font-size: 13px; width: 70%; text-overflow: ellipsis;overflow: hidden;"></div>
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
              <el-avatar :size="50" :src="form.imgSrc" v-if="form.imgSrc"/>
              &nbsp;<span style="font-size: 23px;top: 4%; position: absolute;transform: translateY(-4%);">{{form.name}}</span>
          </template>
          <div class="talk">
            <el-empty :image-size="700" :image="EmptyBackground" :style="form.getContentHeight + ';overflow:auto'"
                      v-if="!form.name"  description="have a nice day ~"/>

            <div v-if="form.name" class="talk-content" id="talk-content" :style="form.getContentHeight + ';overflow:auto'" >

                <div v-for="(item, index)  in contentDiv" style="margin-top: 15px;">

                  <div style="text-align: center">
                    <p v-if="index === form.totalCnt - 1 || index !== form.totalCnt - 1 && item.time !== contentDiv[index + 1].time"
                       style="font-size: 10px;color: #9b9b9b"> {{item.time}}</p>
                  </div>
                  <div style="display: flex;">

  <!--                  <div class="name_right" v-if="item.myMessage">-->
  <!--                    <p style="font-size: 15px; "> {{item.name}} </p>-->
  <!--                  </div>-->
                    <div class="url_right" v-if="item.myMessage">
                      <el-avatar shape="circle" :size="40" :src="item.avatar"></el-avatar>
                    </div>
                    <div class="url-left" v-if="!item.myMessage">
                      <el-avatar shape="circle" :size="40" :src="item.avatar"></el-avatar>
                    </div>


                    <div class="name_left" v-if="!item.myMessage">
                      <p style="font-size: 15px;"> {{item.name}} </p>
                    </div>

                  </div>


                  <div v-html="item.content"
                       class="content_left" v-if="!item.myMessage && !item.isImg && !item.isFile">
                  </div>
                  <div class="content_left" v-if="!item.myMessage && item.isImg">
                    <el-image :preview-src-list="item.srcList" :src="item.imgBase64"/>
                  </div>
                  <div class="content_left" v-if="!item.myMessage && item.isFile">
                    <el-button class="btn" size="100px" plain icon="Document" @click="downloadFileByBase64(item.imgBase64, `${item.content}`)">
                      {{item.content}}
                    </el-button>
                  </div>
                  <div v-html="item.content"
                       class="content_right" v-if="item.myMessage && !item.isImg && !item.isFile">
                  </div>
                  <div class="content_right" v-if="item.myMessage && item.isImg">
                    <el-image :src="item.imgBase64" :preview-src-list="item.srcList"/>
                  </div>
                  <div class="content_right" v-if="item.myMessage && item.isFile">
                      <el-button class="btn"  size="large" plain @click="downloadFileByBase64(item.imgBase64, `${item.content}`)">
                        <el-icon :size="40" style="margin-right: 15px">
                          <Document />
                        </el-icon>
                        {{item.content}}
                      </el-button>
                  </div>
                </div>
              <InfiniteLoading @infinite="load" style="height: 1%"/>
            </div>

            <div v-if="form.name" class=" talk-message">

                <div class="talk-message-content">

                  <el-input
                      :disabled="form.fileList.length !== 0"
                      v-model="form.textarea"
                      resize="none"
                      type="textarea"
                      autosize
                      @keyup.enter.native="submit"
                  ></el-input>
                </div>

              </div>
            <div v-if="form.name" class="talk-extra">
              <div class="talk-message-face">
                <el-button  type="text" :disabled="form.fileList.length !== 0" @click="isShow">
                <svg class="icon" aria-hidden="true" style="color:#9b9b9b">
                  <use xlink:href="#icon-biaoqing"></use>
                </svg>
                </el-button>
                <Emotion :emotionIsShow="form.emotionIsShow" @sendEmotionSelect="getValue"></Emotion>
              </div>
              <div v-if="form.name" class="talk-img">
                <el-upload v-model:file-list="form.fileList" class="upload-demo" action="" :before-upload="BeforeUpload"
                           :http-request="Upload"
                           :on-remove="handleRemove">
                  <el-button  type="text" style="color:#9b9b9b" @click="form.isFile = true">
                    <el-icon :size="20">
                      <Folder />
                    </el-icon>
                  </el-button>
                </el-upload>
              </div>
              <div class="talk-message-send">
                <el-button type="text" style="color:#9b9b9b" @click="submit">
                  <el-icon :size="22">
                    <Position />
                  </el-icon>
                </el-button>
              </div>
            </div>

          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" defer=true>
import {onMounted, reactive, ref, watch} from 'vue';
import Emotion from './emotion.vue'
import '../utils/iconfont';
import EmptyBackground from '../assets/img/chat_bg.jpg'
import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';
import avatar from '../assets/img/img.jpg';
import axios from "axios";
import {useRoute} from "vue-router";
import {ElMessage} from 'element-plus';
import InfiniteLoading from "v3-infinite-loading";
import type { UploadProps, UploadUserFile } from 'element-plus'
import router from "../router";
import {push} from "echarts/types/src/component/dataZoom/history";
const stuId = localStorage.getItem('stuId');
const className = localStorage.getItem('className');
const role = localStorage.getItem('role');
const form = reactive({
  getHeight:"",
  imgSrc: "",
  name:"",
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
  getScrollbarHeight:"",
  stuId:"",
  newFile:new FormData(),
  tempFilePath:[""],
  suffixName:[""],
  isFile:false,
  fileList:[],
  totalCnt:0,
  fileName:[""]
});
let beforeUploadFile : any
interface Chat{
  name:string,
  avatar:string,
  content:string,
  myMessage:true,
  time:string,
  isImg:boolean,
  isFile:boolean,
  imgBase64:string,
  srcList:[]
}
interface Conversation{
  name:string,
  avatar:string,
  stuId:string,
  latestMessage:string,
  unreadCnt:number,
  latestMessageTime:string
}
const conversationList = ref<Conversation>()
const contentDiv = ref<Chat[]>([])
const newContentDiv = ref<Chat>()
const studentList = ref<User[]>([])
interface User {
  name: string
  stuId:string
  className:string
  tel: string
  wx: string
  locked: any,
  role:string
}
interface ListItem {
  name: string
  stuId: string,
  role:string
}

const list = ref<ListItem[]>([])
const fileArr = ref<any[]>([])
const options = ref<ListItem[]>([])
const value = ref<string[]>([])
const loading = ref(false)
const activeIndex = ref('1')
const load = () => {
console.log("loading")
  const data = {
    stuId : form.stuId,
    myStuId: localStorage.getItem('stuId'),
    startIndex: form.totalCnt,
    pageSize: 10
  }
  axios.get('/chat/getMessageList', {params:data}).then(re => {
    if (re.data.code === 200){
      re.data.data.forEach((data: Chat) => {
        contentDiv.value.push(data);
        console.log("loading" + data)
      })
      form.totalCnt += re.data.data.length
      console.log("loading" + form.totalCnt)
    }else if (form.totalCnt > 10){
      ElMessage.warning(re.data.message)
    }
  })
}
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
  axios.get('/user/getUserList').then(re =>{
    if (re.data.code == 200){
      studentList.value = re.data.data
      list.value = studentList.value.map((item) => {
        return { name: `${item.name}`, stuId: `${item.stuId}`, role: `${item.role}`}
      })
    }
  })
}
const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
  for (let i = 0; i < form.tempFilePath.length; i++) {
    var split = form.tempFilePath[i].split("_")
    //如果传入的文件uid和即将提交的图片数组中的某个uid一致，那么移除此图片
    if (uploadFile.raw && uploadFile.raw.uid === parseInt(split[1])) {
      form.tempFilePath.splice(i, 1);
      form.suffixName.splice(i, 1)
      form.fileName.splice(i, 1)
    }
  }
  getHeight()
}
const handleSelect = (key: Conversation) => {
  form.imgSrc = key.avatar
  form.name = key.name
  form.stuId = key.stuId
  clearUnreadCnt(key.stuId)
  getMessageList(key.stuId)

}
const clearUnreadCnt = (stuId: string) => {
  const data = {
    stuId: stuId,
    myStuId: localStorage.getItem('stuId')
  }
  axios.post('/chat/clearUnreadCnt', data).then(re => {
    if (re.data.code === 200){
      getConversationList()
    }else {
      ElMessage.error(re.data.message)
    }
  })
}
onMounted(() =>{
  window.addEventListener("resize", getHeight);
  connectWebSocket()
})
const getHeight = () => {
  form.getHeight = "height:" + (window.innerHeight - 130) + "px"
  form.getContentHeight = "height:" + (window.innerHeight - 310 - form.tempFilePath.length * 50) + "px"
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

  form.textarea = "";
  form.textarea1 = "";
  // saveMessage(a)
  if (!form.isFile && a == "" || a == null || a == undefined && form.tempFilePath.length === 0){
    ElMessage.error("请先输入")
  }else{
    sendMessage(a)
    form.isFile = false
    form.tempFilePath = [""]
    form.suffixName = [""]
    form.fileName = [""]
    form.fileList = []
  }
  getHeight()
}
const BeforeUpload = (file : any) => {
  if (form.tempFilePath.length > 3){
    ElMessage.warning("一次最多发送三份文件")
    return false;
  }
    if(file){
      const suffix = file.name.substring(file.name.lastIndexOf('.') + 1)
      if (suffix.toLowerCase() !== 'jpg' && suffix.toLowerCase() !== 'png' && suffix.toLowerCase() !== 'jpeg'
          && suffix.toLowerCase() !== 'doc' && suffix.toLowerCase() !== 'docx' && suffix.toLowerCase() !== 'pdf'
          && suffix.toLowerCase() !== 'gif' && suffix.toLowerCase() !== 'svg' && suffix.toLowerCase() !== 'ico'
          && suffix.toLowerCase() !== 'bmp' && suffix.toLowerCase() !== 'xlsx' && suffix.toLowerCase() !== 'ppt'
          && suffix.toLowerCase() !== 'pptx' && suffix.toLowerCase() !== 'xls' && suffix.toLowerCase() !== 'txt'
      ){
        ElMessage.error("不支持上传此格式文件")
        return false;
      }
      beforeUploadFile = file
      form.newFile.append('file',file); //  2. 上传之前，拿到file对象，并将它添加到刚刚定义的FormData对象中。
    }else{
      return false;
    }
}
const Upload = () => {
    axios.post('/nginx/uploadByAction', form.newFile).then(re => {
      if (re.data.code == 200) {
        form.tempFilePath.push( re.data.data.path + "_" + beforeUploadFile.uid )
        console.log(form.tempFilePath)
        form.suffixName.push( re.data.data.suffixName )
        form.fileName.push(beforeUploadFile.name)
        getHeight()
      }else {
        ElMessage.error(re.data.message)
      }
    })
    form.newFile = new FormData()
}
const saveMessage = (content:string) => {
  const data = {
    content: content,
    stuId: form.stuId,
    myStuId: localStorage.getItem('stuId')
  }
  axios.post('/chat/saveMessage', data).then(re => {
    if (re.data.code === 200){
      getMessageList(form.stuId)
      getConversationList()
    }else{
      ElMessage.error(re.data.message)
    }
  })
}
const addConversation = (stuId: string) => {
    const data = {
      stuId: stuId,
      myStuId: localStorage.getItem('stuId')
    }
    axios.post('/chat/createConversation', data).then(re => {
      if (re.data.code === 200){
        ElMessage.success("创建成功")
        getConversationList()
      }else{
        ElMessage.error(re.data.message)
      }
    })
  value.value = []
}
const getConversationList = () => {
  const data = {
    stuId : localStorage.getItem('stuId')
  }
  axios.get('/chat/getMyConversation', {params:data}).then(re => {
    if (re.data.code === 200){
      conversationList.value = re.data.data
    }else{
      ElMessage.error(re.data.message)
    }
  })
}
const getMessageList = (stuId : string) => {
  const data = {
    stuId : stuId,
    myStuId: localStorage.getItem('stuId'),
    //初始化取十条数据
    startIndex: 0,
    pageSize: 10
  }
  axios.get('/chat/getMessageList', {params:data}).then(re => {
    if (re.data.code === 200){
      contentDiv.value = re.data.data;
      form.totalCnt = re.data.data.length
    }else {
      contentDiv.value = [];
      form.totalCnt = 0;
    }
  })
}
let websocket: WebSocket
const sendMessage = (content : string) => {
  // for (var i = 0; i < fileArr.value.length; i++) {
  //   console.log(fileArr.value[i])
  //   form.pictureForm.append("files",fileArr.value[i]);
  // }
  for(let i = 0; i < form.tempFilePath.length; i++){
    const split = form.tempFilePath[i].split("_")
    form.tempFilePath[i] = split[0]
  }
  var socketMsg = {
    tempFilePath: form.tempFilePath,
    suffixName: form.suffixName,
    fileName: form.fileName,
    msg: content,
    toUser: form.stuId,
    isFile:form.isFile,
    fromUser: localStorage.getItem('stuId') };
  // if (this.aisle == "") {
  //   //群聊.
  //   socketMsg.type = 0;
  // } else {
  //   //单聊.
  //   socketMsg.type = 1;
  // }
  console.log(JSON.stringify(socketMsg))
  websocket.send(JSON.stringify(socketMsg));
}
const connectWebSocket = () => {
  console.log("建立连接");
    //判断当前浏览器是否支持WebSocket
    if ("WebSocket" in window) {
      websocket = new WebSocket(
          "ws://127.0.0.1:8084/websocket/" + localStorage.getItem('stuId')
      );
      //连接发生错误的回调方法
      websocket.onerror = function() {
        console.log("error")
      };
      //连接成功建立的回调方法
      websocket.onopen = function(event) {
        console.log("open")
      };
      //接收到消息的回调方法
      // var that = this;
      websocket.onmessage = function(event) {
        var object = eval("(" + event.data + ")");
        if (object.type == 0) {
          console.log("getConversationList");
          conversationList.value = object.myConversation
          // that.showInfo(object.people, object.aisle);
        }
        if (object.type == 1) {
          console.log("getMessageList");
          if(object.toUser === form.stuId){
            const list = object.myMessage as Array<Chat>
            list.forEach((data) => {
              contentDiv.value.unshift(data)
            })
            form.totalCnt += list.length
            console.log("after save loading" + form.totalCnt)
            // console.log(contentDiv.value)
            clearUnreadCnt(form.stuId)
            object.myConversation.forEach((conversation: Conversation ) => {
              if (conversation.stuId === form.stuId){
                conversation.unreadCnt = 0
              }
            })
          }
          conversationList.value = object.myConversation
          // that.messageList.push(object);
        }
      };
      //连接关闭的回调方法
      websocket.onclose = function() {};
      //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
      window.onbeforeunload = function() {
        websocket.close();
      };

    } else {
      alert("不支持建立socket连接");
    }


}

const downloadFile = (url : string, name : string) => {
  const a = document.createElement("a")
  a.setAttribute("href",url)
  a.setAttribute("download",name)
  a.setAttribute("target","_blank")
  let clickEvent = document.createEvent("MouseEvents");
  clickEvent.initEvent("click", true, true);
  a.dispatchEvent(clickEvent);
}
const dataURLtoBlob = (dataurl : any) => {
  let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
const downloadFileByBase64 = (base64 : string ,name : string) => {
  console.log(base64)
  const myBlob = dataURLtoBlob(base64)
  const myUrl = URL.createObjectURL(myBlob)
  downloadFile(myUrl,name)
}
watch(

    () => router.currentRoute.value.path,

    (newValue, oldValue) => {
      // connectWebSocket()
      getHeight()
      getStudentList()
      // getConversationList()
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
  /*margin-right: 88%;*/
}

.name_left {
  margin-left: 10px;
}

.content_right {
  word-wrap: break-word;
  width: 50%;
  text-align: right;
  margin-left: 43%;
  font-size: 13px;
  margin-bottom: 20px;
}


.content_left {
  word-wrap: break-word;
  width: 50%;
  margin-left: 60px;
  font-size: 13px;
  text-align: left;
  margin-bottom: 20px;
}
/*.content_right{*/
/*  position: relative;*/
/*  width: 30%;*/
/*  min-height: 21px;*/
/*  background: var(--el-color-primary-light-9);*/
/*  border-radius: 5px;*/
/*  margin-left: 62%;*/
/*  word-break: break-word;*/
/*  color: black;*/
/*  padding: 7px;*/
/*  text-align: right;*/
/*  font-size: 13px;*/
/*  margin-bottom: 20px;*/
/*}*/
/*.content_right::after {*/
/*  content: "";*/
/*  display: block;*/
/*  position: absolute;*/
/*  width: 0;*/
/*  height: 0;*/
/*  border: 8px solid transparent;*/
/*  border-left-color: var(--el-color-primary-light-9);*/
/*  top: 0px;*/
/*  right: -13px;*/
/*}*/
/*.content_left{*/
/*  position: relative;*/
/*  width: 30%;*/
/*  min-height: 21px;*/
/*  background: var(--el-color-primary-light-9);*/
/*  border-radius: 5px;*/
/*  margin-left: 60px;*/
/*  word-break: break-word;*/
/*  color: black;*/
/*  padding: 7px;*/
/*  text-align: left;*/
/*  font-size: 13px;*/
/*  margin-bottom: 20px;*/
/*}*/
/*.content_left::after {*/
/*  content: "";*/
/*  display: block;*/
/*  position: absolute;*/
/*  width: 0;*/
/*  height: 0;*/
/*  border: 8px solid transparent;*/
/*  border-right-color: var(--el-color-primary-light-9);*/
/*  top: 0px;*/
/*  left: -13px;*/
/*}*/
.url_right {
  margin-left: 93%;
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
  padding-top: 20px;
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
  /*overflow-y: auto;*/
  height: 90%;
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;
}

.talk-message {
  border-top: 1px solid #DCE1E6;
  height: 50px;
  display: flex;
}
.talk-extra{
  height: 10px;
  display: flex;
}
.talk-message-face {
  width: 40px;
  padding-left: 2px;
  /*padding-top: 10px;*/
}
.talk-img{
  width: 100%;
  padding-top: 10px;
}
.talk-message-content {
  padding-top: 20px;
  width: 100%;
  height: 25px;
}

.talk-message-send {
  padding-top: 25px;
  width: 90px;
  /*height: 25px;*/
  display: flex;
  align-items: center;
  justify-content: center;
}
/deep/ .container {
border: none;
  background: none;
}
/deep/ .el-upload {
  display: inline;
  text-align: center;
  cursor: pointer;
  outline: 0;
  border: none;
}

/deep/ .upload-demo {
  display: inline;
  border: none;
}

.btn{
  max-width: 350px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  text-align: left;
  height: auto;
  line-height: 2;
  overflow: hidden;
}
</style>
