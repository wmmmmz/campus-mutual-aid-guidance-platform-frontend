<template>
  <div>
  <el-col :span="30">
    <el-card shadow="hover">
      <template #header>
        <div class="clearfix">
          <h2>我的课表</h2>
        </div>
      </template>
      <div>
        <i class="el-icon-lx-calendar"></i>&nbsp;
        <el-tree-select v-model="form.termChoose" style="width:225px" :data="termData" :render-after-expand="false" @change="changeTerm()"/>
      </div>
      &nbsp;<br>
      <el-table class="tableBox" border :cell-style="cellStyle" :data="tableData"   style="width: 100%">
        <el-table-column align="center" label="" prop="time" min-width="13%"/>
        <el-table-column align="center" label="周一" min-width="13%">
          <template #default="scope">
            <p style="font-size: large">{{scope.row.mondayClass}}</p>
            <p>{{scope.row.mondayRoom}}</p>
            <p v-if="scope.row.mondayRoom === '腾讯会议'">{{scope.row.mondayTencent}}</p>
          </template>
        </el-table-column>
        <el-table-column align="center" label="周二" min-width="13%">
          <template #default="scope">
            <p style="font-size: large">{{scope.row.tuesdayClass}}</p>
            <p>{{scope.row.tuesdayRoom}}</p>
            <p v-if="scope.row.tuesdayRoom === '腾讯会议'">{{scope.row.tuesdayTencent}}</p>
          </template>
        </el-table-column>
        <el-table-column align="center" label="周三" min-width="13%">
          <template #default="scope">
            <p style="font-size: large" >{{scope.row.wednesdayClass}}</p>
            <p>{{scope.row.wednesdayRoom}}</p>
            <p v-if="scope.row.wednesdayRoom === '腾讯会议'">{{scope.row.wednesdayTencent}}</p>
          </template>
        </el-table-column>
        <el-table-column align="center" label="周四" min-width="13%">
          <template #default="scope">
            <p style="font-size: large">{{scope.row.thursdayClass}}</p>
            <p>{{scope.row.thursdayRoom}}</p>
            <p v-if="scope.row.thursdayRoom === '腾讯会议'">{{scope.row.thursdayTencent}}</p>
          </template>
        </el-table-column>
        <el-table-column align="center" label="周五" min-width="13%">
          <template #default="scope">
            <p style="font-size: large">{{scope.row.fridayClass}}</p>
            <p>{{scope.row.fridayRoom}}</p>
            <p v-if="scope.row.fridayRoom === '腾讯会议'">{{scope.row.fridayTencent}}</p>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </el-col>
  </div>
</template>

<script lang="ts" setup>
import {reactive, ref, watch} from 'vue'
import axios from "axios";
import {ElMessage} from "element-plus";
import router from "../router";
import type {ElTableColumn } from "element-plus"
import {TableColumnCtx} from "element-plus/es/components/table/src/table-column/defaults";
interface SpanMethodProps {
  row: table
  column: TableColumnCtx<table>
  rowIndex: number
  columnIndex: number
}
const cellStyle = ({
                     row,
                     column,
                     rowIndex,
                     columnIndex,
                   }: SpanMethodProps) => {
  if (columnIndex == 1 && form.ClassData[rowIndex].mondayClass
      || columnIndex == 2 && form.ClassData[rowIndex].tuesdayClass
      || columnIndex == 3 && form.ClassData[rowIndex].wednesdayClass
      || columnIndex == 4 && form.ClassData[rowIndex].thursdayClass
      || columnIndex == 5 && form.ClassData[rowIndex].fridayClass){
    return {
      background: 'var(--el-color-primary-light-9)',
      borderColour : 'black'
    }
  } else if (columnIndex == 0){
    return {
      background: 'white' ,borderColour : 'black'
    }
  }else{
    return {
      borderColour : 'black'
    }
  }
}

interface table {
  time : string,
  mondayClass : '',
  mondayRoom : string,
  mondayTencent : string,
  tuesdayClass : string,
  tuesdayRoom : string,
  tuesdayTencent : string,
  wednesdayClass : string,
  wednesdayRoom : string,
  wednesdayTencent : string,
  thursdayClass : string,
  thursdayRoom : string,
  thursdayTencent : string,
  fridayClass : string,
  fridayRoom : string,
  fridayTencent : string,
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
  ClassData: new Array<table>
})
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
let tableData = ref<table>()
const changeTerm = () => {
  getClassDataList()
}

const getClassDataList = () => {
  let data = {
    term: form.termChoose,
    stuId: localStorage.getItem('stuId'),
    role: localStorage.getItem('role')
  }
  axios.get('/classEnroll/getClassTimeTable', {params:data}).then(re => {
    if (re.data.code == 200){
      tableData.value = re.data.data
      form.ClassData = re.data.data as Array<table>
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

<style lang="scss">
.tableBox {

  th {
    padding: 0 !important;
    background: white !important;
    height: 50px;
    line-height: 90px;
    //border-left: 1px solid black;
  }
  td {
    padding: 0 !important;
    height: 90px;
    line-height: 48px;
    //border-top: 1px solid black;
    //border-left: 1px solid black;
  }
}

</style>
<style scoped>
.el-table {
  border: 1px solid black;
}
::v-deep .el-table th {
  border-color: black !important;
}
::v-deep .el-table td {
  border-color: black !important;
}

</style>
<style>
::v-deep .el-table--group,
::v-deep .el-table--border {
  border: black !important;
}
</style>