<template>
  <el-col :span="30">
    <el-card shadow="hover">
      <template #header>
        <div class="clearfix">
          <h2>{{form.termChoose}} 已开设班级数：{{form.classCnt}}</h2>
        </div>
      </template>
      <div>
        <i class="el-icon-lx-calendar"></i>&nbsp;
        <el-tree-select v-model="form.termChoose" style="width:205px" :data="termData" :render-after-expand="false" @change="changeTerm()"/>
        &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <i class="el-icon-lx-search"></i>&nbsp;
        <el-input v-model="form.search" style="width:200px" placeholder="Type to search" @input="inputChange()"/>
        &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <i class="el-icon-lx-friend"></i>&nbsp;
        <el-button @click="form.dialogVisible = true; handleNew()">新增班级</el-button>
        <el-dialog v-model="form.dialogVisible" title="新增班级" width="33%" append-to-body = "true">
          <el-form label-width="90px">
            <el-form-item label="班级名：">
              <el-input type="text" style="width:205px" v-model="form.className"></el-input>
            </el-form-item>
            <el-form-item label="课程名：">
              <el-tree-select v-model="form.courseChoose" style="width:205px" :data="courseData" :render-after-expand="false" />
            </el-form-item>
            <el-form-item label="每周：">
              <el-tree-select v-model="form.dayChoose" style="width:205px" :data="dayData" :render-after-expand="false" @change="changeDay()"/>
            </el-form-item>
            <el-form-item label="始末时间：">
              <div class="block">
                <el-time-picker
                    v-model="form.time"
                    is-range
                    range-separator="-"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    value-format='HH:mm:ss'
                    @change="changeTime()"
                />
              </div>
            </el-form-item>
            <el-form-item label="上课形式：">
              <el-select v-model="form.onlineNumber" placeholder="Select">
                <el-option
                    v-for="item in roomData"
                    :key="item.value"
                    :label="item.label"
                    :value="item.label"
                >
                  <span style="float: left">{{ item.label }}</span>
                  <span
                      style="
          float: right;
          color: var(--el-text-color-secondary);
          font-size: 13px;
        "
                  >{{ item.value }}</span
                  >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="授课老师：">
              <el-tree-select v-model="form.teacherChoose" style="width:205px" :data="teacherData" :render-after-expand="false" />
            </el-form-item>
          </el-form>
          <template #footer>
                <span class="dialog-footer">
                  <el-button @click="form.dialogVisible = false">取消</el-button>
                  <el-button type="primary" @click="saveClass()">确认</el-button>
                </span>
          </template>
        </el-dialog>
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
        <el-table-column label="上课地点" prop="classroom" min-width="8%"/>
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
        <el-table-column label="学生数" prop="studentCnt" min-width="6%"/>
        <el-table-column
            prop="status"
            label="开班状态"
            min-width="11%"
            :filters="[
        { text: '招募导生中', value: '招募导生中' },
        { text: '学生报名中', value: '学生报名中' },
        { text: '招募导生完成', value: '招募导生完成' },
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
            <el-button v-if="scope.row.status == '招募导生完成'" plain @click="changeStatus(scope.row, '招募学生中')">开始招募学生</el-button>
            <el-button v-if="scope.row.status == '招募学生中'" @click="changeStatus(scope.row, '招募学生完成')">停止招募学生</el-button>
            <el-button v-if="scope.row.status == '招募学生完成'" @click="changeStatus(scope.row, '已开班')">开班</el-button>
            <el-button v-if="scope.row.status != '已开班'" @click="form.changeDialogVisible[scope.$index] = true; handleEdit(scope.$index, scope.row)">修改</el-button>
            <el-dialog v-model="form.changeDialogVisible[scope.$index]" title="修改班级信息" width="37%" append-to-body = "true">
              <el-form label-width="90px">
                <el-form-item label="班级名：">{{form.className}}</el-form-item>
                <el-form-item label="课程名：">
                  <el-tree-select v-model="form.courseChoose" style="width:205px" :data="courseData" :render-after-expand="false" />
                </el-form-item>
                <el-form-item label="每周：">
                  <el-tree-select v-model="form.dayChoose" style="width:205px" :data="dayData" @change="changeDayInEdit(scope.row)" :render-after-expand="false" />
                </el-form-item>
                <el-form-item label="始末时间：">
                  <div class="block">
                    <el-time-picker
                        v-model="form.time"
                        is-range
                        range-separator="-"
                        start-placeholder="开始时间"
                        end-placeholder="结束时间"
                        value-format='HH:mm:ss'
                        @change="changeTimeInEdit(scope.row)"
                    />
                  </div>
                </el-form-item>
                <el-form-item label="上课形式：">
                  <el-select v-model="form.onlineNumber" placeholder="Select">
                    <el-option
                        v-for="item in roomData"
                        :key="item.value"
                        :label="item.label"
                        :value="item.label"
                    >
                      <span style="float: left">{{ item.label }}</span>
                      <span
                          style="
          float: right;
          color: var(--el-text-color-secondary);
          font-size: 13px;
        "
                      >{{ item.value }}</span
                      >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="授课老师：">
                  <el-tree-select v-model="form.teacherChoose" style="width:205px" :data="teacherData" :render-after-expand="false" />
                </el-form-item>
                <el-form-item label="学生数：">{{scope.row.studentCnt}}</el-form-item>
              </el-form>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="form.changeDialogVisible[scope.$index] = false, clearForm()">取消</el-button>
                  <el-button type="primary" @click="saveClass(scope.$index, scope.row)">确认</el-button>
                </span>
              </template>
            </el-dialog>
            <el-popconfirm
                confirm-button-text="是"
                confirm-button-type="danger"
                cancel-button-text="否"
                :icon="InfoFilled"
                icon-color="#ff0000"
                title="确定删除此班级所有相关数据吗"
                @confirm="handleDelete(scope.$index, scope.row)"
                @cancel="cancelEvent"
                v-if="scope.row.status != '已开班'"
            >
              <template #reference>
                <el-button type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </el-col>

