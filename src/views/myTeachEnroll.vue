<template>
  <div>
  <el-col :span="30">
    <el-card shadow="hover">
      <template #header>
        <div class="clearfix">
          <h2>我的报名授课进度</h2>
        </div>
      </template>
      <i class="el-icon-lx-calendar"></i>&nbsp;
      <el-tree-select v-model="form.termChoose" style="width:205px" :data="termData" :render-after-expand="false" @change="changeTerm()"/>
      &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <i class="el-icon-lx-search"></i>&nbsp;
      <el-input v-model="form.search" style="width:200px" placeholder="Type to search" @input="inputChange()"/>
      <br><br>
    <el-collapse v-model="form.activeNames" @change="handleChange">
      <div v-for="(data, key) in tableData">
      <el-collapse-item :name="key">
        <template #title>
            <p class="collapse-title">{{data.className}}</p>
          <el-tag  class="ml-2" v-if="data.status == '成为导生'" type="success">{{ data.status }}</el-tag>
          <el-tag  v-else-if="data.status == '安排面试'">{{ data.status }}</el-tag>
          <el-tag  v-else-if="data.status == '面试通过'" type="success">{{ data.status }}</el-tag>
          <el-tag  class="ml-2" v-else-if="data.status == '报名成功'" type="warning">{{ data.status }}</el-tag>
          <el-tag  class="ml-2" v-else-if="data.status == '流程终止'" type="info">{{ data.status }}</el-tag>
          <el-tag  class="ml-2" v-else-if="data.status == '流程中断'" type="info">{{ data.status }}</el-tag>
          &nbsp;
        </template>
        <div style="float: right;text-align: right;width:90%;">
          <el-link  @click="interviewLink(data.interviewLink)" type="primary" v-if="data.active == 2">面试链接</el-link>
          &nbsp;
          <el-link @click="acceptOffer(data.className)" v-if="data.active == 3" type="primary">接收Offer</el-link>
          &nbsp;
          <el-link @click="form.dialogVisible[key] = true" v-if="data.active == 3" type="info">拒绝Offer</el-link>
          <el-dialog v-model="form.dialogVisible[key]" title="拒绝Offer" width="33%" append-to-body = "true">
            <el-form label-width="90px">
              <el-form-item label="原因：">
                <el-input type="text" v-model="form.refuseReason"></el-input>
              </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                  <el-button @click="form.dialogVisible[key] = false">取消</el-button>
                  <el-button type="primary" @click="saveReason(data.className, key)">确认</el-button>
                </span>
            </template>
          </el-dialog>
          &nbsp;
          <el-link type="primary" v-if="data.resumeUrl.length != 0" @click="downloadFileByBase64(data.resumeUrl, form.termChoose + '_' + data.className + '_个人简历' )">下载简历</el-link>
          <br v-if="data.active != 2 && data.active != 3">
        </div>
        <div>
          <el-descriptions>
            <el-descriptions-item label="班级名">{{data.className}}</el-descriptions-item>
            <el-descriptions-item label="课程名">{{data.courseName}}</el-descriptions-item>
            <el-descriptions-item label="每周">{{data.day}}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{data.startTime}}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{data.endTime}}</el-descriptions-item>
            <el-descriptions-item label="上课地点">{{data.classroom}}</el-descriptions-item>
          </el-descriptions>
        </div>
        <br>
        <div>
          <el-steps :active="data.active" finish-status="success" align-center space="40%">
            <el-step title="报名成功" :description="data.enrollDate" :icon="Document" />
            <el-step title="安排面试" :description="data.interviewDate" :icon="User" />
            <el-step title="面试通过" :description="data.passDate" :icon="Check" />
            <el-step title="成为导生" :description="data.successDate" :icon="Finished" />
          </el-steps>
        </div>
      </el-collapse-item>
      </div>
    </el-collapse>
      <el-pagination
          style="justify-content: center; margin-top: 20px"
          v-model:current-page="form.currentPage"
          v-model:page-size="form.pageSize"
          :page-sizes="[5, 10, 20]"
          small="small"
          layout="total, sizes, prev, pager, next, jumper"
          :total="form.totalCnt"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </el-card>
  </el-col>
  </div>
</template>


