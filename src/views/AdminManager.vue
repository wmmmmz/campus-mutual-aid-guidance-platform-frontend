<template>
  <div>
    <el-col :span="30">
      <el-card shadow="hover">
        <template #header>
          <div class="clearfix">
            <h2>管理员列表</h2>
          </div>
        </template>
        <el-table :data="tableData" style="width: 100%">
          <el-table-column label="姓名" prop="name" min-width="15%"/>
          <el-table-column label="班级" prop="className" min-width="10%"/>
          <el-table-column label="学号" prop="stuId" min-width="10%"/>
          <el-table-column label="联系电话" prop="tel" min-width="10%"/>
          <el-table-column label="微信" prop="wx" min-width="10%"/>
          <el-table-column align="right" min-width="25%">
            <template #header>
              <el-input v-model="form.search" style="width:200px" placeholder="Type to search" @input="inputChange()"/>
              &nbsp;
              <el-button @click="form.dialogVisible = true; handleNew()">新增管理员</el-button>
              <el-dialog v-model="form.dialogVisible" title="新增管理员" width="33%" append-to-body = "true">
                <el-form label-width="90px">
                  <el-form-item label="选择学生：">
                    <el-select
                        v-model="value"
                        multiple
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
                          :label="`${item.stuId}` + '_' + `${item.name}`"
                          :value="item.stuId"
                      />
                    </el-select>
                  </el-form-item>
                </el-form>
                <template #footer>
                <span class="dialog-footer">
                  <el-button @click="form.dialogVisible = false">取消</el-button>
                  <el-button type="primary" @click="saveAdmin()">确认</el-button>
                </span>
                </template>
              </el-dialog>
            </template>
            <template #default="scope">
               <el-popconfirm
                  confirm-button-text="是"
                  confirm-button-type="danger"
                  cancel-button-text="否"
                  :icon="InfoFilled"
                  icon-color="#ff0000"
                  title="确定回收此管理员账号吗"
                  @confirm="handleDelete(scope.$index, scope.row)"
                  @cancel="cancelEvent"
              >
                <template #reference>
                  <el-button type="danger">回收账号</el-button>
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
import {ElMessage, ElNotification} from "element-plus";
import { InfoFilled } from '@element-plus/icons-vue'
import {onBeforeRouteUpdate} from "vue-router";
import router from "../router";

interface ListItem {
  name: string
  stuId: string
}

const list = ref<ListItem[]>([])
const options = ref<ListItem[]>([])
const value = ref<string[]>([])
const loading = ref(false)



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
const studentList = ref<User[]>([])
interface User {
  name: string
  stuId:string
  className:string
  tel: string
  wx: string
}
const cancelEvent = () => {
  console.log('cancel!')
}

const form = reactive({
  dialogVisible : false,
  changeDialogVisible : [false],
  submitData: {},
  init : '',
  timeValue:[],
  isUpdate: false,
  search:'',
  termToday:'',
  currentPage:1,
  pageSize:5,
  totalCnt:0
})
const handleSizeChange = (val: number) => {
  getAdminDataList()
}
const handleCurrentChange = (val: number) => {
  getAdminDataList()
}

const saveAdmin = (index: number, row: User) =>{
  const data = {
    stuIdList: value.value
  };
    axios.post('/user/saveAdminList', data).then(res =>{
      if (res.data.code == 200){
        ElNotification({
          title: '新增管理员成功',
          message: '系统将自动为学生开通管理员账号',
          type: 'success',
        })
          form.dialogVisible = false
          getAdminDataList()
      }else{
        ElMessage.error(res.data.message)
      }
    })
}
const inputChange = () => {
  getAdminDataList()
}
const handleNew = () => {
  form.init = ''
  form.timeValue = []
  form.isUpdate = false
}
const handleDelete = (index: number, row: User) => {
  const data = {
    term: row.name
  };
  axios.post('/term/deleteTerm', data).then(re => {
    if (re.data.code == 200){
      ElMessage.success('删除成功')
      getAdminDataList()
    }else {
      ElMessage.error(re.data.message)
    }
  })
  console.log(index, row)
}
const getAdminDataList = () => {
  const searchData = {
    query : form.search,
    pageSize: form.pageSize,
    pageIndex: form.currentPage
  }
  axios.get('/user/getAdminDataList',{params:searchData}).then(re =>{
    if (re.data.code == 200){
      tableData.value = re.data.data["dataList"]
      form.totalCnt = re.data.data["totalSize"]
    }
  })
}
const getStudentList = () => {
  axios.get('/user/getStudentList').then(re =>{
    if (re.data.code == 200){
      studentList.value = re.data.data
      list.value = studentList.value.map((item) => {
        return { name: `${item.name}`, stuId: `${item.stuId}` }
      })
    }
  })
}

let tableData = ref<User>()
watch(

    () => router.currentRoute.value.path,

    (newValue, oldValue) => {
      getAdminDataList()
      getStudentList()
    },

    { immediate: true }

);

</script>
<style scoped>
</style>
<style>

</style>