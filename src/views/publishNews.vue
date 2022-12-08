<template>
  <div>
  <el-col :span="30">
    <el-card shadow="hover">
      <template #header>
        <div class="clearfix">
          <h2>已发布通知</h2>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column label="通知主题" prop="title" min-width="10%"/>
        <el-table-column label="通知内容" prop="content" min-width="20%">
        </el-table-column>
        <el-table-column label="发布时间" min-width="20%">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon><timer /></el-icon>
              <span style="margin-left: 10px">{{ scope.row.createTime }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="form.role === 'admin'" label="发布人" min-width="10%">
          <template #default="scope">
            <el-popover effect="light" trigger="hover" placement="top" width="auto">
              <template #default>
                <div v-if="form.role === 'admin'">班级: {{ scope.row.senderClassName }}</div>
                <div v-if="form.role === 'admin'">电话: {{ scope.row.senderTel }}</div>
                <div v-if="form.role === 'admin'">微信: {{ scope.row.senderWx }}</div>
              </template>
              <template #reference>
                <el-tag v-if="form.role === 'admin'">{{ scope.row.senderName }}</el-tag>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="未读人数" prop="unreadCnt" min-width="10%"/>
        <el-table-column align="right" min-width="30%">
          <template #header>
            <el-input v-model="form.search" style="width:200px" placeholder="Type to search" @input="inputChange()"/>
            &nbsp;
            <el-button @click="form.dialogVisible = true; handleNewNotify()">发布新通知</el-button>
            <el-dialog v-model="form.dialogVisible" title="发布通知" width="33%" append-to-body = "true">
              <el-form label-width="90px">
                <el-form-item label="通知主题：">
                  <el-tree-select
                      v-model="form.title"
                      :data="titleData"
                      :render-after-expand="false"
                  />
                </el-form-item>
                <el-form-item label="通知对象：">
                  <el-tree-select
                      v-model="form.notifyIdentity"
                      :data="identityData"
                      multiple
                      :render-after-expand="false"
                  />
                </el-form-item>
                <el-form-item label="通知内容：">
                  <el-input  autosize type="textarea" v-model="form.content"></el-input>
                </el-form-item>
              </el-form>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="form.dialogVisible = false">取消</el-button>
                  <el-button type="primary" @click="saveNotify()">确认</el-button>
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
                title="确定删除此通知吗"
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
import {onBeforeRouteUpdate} from "vue-router";
import router from "../router";
import {el} from "element-plus/es/locale";

interface Notify {
  title:string
  content:string
  createTime: undefined
  unreadCnt:number,
  senderName:string,
  senderClassName:string,
  senderTel:string,
  senderWx:string
  // readed: number,
}

const form = reactive({
  dialogVisible : false,
  search : '',
  title:'',
  content:'',
  notifyIdentity:[],
  role :localStorage.getItem('role')
})

const saveNotify = () => {
  const data = {
    senderStuId: localStorage.getItem('stuId'),
    senderRole: localStorage.getItem('role'),
    title: form.title,
    content: form.content,
    receiverRole: form.notifyIdentity
  };
    axios.post('/notifyAnnounce/saveNotify', data).then(re => {
      if (re.data.code == 200){
        ElMessage.success("发布成功")
        form.dialogVisible = false
        const data = {
          stuId : localStorage.getItem('stuId'),
          role: localStorage.getItem('role'),
        }
        axios.get('/notifyAnnounce/getNotifyISent', {params:data}).then(re => {
          if (re.data.code == 200){
            tableData.value = re.data.data
            console.log(tableData)
          }
        })
      }else {
        ElMessage.error(re.data.message)
      }
    })

}

const inputChange = () => {
  const data = {
    stuId : localStorage.getItem('stuId'),
    role: localStorage.getItem('role'),
    query: form.search
  }
  axios.get('/notifyAnnounce/getNotifyISent', {params:data}).then(re => {
    if (re.data.code == 200){
      tableData.value = re.data.data
    }
  })
}
const cancelEvent = () => {
  console.log('cancel!')
}

const handleDelete = (index: number, row: Notify) =>{
  const data = {
    stuId : localStorage.getItem('stuId'),
    role: localStorage.getItem('role'),
    title: row.title,
    content:row.content,
    createTime:row.createTime
  }
  axios.post('/notifyAnnounce/deleteNotify', data).then(re => {
      if (re.data.code == 200){
        ElMessage.success("删除成功")
        const data = {
          stuId : localStorage.getItem('stuId'),
          role: localStorage.getItem('role'),
          query: form.search
        }
        axios.get('/notifyAnnounce/getNotifyISent', {params:data}).then(re => {
          if (re.data.code == 200){
            tableData.value = re.data.data
          }
        })
      }
  })
}
const handleNewNotify = () =>{

}

let tableData = ref<Notify>()
watch(

    () => router.currentRoute.value.path,

    (newValue, oldValue) => {

      const data = {
        stuId : localStorage.getItem('stuId'),
        role: localStorage.getItem('role'),
        query: form.search
      }
      axios.get('/notifyAnnounce/getNotifyISent', {params:data}).then(re => {
        if (re.data.code == 200){
          tableData.value = re.data.data
          console.log(tableData)
        }
      })


    },

    { immediate: true }

);
const identityValue = ref()
const titleValue = ref()
const identityData = [
  {
    value: 'student',
    label: '学生',
  },
  {
    value: 'teacher',
    label: '导生',
  },
]

const titleData = [
  {
    //to all
    value: '系统通知',
    label: '系统通知',
  },
  {
    //to student
    value: '招募导生',
    label: '招募导生',
  },
  {
    //to teacher
    value: '开课通知',
    label: '开课通知',
  },
  {
    //to student
    value: '报名上课通知',
    label: '报名上课通知',
  },{
    //to all
    value: '开班提醒',
    label: '开班提醒'
  }
]
</script>

<style scoped>

</style>