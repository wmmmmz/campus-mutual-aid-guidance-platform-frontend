<template>
  <el-col :span="30">
    <el-card shadow="hover">
      <template #header>
        <div class="clearfix">
          <h2>{{form.termChoose}} 可报名授课班级数：{{form.enrollClassCnt}}</h2>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column label="班级名" prop="className" min-width="7%"/>
        <el-table-column label="课程名" prop="courseName" min-width="7%"/>
        <el-table-column label="每周" prop="day" min-width="7%"/>
        <el-table-column label="开始时间" min-width="15%">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon><timer /></el-icon>
              <span style="margin-left: 10px">{{ scope.row.dateList[0] }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" min-width="15%">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon><timer /></el-icon>
              <span style="margin-left: 10px">{{ scope.row.dateList[1] }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="上课地点" prop="classroom" min-width="17%"/>
        <el-table-column align="right" min-width="43%">
          <template #header>
            <el-tree-select v-model="form.termChoose" style="width:205px" :data="termData" :render-after-expand="false" @change="changeTerm()"/>
            &nbsp;
            <el-input v-model="form.search" style="width:200px" placeholder="Type to search" @input="inputChange()"/>
          </template>
            <template #default="scope">
            <el-button @click="form.changeDialogVisible[scope.$index] = true; handleEnroll(scope.row)">报名授课</el-button>

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

// const router = useRoute();

interface Class {
  className: string
  teacherName: string
  teacherClass:string
  teacherWx:string
  teacherTel:string
  classroom: string
  day : string
  studentCnt:bigint
  dateList:[]
  isOnline:string
  status:string
  courseName:string
}

interface termNameList{
  value: string
  label: string
}
const cancelEvent = () => {
  console.log('cancel!')
}

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
  time:[],
  dayChoose:'',
  onlineNumber:'',
  roomChoose:'',
  className:'',
  teacherChoose:'',
  courseChoose:'',
  enrollClassCnt:0
})

interface courseDataList{
  value:string,
  label:string
}
interface roomDataList{
  value:string,
  label:string
}
let courseData = ref<courseDataList>()
let roomData = ref<roomDataList>()
const saveClass = (index: number, row: Class) =>{
  const data = {
    className: form.className,
    teacherName: form.teacherChoose,
    classroom: form.onlineNumber,
    day : form.dayChoose,
    dateList:form.time,
    termName:form.termChoose,
    courseName:form.courseChoose,
  };

  if (!form.isUpdate){
    form.url = '/class/saveClass'
  }else {
    form.url = '/class/updateClass'
  }
  axios.post(form.url, data).then(res =>{
    if (res.data.code == 200){
      if (!form.isUpdate) {
        ElMessage.success("新增成功");
        form.dialogVisible = false
      }
      else{
        ElMessage.success("更新成功");
        form.changeDialogVisible[index] = false
      }
      getClassDataList()
      clearForm()
    }else{
      ElMessage.error(res.data.message)
    }
  })
}
const inputChange = () => {
  getClassDataList()
}
const clearForm = () => {
  form.isUpdate = false
  form.className = ''
  form.onlineNumber = ''
  form.teacherChoose = ''
  form.dayChoose = ''
  form.time = []
  form.courseChoose = ''
}
const handleEnroll = (row : Class) => {
  const data = {
    stuId:localStorage.getItem('stuId'),
    role:localStorage.getItem('role'),
    termName:form.termChoose,
    className:row.className
  }
  axios.post('/teachEnroll/saveTeachEnroll', data).then(re => {
    if (re.data.code == 200){
      ElNotification({
        title: '报名成功',
        message: '您可至\'我的报名\'查看报名进度',
        type: 'success',
      })
    }else{
      ElNotification({
        title: '报名失败',
        message: re.data.message,
        type: 'error',
      })
    }
  })

}
const handleEdit = (index: number, row: Class) => {
  form.isUpdate = true
  form.className = row.className
  form.onlineNumber = row.classroom
  form.teacherChoose = row.teacherName
  form.dayChoose = row.day
  form.time = row.dateList
  form.courseChoose = row.courseName
}
const handleDelete = (index: number, row: Class) => {
  const data = {
    className: row.className,
    termName : form.termChoose
  };
  axios.post('/class/deleteClass', data).then(re => {
    if (re.data.code == 200){
      ElMessage.success('删除成功')
      getClassDataList()
    }else {
      ElMessage.error(re.data.message)
    }
  })
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
let tableData = ref<Class>()
const changeTerm = () => {
  getClassDataList()
}
const getClassDataList = () => {
  const data = {
    termName: form.termChoose,
    query: form.search,
    status: '招募导生中'
  }
  axios.get('/class/getClassByStatus', {params:data}).then(re => {
    if (re.data.code == 200){
      tableData.value = re.data.data
      const enrollClassCnt = re.data.data as Array<Class>
      if (enrollClassCnt == undefined){
        form.enrollClassCnt = 0
      }else {
        form.enrollClassCnt = enrollClassCnt.length
      }
    }
  })
}

watch(

    () => router.currentRoute.value.path,

    (newValue, oldValue) => {

      axios.get('/term/getAllTerm').then(re => {
        termData.value = re.data.data
      })
      getTermToday()
      getClassDataList()
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
