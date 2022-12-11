<template>
  <div>
  <el-col :span="30">
    <el-card shadow="hover">
      <template #header>
        <div class="clearfix">
          <h2>{{form.termChoose}} 已报名上课班级</h2>
        </div>
      </template>
      <div>
        <i class="el-icon-lx-calendar"></i>&nbsp;
        <el-tree-select v-model="form.termChoose" style="width:205px" :data="termData" :render-after-expand="false" @change="changeTerm()"/>
        &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <i class="el-icon-lx-search"></i>&nbsp;
        <el-input v-model="form.search" style="width:200px" placeholder="Type to search" @input="inputChange()"/>
      </div>
      &nbsp;<br>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column label="班级名" prop="className" min-width="7%"/>
        <el-table-column label="课程名" prop="courseName" min-width="7%"/>
        <el-table-column label="每周" prop="day" min-width="5%"/>
        <el-table-column label="开始时间" min-width="11%">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon><timer /></el-icon>
              <span style="margin-left: 10px">{{ scope.row.dateList[0] }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" min-width="11%">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon><timer /></el-icon>
              <span style="margin-left: 10px">{{ scope.row.dateList[1] }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="上课地点" min-width="8%">
          <template #default="scope">
          <el-link type="primary" v-if="scope.row.classroom == '腾讯会议'" @click="classroomLink(scope.row.tencentMeetingUrl)">{{ scope.row.classroom }}</el-link>
          <el-link v-else>{{ scope.row.classroom }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="腾讯会议号" prop="tencentMeeting" min-width="10%"/>
        <el-table-column label="授课老师" min-width="8%">
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
        <el-table-column label="学生数" prop="studentCnt" min-width="7%"/>
        <el-table-column
            prop="status"
            label="开班状态"
            min-width="11%"
            :filters="[
        { text: '学生报名中', value: '学生报名中' },
        { text: '学生报名截止', value: '学生报名截止' },
        { text: '已开班', value: '已开班' },
      ]"
            :filter-method="filterTag"
            filter-placement="bottom-end"
        >
          <template #default="scope">
            <el-tag
                :type="scope.row.status === '已开班' ? 'success' : ''"
                disable-transitions
            >{{ scope.row.status }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column align="right" min-width="25%">
          <template #default="scope">
            <el-popconfirm
                confirm-button-text="是"
                confirm-button-type="danger"
                cancel-button-text="否"
                :icon="InfoFilled"
                icon-color="#ff0000"
                title="确定取消报名吗"
                @confirm="handleDelete(scope.$index, scope.row)"
                @cancel="cancelEvent"
                v-if="scope.row.status != '已开班'"
            >
              <template #reference>
                <el-button type="danger">取消报名</el-button>
              </template>
            </el-popconfirm>
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
import {ElMessage} from "element-plus";
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
  courseName:string,
  tencentMeeting:string,
  tencentMeetingUrl:string
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
  currentPage:1,
  pageSize:5,
  totalCnt:0
})
const filterTag = (value: string, row: Class) => {
  return row.status === value
}
const handleSizeChange = (val: number) => {
  getClassDataList()
}
const handleCurrentChange = (val: number) => {
  getClassDataList()
}
const inputChange = () => {
  getClassDataList()
}
const classroomLink = (link : string) => {
  window.open(link);
}
const handleDelete = (index: number, row: Class) => {
  const data = {
    className: row.className,
    termName : form.termChoose,
    stuId: localStorage.getItem('stuId')
  };
  axios.post('/classEnroll/deleteClassEnroll', data).then(re => {
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
    stuId: localStorage.getItem('stuId'),
    pageSize: form.pageSize,
    pageIndex: form.currentPage
  }
  axios.get('/classEnroll/getClassEnrollDataList', {params:data}).then(re => {
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
