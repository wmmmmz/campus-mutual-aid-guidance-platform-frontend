<template>
  <div>
  <el-col :span="30">
    <el-card shadow="hover">
      <template #header>
        <div class="clearfix">
          <h2>{{form.termChoose}} 可报名上课班级</h2>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column label="班级名" prop="className" min-width="7%" />
        <el-table-column label="课程名" prop="courseName" min-width="7%"/>
        <el-table-column label="每周" prop="day" min-width="7%" />
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
        <el-table-column label="上课地点" prop="classroom" min-width="10%" />
        <el-table-column label="授课老师" min-width="10%">
          <template #default="scope">
            <el-popover effect="light" trigger="hover" placement="top" width="auto">
              <template #default>
                <div>班级: {{ scope.row.teacherClass }}</div>
                <div>电话: {{ scope.row.teacherTel }}</div>
                <div>微信: {{ scope.row.teacherWx }}</div>
              </template>
              <template #reference>
                <el-tag v-if="scope.row.teacherName">{{ scope.row.teacherName }}</el-tag>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column align="right" min-width="50%">
          <template #header>
            <el-tree-select v-model="form.termChoose" style="width:225px" :data="termData" :render-after-expand="false" @change="changeTerm()"/>
            &nbsp;
            <el-input v-model="form.search" style="width:200px" placeholder="Type to search" @input="inputChange()"/>
          </template>
          <template #default="scope">
            <el-button @click="classEnroll(scope.row, scope.$index)" >报名上课</el-button>
          </template>
        </el-table-column>
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
import {ElMessage, ElNotification} from "element-plus";
import { InfoFilled } from '@element-plus/icons-vue'
import {onBeforeRouteUpdate, useRoute} from "vue-router";
import router from "../router";
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
  enrollClassCnt:0,
  newFile:new FormData(),
  tempFilePath:'',
  suffixName:'',
  currentPage:1,
  pageSize:5,
  totalCnt:0
})
const classEnroll = (row : Class, index : number) => {
  const data = {
    stuId: localStorage.getItem('stuId'),
    termName:form.termChoose,
    className:row.className
  }
  axios.post('/classEnroll/saveEnroll', data).then(re => {
    if (re.data.code == 200){
      ElNotification({
        title: '报名成功',
        message: '请在 我的报名 中关注开班信息',
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
const BeforeUpload = (file : any) => {
  if(file){
    form.newFile.append('file',file); //  2. 上传之前，拿到file对象，并将它添加到刚刚定义的FormData对象中。
    console.log(form.newFile.get('file'))
  }else{
    return false;
  }
}
const Upload = () => {
  axios.post('/nginx/uploadByAction', form.newFile).then(re => {
    if (re.data.code == 200) {
      form.tempFilePath = re.data.data.path
      form.suffixName = re.data.data.suffixName
    }else {
      ElMessage.error(re.data.message)
    }
  })
}

const inputChange = () => {
  getClassDataList()
}
const handleEnroll = (row : Class, index : number) => {
  const data = {
    stuId:localStorage.getItem('stuId'),
    role:localStorage.getItem('role'),
    termName:form.termChoose,
    className:row.className,
    filePath: form.tempFilePath,
    suffixName: form.suffixName
  }
  axios.post('/teachEnroll/saveTeachEnroll', data).then(re => {
    form.changeDialogVisible[index] = false
    form.tempFilePath = ''
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
    status: '学生报名中',
    pageSize: form.pageSize,
    pageIndex: form.currentPage
  }
  axios.get('/class/getClassByStatus', {params:data}).then(re => {
    if (re.data.code == 200){
      tableData.value = re.data.data["dataList"]
      form.totalCnt = re.data.data["totalSize"]
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
