<template>
  <div>
  <el-col :span="30">
    <el-card shadow="hover">
      <template #header>
        <div class="clearfix">
          <h2>{{form.termChoose}} 我报名的课</h2>
        </div>
      </template>
      <div>
        <i class="el-icon-lx-calendar"></i>&nbsp;
        <el-tree-select v-model="form.termChoose" style="width:225px" :data="termData" :render-after-expand="false" @change="changeTerm()"/>
        &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <i class="el-icon-lx-search"></i>&nbsp;
        <el-input v-model="form.search" style="width:200px" placeholder="Type to search" @input="inputChange()"/>
      </div>
      &nbsp;<br>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column type="expand">
          <template #default="props">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="el-icon-lx-friend"></i>&nbsp;
            <span style="font-size: small">学生列表</span>
            <br>&nbsp;
            <el-table :data="props.row.studentList" border style="width: 80%;margin: auto">
              <el-table-column label="学生姓名" prop="name" min-width="10%"/>
              <el-table-column label="学号" prop="stuId" min-width="15%" />
              <el-table-column label="班级" prop="className" min-width="15%" />
              <el-table-column label="手机号" prop="tel" min-width="15%" />
              <el-table-column label="微信" prop="wx" min-width="15%" />
            </el-table>
            <br>
          </template>
        </el-table-column>
        <el-table-column label="班级名" prop="name" min-width="7%" />
        <el-table-column label="课程名" min-width="7%" >
          <template #default="scope">
            <p>{{scope.row.course.name}}</p>
          </template>
        </el-table-column>
        <el-table-column label="每周" prop="day" min-width="5%" />
        <el-table-column label="开始时间" min-width="11%" >
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon><timer /></el-icon>
              <span style="margin-left: 10px">{{ scope.row.startTime }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" min-width="11%">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon><timer /></el-icon>
              <span style="margin-left: 10px">{{ scope.row.endTime }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="上课地点" min-width="8%" >
          <template #default="scope">
            <p>{{scope.row.room.roomName}}</p>
          </template>
        </el-table-column>
        <el-table-column label="腾讯会议号" min-width="8%" >
          <template #default="scope">
            <p>{{scope.row.tencentMeeting}}</p>
          </template>
        </el-table-column>
        <el-table-column label="授课老师" min-width="8%" >
          <template #default="scope">
            <el-popover effect="light" trigger="hover" placement="top" width="auto">
              <template #default>
                <div v-if="scope.row.user">班级: {{ scope.row.user.className }}</div>
                <div v-if="scope.row.user">电话: {{ scope.row.user.tel }}</div>
                <div v-if="scope.row.user">微信: {{ scope.row.user.wx }}</div>
              </template>
              <template #reference>
                <el-tag v-if="scope.row.user">{{ scope.row.user.name }}</el-tag>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="学生数" prop="studentCnt" min-width="6%" />
      </el-table>
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
import {ElMessage} from "element-plus";
import { InfoFilled } from '@element-plus/icons-vue'
import {onBeforeRouteUpdate, useRoute} from "vue-router";
import router from "../router";

interface Class {
  name: string
  teacherName: string
  teacherClass:string
  teacherWx:string
  teacherTel:string
  classroom: string
  day : string
  studentCnt:number
  dateList:[]
  isOnline:string
  status:string
  courseName:string,
  startTime:never,
  endTime:never,
  studentList:[],
  course:Course,
  room:Room,
  user:User,
  tencentMeeting:string
}
interface User{
  name:string,
  className:string,
  tel:string,
  wx:string
}
interface Course{
  name:string
}
interface Room{
  roomName:string
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
  classCnt:0,
  classUrl:'',
  currentPage:1,
  pageSize:5,
  totalCnt:0
})

interface courseDataList{
  value:string,
  label:string
}
interface roomDataList{
  value:string,
  label:string
}
const classLink = (link : string) => {
  window.open(link);
}
const inputChange = () => {
  getClassDataList()
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
  return form.termToday
}
let tableData = ref<Class>()
const changeTerm = () => {
  getClassDataList()
}
const handleSizeChange = (val: number) => {
  getClassDataList()
}
const handleCurrentChange = (val: number) => {
  getClassDataList()
}
const getClassDataList = () => {
  const data = {
    termName: form.termChoose,
    query: form.search,
    stuId: localStorage.getItem('stuId'),
    role: localStorage.getItem('role'),
    pageSize: form.pageSize,
    pageIndex: form.currentPage
  }
  axios.get('/class/getClassDataList', {params:data}).then(re => {
    if (re.data.code == 200){
      tableData.value = re.data.data["dataList"]
      form.totalCnt = re.data.data["totalSize"]
      const classCnt = re.data.data["dataList"] as Array<Class>
      classCnt.forEach((data =>{
        const userList = data.studentList as Array<User>
        data.studentCnt = userList.length
      }))
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

</style>
