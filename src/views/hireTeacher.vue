<template>
  <el-col :span="30">
    <el-card shadow="hover">
      <template #header>
        <div class="clearfix">
          <h2>{{form.termChoose}} 报名授课学生数：{{form.enrollTeacherCnt}}</h2>
        </div>
      </template>
      <i class="el-icon-lx-calendar"></i>&nbsp;
      <el-tree-select v-model="form.termChoose" style="width:205px" :data="termData" :render-after-expand="false" @change="changeTerm()"/>
      &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <i class="el-icon-lx-search"></i>&nbsp;
      <el-input v-model="form.search" style="width:200px" placeholder="Type to search" @input="inputChange()"/>
      <br><br>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column label="报名学生" min-width="10%">
          <template #default="scope">
            <el-popover effect="light" trigger="hover" placement="top" width="auto">
              <template #default>
                <div>班级: {{ scope.row.studentClass }}</div>
                <div>电话: {{ scope.row.studentTel }}</div>
                <div>微信: {{ scope.row.studentWx }}</div>
              </template>
              <template #reference>
                <el-tag v-if="scope.row.studentName">{{ scope.row.studentName }}</el-tag>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="班级名" prop="className" min-width="10%"/>
        <el-table-column label="课程名" prop="courseName" min-width="10%"/>
        <el-table-column label="每周" prop="day" min-width="7%"/>
        <el-table-column label="开始时间" min-width="15%">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon><timer /></el-icon>
              <span style="margin-left: 10px">{{ scope.row.startTime }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" min-width="15%">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon><timer /></el-icon>
              <span style="margin-left: 10px">{{ scope.row.endTime }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="上课地点" prop="classroom" min-width="15%"/>
        <el-table-column
            prop="status"
            label="报名状态"
            min-width="15%"
            :filters="[
        { text: '报名成功', value: '报名成功' },
        { text: '安排面试', value: '安排面试' },
        { text: '成为导生', value: '成为导生' },
        { text: '流程终止', value: '流程终止' },
      ]"
            :filter-method="filterTag"
            filter-placement="bottom-end"
        >
          <template #default="scope">
            <el-tag
                :type="scope.row.status === '成为导生' ? 'success' : ''"
                disable-transitions
            >{{ scope.row.status }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column align="right" min-width="43%">
          <template #default="scope">
            <el-button @click="downloadFileByBase64(scope.row.resumeUrl, scope.row.studentName + '_' + form.termChoose + '_' + scope.row.className + '_个人简历')" >下载简历</el-button>
            <el-button @click="form.changeDialogVisible[scope.$index] = true, handleChange(scope.row)">修改状态</el-button>
            <el-dialog v-model="form.changeDialogVisible[scope.$index]" title="修改状态" width="33%" append-to-body = "true">
              <el-form label-width="90px">
                <el-form-item label="报名学生：">{{scope.row.studentName}}</el-form-item>
                <el-form-item label="授课班级：">{{scope.row.className}}</el-form-item>
                <el-form-item label="报名状态：">
                  <el-select v-model="form.statusChoose">
                    <el-option
                        v-for="item in statusData"
                        :key="item.value"
                        :label="item.value"
                        :value="item.value"
                        :disabled="item.disabled"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item v-if="form.statusChoose == '安排面试'" label="面试时间：">
                  <el-date-picker
                      v-model="form.time"
                      type="datetimerange"
                      range-separator="-"
                      start-placeholder="开始时间"
                      end-placeholder="结束时间"
                      value-format='YYYY-MM-DD HH:mm:ss'

                  />
                </el-form-item>
                <el-form-item v-if="form.statusChoose == '安排面试'" label="会议号：">
                  <el-input v-model="form.interViewUrl" style="width: 260px" placeholder="请输入预定的会议号"></el-input>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <el-link @click="interviewLink('https://meeting.tencent.com/user-center/user-meeting-list/schedule')"
                           type="primary" >点击预定会议</el-link>
                </el-form-item>
                <el-form-item v-if="form.statusChoose == '成为导生'" class="blueItem" label="提示：">
                  <p style="color: #2d8cf0">系统将自动为该同学创建导生账号，并发送提醒通知</p>
                </el-form-item>
                <el-form-item v-if="form.statusChoose == '面试通过'" class="blueItem" label="提示：">
                  <p style="color: #2d8cf0">系统将自动向该同学发送确认offer通知<br>请关注 我的消息 查看学生选择结果。</p>
                </el-form-item>
              </el-form>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="form.changeDialogVisible[scope.$index] = false">取消</el-button>
                  <el-button type="primary" @click="handleEnroll(scope.row, scope.$index)">确认</el-button>
                </span>
              </template>
            </el-dialog>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </el-col>

</template>

<script lang="ts" setup>
import {computed, createApp, onMounted, reactive, ref, watch} from 'vue'
import axios from "axios";
import {ElMessage, ElNotification} from "element-plus";
import { InfoFilled } from '@element-plus/icons-vue'
import {onBeforeRouteUpdate, useRoute} from "vue-router";
import router from "../router";
interface TeachEnroll {
  className: string
  studentName: string
  studentClass:string
  studentWx:string
  studentTel:string
  classroom: string
  day : string
  studentCnt:bigint
  startTime:never
  endTime:never
  isOnline:string
  status:string
  courseName:string
  resumeUrl:string,
  interviewStartTime:never,
  interviewEndTime:never,
  interviewLink:string
}

interface termNameList{
  value: string
  label: string
}
const cancelEvent = () => {
  console.log('cancel!')
}
const filterTag = (value: string, row: TeachEnroll) => {
  return row.status === value
}
const interviewLink = (link : string) => {
  window.open(link);
}
let statusData = [
  {value:'报名成功', disabled:false},
  {value:'安排面试', disabled:false},
  {value:'面试通过', disabled:false},
  {value:'成为导生', disabled:false},
  {value:'流程终止', disabled:false},
]
const form = reactive({
  dialogVisible : false,
  changeDialogVisible : [false],
  init : '',
  isUpdate: false,
  url:'',
  search:'',
  termToday:'',
  termChoose: '',
  courseCnt:0,
  originalCourseName :'',
  time: [],
  dayChoose:'',
  onlineNumber:'',
  roomChoose:'',
  className:'',
  teacherChoose:'',
  courseChoose:'',
  enrollTeacherCnt:0,
  newFile:new FormData(),
  tempFilePath:'',
  suffixName:'',
  statusChoose:'',
  interViewUrl:''
})
const handleChange = (row : TeachEnroll) => {
  statusData.forEach((stats : any) => {
      stats.disable = false
  })
  form.statusChoose = row.status
  if (form.statusChoose == '安排面试'){
    statusData.forEach((stats : any) => {
      if (stats.value == '报名成功')
      stats.disabled = true
    })
  }else if(form.statusChoose == '成为导生'){
    statusData.forEach((stats : any) => {
      if (stats.value == '报名成功' || stats.value == '安排面试' || stats.value == '流程终止')
        stats.disabled = true
      console.log(stats.value+ stats.disabled)
    })
  }else if(form.statusChoose == '流程终止'){
    statusData.forEach((stats : any) => {
      if (stats.value == '报名成功' || stats.value == '安排面试' || stats.value == '成为导生')
        stats.disabled = true
    })
  }
  form.time[0] = row.interviewStartTime
  form.time[1] = row.interviewEndTime
  if (row.interviewLink)
    form.interViewUrl = row.interviewLink.substring(row.interviewLink.length - 9, row.interviewLink.length)
  else
    form.interViewUrl = ''
  console.log(form.interViewUrl)
}
const inputChange = () => {
  getTeachEnrollDataList()
}
const handleEnroll = (row : TeachEnroll, index : number) => {
  const data = {
    termName:form.termChoose,
    className:row.className,
    studentName: row.studentName,
    interviewLink : form.interViewUrl,
    startTime : form.time[0],
    endTime: form.time[1]
  }
  if (form.statusChoose == '安排面试'){
    axios.post('/teachEnroll/updateStatusToArrangeInterview', data).then(re => {
      if (re.data.code == 200){
        ElNotification({
          title: '修改状态成功',
          message: '系统将自动给该学生发送面试流程更新通知',
          type: 'success',
        })
        form.changeDialogVisible[index] = false
        getTeachEnrollDataList()
      }else {
        ElMessage.error(re.data.message)
      }
    })
  }else if (form.statusChoose == '成为导生'){
    axios.post('/teachEnroll/updateStatusToHired', data).then(re => {
      if (re.data.code == 200){
        ElNotification({
          title: '修改状态成功',
          message: '系统将自动给该学生发送面试流程更新通知',
          type: 'success',
        })
        form.changeDialogVisible[index] = false
        getTeachEnrollDataList()
      }else {
        ElMessage.error(re.data.message)
      }
    })
  }else if (form.statusChoose == '面试通过'){
    axios.post('/teachEnroll/updateStatusToPassed', data).then(re => {
      if (re.data.code == 200){
        ElNotification({
          title: '修改状态成功',
          message: '系统将自动给该学生发送面试流程更新通知',
          type: 'success',
        })
        form.changeDialogVisible[index] = false
        getTeachEnrollDataList()
      }else {
        ElMessage.error(re.data.message)
      }
    })
  }

}
let termData = ref<termNameList>()

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
let tableData = ref<TeachEnroll>()
const changeTerm = () => {
  getTeachEnrollDataList()
}

const getTeachEnrollDataList = () => {
  const data = {
    query: form.search,
    termName : form.termChoose,
  }
  axios.get('/teachEnroll/getTeachEnrollDataList', {params:data}).then(re => {
    if (re.data.code == 200){
      tableData.value = re.data.data
      const enrollTeacherCnt = re.data.data as Array<TeachEnroll>
      if (enrollTeacherCnt == undefined){
        form.enrollTeacherCnt = 0
      }else {
        form.enrollTeacherCnt = enrollTeacherCnt.length
      }
    }
  })
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

watch(

    () => router.currentRoute.value.path,

    (newValue, oldValue) => {

      axios.get('/term/getAllTerm').then(re => {
        termData.value = re.data.data
      })
      getTermToday()
      getTeachEnrollDataList()
    },

    { immediate: true }

);

</script>
<style scoped>
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
</style>
<style>
.blueItem .el-form-item__label{
  color: #2d8cf0;
}
</style>