<script lang="ts" setup>
import {computed, createApp, onMounted, reactive, ref, watch} from 'vue'
import axios from "axios";
import {ElMessage, ElNotification} from "element-plus";
import { Document, User, Check, Finished } from '@element-plus/icons-vue'
import {onBeforeRouteUpdate} from "vue-router";
import router from "../router";
interface TeachEnroll{
  className: string
  classroom: string
  day : string
  startTime:'',
  endTime:'',
  courseName:string,
  interviewLink:'',
  enrollDate:'',
  interviewDate:'',
  successDate:'',
  active:1,
  status:'',
  resumeUrl: '',
  passDate:''
}
const tableData = ref<TeachEnroll>()
let termData = ref<termNameList>()
interface termNameList{
  value: string
  label: string
}
const form = reactive({
  termChoose:'',
  termToday:'',
  search:'',
  activeNames:[],
  refuseReason:'',
  dialogVisible:[false],
  currentPage:1,
  pageSize:5,
  totalCnt:0
})
const handleSizeChange = (val: number) => {
  getTeachEnrollDataList()
  form.activeNames = []
}
const handleCurrentChange = (val: number) => {
  getTeachEnrollDataList()
  form.activeNames = []
}
const handleChange = (val: string[]) => {
  console.log(val)
}
const interviewLink = (link : string) => {
  window.open(link);
}
const saveReason = (className : string, key : number) => {
  const data = {
    termName:form.termChoose,
    className:className,
    studentName: localStorage.getItem('username'),
    reason : form.refuseReason,
    fromAdmin: false
  }
  axios.post('/teachEnroll/updateStatusToInterrupted', data).then(re => {
    if (re.data.code == 200){
      ElNotification({
        title: '拒绝Offer成功',
        message: '',
        type: 'success',
      })
      form.dialogVisible[key] = false
      getTeachEnrollDataList()
    }else {
      ElMessage.error(re.data.message)
    }
  })
}
const getTermToday = () => {
  axios.get('/term/getTermToday').then(re => {
    if (re.data.code == 200){
      form.termToday = re.data.data
      form.termChoose = form.termToday
    }
    else
      form.termToday = '学期不存在'
  })
  console.log(form.termChoose)
  return form.termToday
}
const getTeachEnrollDataList = () => {
  const data = {
    query: form.search,
    termName : form.termChoose,
    stuId : localStorage.getItem('stuId'),
    pageSize: form.pageSize,
    pageIndex: form.currentPage
  }
  axios.get('/teachEnroll/getTeachEnrollDataList', {params:data}).then(re => {
    if (re.data.code == 200){
      tableData.value = re.data.data["dataList"]
      form.totalCnt = re.data.data["totalSize"]
    }
  })
}
const inputChange = () => {
  getTeachEnrollDataList()
}
const changeTerm = () => {
  getTeachEnrollDataList()
  form.activeNames = []
}

const dataURLtoBlob = (dataurl : any) => {
  let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
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

const downloadFileByBase64 = (base64 : string ,name : string) => {
  console.log(base64)
  const myBlob = dataURLtoBlob(base64)
  const myUrl = URL.createObjectURL(myBlob)
  downloadFile(myUrl,name)
}

const acceptOffer = (className : string) => {
  const data = {
    termName:form.termChoose,
    className:className,
    studentName: localStorage.getItem('username'),
  }
  axios.post('/teachEnroll/updateStatusToHired', data).then(re => {
    if (re.data.code == 200){
      ElNotification({
        title: '接收Offer成功',
        message: '请关注后续开班通知\n若您为初次成为导生，系统将自动为您创建导生账号\n请至 我的消息 查看具体账号信息',
        type: 'success',
      })
      getTeachEnrollDataList()
    }else {
      ElMessage.error(re.data.message)
    }
  })
}
watch(

    () => router.currentRoute.value.path,

    (newValue, oldValue) => {
      axios.get('/term/getAllTerm').then(re => {
        termData.value = re.data.data
      })
      getTeachEnrollDataList()
      getTermToday()
    },

    { immediate: true }

);

</script>
<style scoped lang="scss">
.demo-date-picker {
  display: flex;
  width: 100%;
  padding: 0;
  flex-wrap: wrap;
}
.block  .demo-date-picker{
  padding: 30px 0;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  flex: 1;
}
.demo-date-picker .block:last-child {
  border-right: none;
}
.demo-date-picker .demonstration {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}


 .collapse-title {
  flex: 1 0 90%;
  order: 1;

}
</style>
<style scoped>
/deep/ .el-collapse-item__header{
  font-size: 22px;
}
</style>