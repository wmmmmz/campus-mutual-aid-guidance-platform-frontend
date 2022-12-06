<template>
  <div>
  <el-col :span="30">
    <el-card shadow="hover">
      <template #header>
        <div class="clearfix">
          <h2>{{form.termChoose}} 已开设课程数：{{form.courseCnt}}</h2>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column label="课程名" prop="courseName" min-width="20%"/>
        <el-table-column label="开设班级数" prop="classCnt" min-width="15%"/>
        <el-table-column align="right" min-width="65%">
          <template #header>
            学期选择：
            <el-tree-select v-model="form.termChoose" style="width:205px" :data="termData" :render-after-expand="false" @change="changeTerm()"/>
            &nbsp;
            <el-input v-model="form.search" style="width:200px" placeholder="Type to search" @input="inputChange()"/>
            &nbsp;
            <el-button @click="form.dialogVisible = true; handleNew()">新增课程</el-button>
            <el-dialog v-model="form.dialogVisible" title="新增学期" width="33%" append-to-body = "true">
              <el-form label-width="90px">
                <el-form-item label="学期名：">{{form.termChoose}}</el-form-item>
                <el-form-item label="课程名：">
                  <el-input type="text" v-model="form.init"></el-input>
                </el-form-item>
              </el-form>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="form.dialogVisible = false">取消</el-button>
                  <el-button type="primary" @click="saveCourse()">确认</el-button>
                </span>
              </template>
            </el-dialog>
          </template>
          <template #default="scope">
            <el-button v-if="scope.row.classCnt == 0" @click="form.changeDialogVisible[scope.$index] = true; handleEdit(scope.$index, scope.row)">修改</el-button>
            <el-dialog v-model="form.changeDialogVisible[scope.$index]" title="修改课程信息" width="33%" append-to-body = "true">
              <el-form label-width="90px">
                <el-form-item label="学期名：">{{form.termChoose}}</el-form-item>
                <el-form-item label="课程名：">
                  <el-input type="text" v-model="form.init"></el-input>
                </el-form-item>
              </el-form>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="form.changeDialogVisible[scope.$index] = false">取消</el-button>
                  <el-button type="primary" @click="saveCourse(scope.$index, scope.row)">确认</el-button>
                </span>
              </template>
            </el-dialog>
            <el-popconfirm
                v-if="scope.row.classCnt == 0"
                confirm-button-text="是"
                confirm-button-type="danger"
                cancel-button-text="否"
                :icon="InfoFilled"
                icon-color="#ff0000"
                title="确定删除此课程所有相关数据吗"
                @confirm="handleDelete(scope.$index, scope.row)"
                @cancel="cancelEvent"
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
  </div>
</template>

<script lang="ts" setup>
import {computed, createApp, onMounted, reactive, ref, watch} from 'vue'
import axios from "axios";
import {ElMessage} from "element-plus";
import { InfoFilled } from '@element-plus/icons-vue'
import {onBeforeRouteUpdate, useRoute} from "vue-router";
import router from "../router";

// const router = useRoute();

interface Course {
  courseName: string
  classCnt: bigint
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
  originalCourseName :''
})
const saveCourse = (index: number, row: Course) =>{
  const data = {
    courseName: form.init,
    termName : form.termChoose,
    originalCourseName : originalCourseName
  };

  if (!form.isUpdate){
    form.url = '/course/saveCourse'
  }else {
    form.url = '/course/updateCourse'
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
        getCourseDataList()
      }else{
        ElMessage.error(res.data.message)
      }
    })
}
const inputChange = () => {
  getCourseDataList()
}
const handleNew = () => {
  form.init = ''
  form.isUpdate = false
}
let originalCourseName = ''
const handleEdit = (index: number, row: Course) => {
  form.init = row.courseName
  form.isUpdate = true
  originalCourseName = row.courseName
}
const handleDelete = (index: number, row: Course) => {
  const data = {
    courseName: row.courseName,
    termName : form.termChoose
  };
  axios.post('/course/deleteCourse', data).then(re => {
    if (re.data.code == 200){
      ElMessage.success('删除成功')
      getCourseDataList()
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
let tableData = ref<Course>()
const changeTerm = () => {
  getCourseDataList()
}
const getCourseDataList = () => {
  const data = {
    termName: form.termChoose,
    query: form.search
  }
  axios.get('/course/getCourseDataList', {params:data}).then(re => {
    if (re.data.code == 200){
      tableData.value = re.data.data
      const courseCnt = re.data.data as Array<Course>
      if (courseCnt == undefined){
        form.courseCnt = 0
      }else {
        form.courseCnt = courseCnt.length
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
      getCourseDataList()
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