</template>

<script lang="ts" setup>
import {computed, createApp, onMounted, reactive, ref, watch} from 'vue'
import axios from "axios";
import {ElMessage} from "element-plus";
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
  classCnt:0
})

const dayData = [
  {value:'一'},
  {value:'二'},
  {value:'三'},
  {value:'四'},
  {value:'五'},
  {value:'六'},
  {value:'日'},
]
const teacherData = [
  {value:'王萌哲'},
  {value:'王萌哲'},
]
const filterTag = (value: string, row: Class) => {
  return row.status === value
}
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
const changeStatus = (row : Class, status : string) => {
  const data = {
    className: row.className,
    termName : form.termChoose,
    status : status
  }
  axios.post('/class/changeStatus', data).then(re => {
    if (re.data.code == 200){
      ElMessage.success('修改状态成功')
      getClassDataList()
    }else {
      ElMessage.error(re.data.message)
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
const handleNew = () => {
  clearForm()
}
const handleEdit = (index: number, row: Class) => {
  form.isUpdate = true
  form.className = row.className
  form.onlineNumber = row.classroom
  form.teacherChoose = row.teacherName
  form.dayChoose = row.day
  form.time = row.dateList
  form.courseChoose = row.courseName
  getFreeRoomData(row.className)
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
  getCourseData()
  getFreeRoomData("")
}
const changeTime = () => {
  getFreeRoomData("")
}
const changeDay = () => {
  getFreeRoomData("")
}
const changeTimeInEdit = (row : Class) => {
  getFreeRoomData(row.className)
}
const changeDayInEdit = (row : Class) => {
  getFreeRoomData(row.className)
}
const getClassDataList = () => {
  const data = {
    termName: form.termChoose,
    query: form.search
  }
  axios.get('/class/getClassDataList', {params:data}).then(re => {
    if (re.data.code == 200){

      tableData.value = re.data.data
      const classCnt = re.data.data as Array<Class>
      if (classCnt == undefined){
        form.classCnt = 0
      }else {
        form.classCnt = classCnt.length
      }
    }
  })
}

const getCourseData = () => {
  const data = {
    termName:form.termChoose
  }
  axios.get('/course/getCourseByTerm', {params:data}).then(re => {
    if (re.data.code == 200){
      courseData.value = re.data.data
    }
  })
}
const getFreeRoomData = (className : string) => {
  const data = {
    start:form.time[0],
    end:form.time[1],
    termName:form.termChoose,
    day:form.dayChoose,
    className:className
  }

  axios.get('/room/getFreeRoomByTerm', {params:data}).then(re => {
    if (re.data.code == 200){
      roomData.value = re.data.data
      let roomExist = false
      re.data.data.forEach((room: any) => {
        if (room.label == form.onlineNumber){
          roomExist = true
        }
      })
      if (!roomExist){
        form.onlineNumber = ''
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
      getCourseData()
      getClassDataList()
      getFreeRoomData("")
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
