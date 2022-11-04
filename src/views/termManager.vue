<template>
  <el-col :span="30">
    <el-card shadow="hover">
      <template #header>
        <div class="clearfix">
          <h2>当前学期：2022年春季学期</h2>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column label="学期名" prop="name" width="180"/>
        <el-table-column label="开始时间" width="180">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon><timer /></el-icon>
                <span style="margin-left: 10px">{{ scope.row.dateList[0] }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" width="180">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon><timer /></el-icon>
              <span style="margin-left: 10px">{{ scope.row.dateList[1] }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="开设课程数" prop="courseCnt" width="180"/>
        <el-table-column label="开设班级数" prop="classCnt" width="100"/>
        <el-table-column align="right" width="360">
          <template #header>
            <el-input v-model="search" style="width:200px" placeholder="Type to search" />
            &nbsp;
            <el-button @click="form.dialogVisible = true">新增学期</el-button>
            <el-dialog v-model="form.dialogVisible" title="新增学期" width="33%" append-to-body = "true">
              <el-form label-width="90px">
                <el-form-item label="学期名：">
                  <el-input type="text" v-model="form.init"></el-input>
                </el-form-item>
                <el-form-item label="始末日期：">
                  <div class="block">
                    <el-date-picker
                        v-model="form.timeValue"
                        type="daterange"
                        unlink-panels
                        range-separator="-"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        value-format='YYYY-MM-DD'
                        :shortcuts="shortcuts"
                        size="default"
                    />
                  </div>
                </el-form-item>
              </el-form>
              <template #footer>
      <span class="dialog-footer">
        <el-button @click="form.dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTerm()">确认</el-button>
      </span>
              </template>
            </el-dialog>
          </template>
          <template #default="scope">
            <el-button @click="handleEdit(scope.$index, scope.row)">修改</el-button>
            <el-popconfirm
                confirm-button-text="是"
                confirm-button-type="danger"
                cancel-button-text="否"
                :icon="InfoFilled"
                icon-color="#ff0000"
                title="确定删除此学期所有相关数据吗"
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

</template>

<script lang="ts" setup>
import {computed, createApp, onMounted, reactive, ref, watch} from 'vue'
import axios from "axios";
import {ElMessage} from "element-plus";
import { InfoFilled } from '@element-plus/icons-vue'
import {onBeforeRouteUpdate} from "vue-router";
import router from "../router";



interface Term {
  name: string
  dateList:[]
  courseCnt: bigint
  classCnt: bigint
}
const cancelEvent = () => {
  console.log('cancel!')
}
const search = ref('')
// const filterTableData = computed(() =>
//     tableData.value.filter(
//         (data: { name: string; }) =>
//             !search.value ||
//             (data.name.toLowerCase().includes(search.value.toLowerCase()))
//     )
//
// )
const form = reactive({
  dialogVisible : false,
  submitData: {},
  title : "新增学期",
  init : '',
  timeValue:'',
})

const term =reactive<Term>({
  name: '',
  dateList:[],
  courseCnt: 0n,
  classCnt: 0n,
})
const saveTerm = () =>{
  const data = {
    name: form.init,
    dateList: form.timeValue
  };
  if (form.timeValue == ''){
    ElMessage.error("学期始末时间不能为空")
  }else{
    axios.post('/term/saveTerm', data).then(res =>{
      if (res.data.code == 200){
        ElMessage.success("新增成功");
        form.dialogVisible = false
      }else{
        ElMessage.error(res.data.message)
        console.log(res.data.message)
      }
    })
  }
  console.log(form.timeValue)
}
const handleEdit = (index: number, row: Term) => {
  console.log(index, row)
}
const handleDelete = (index: number, row: Term) => {
  console.log(index, row)
}

let tableData = ref<Term>()
// let tableData :Term[] = []
watch(

    () => router.currentRoute.value.path,

    (newValue, oldValue) => {

      console.log("watch=5", newValue);
      //  tableData = [
      //   {
      //     date: '2016-05-03',
      //     name: 'Tom',
      //     address: 'No. 189, Grove St, Los Angeles',
      //   },
      //   {
      //     date: '2016-05-02',
      //     name: 'John',
      //     address: 'No. 189, Grove St, Los Angeles',
      //   },
      //   {
      //     date: '2016-05-04',
      //     name: 'Morgan',
      //     address: 'No. 189, Grove St, Los Angeles',
      //   },
      //
      // ]
      axios.get('/term/getTermDataList').then(re =>{
        tableData.value = (re.data.data)
      })
    },

    { immediate: true }

);

const shortcuts = [
  {
    text: '上周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '上个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '过去三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },{
    text: '未来三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      end.setTime(start.getTime() + 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]
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
