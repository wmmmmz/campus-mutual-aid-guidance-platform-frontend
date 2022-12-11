<template>
	<div class="container">
		<el-tabs v-model="message" @tab-change="handleChangeTabs()">
			<el-tab-pane :label="`未读消息(${form.unreadedCnt})`" name="UNREADED">
				<el-table :data="UNREADED" :show-header="false" style="width: 100%">
					<el-table-column min-width="10%">
						<template #default="scope">
							<span class="message-title">{{ scope.row.title }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="createTime" min-width="20%"></el-table-column>
					<el-table-column prop="content" min-width="60%"></el-table-column>
					<el-table-column min-width="10%">
						<template #default="scope">
							<el-button @click="handleRead(scope.$index, scope.row)">标为已读</el-button>
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
            :total="form.unreadedCnt"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
				<div class="handle-row">
					<el-button type="primary" @click="handleAllRead()">全部标为已读</el-button>
				</div>
			</el-tab-pane>
			<el-tab-pane :label="`已读消息(${form.readedCnt})`" name="READED">
				<template v-if="message === 'READED'">
					<el-table :data="READED" :show-header="false" style="width: 100%">
            <el-table-column min-width="10%">
              <template #default="scope">
                <span class="message-title">{{ scope.row.title }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" min-width="20%"></el-table-column>
            <el-table-column prop="content" min-width="53%"></el-table-column>
						<el-table-column min-width="17%">
							<template #default="scope">
								<el-button @click="handleUnRead(scope.$index, scope.row)">标为未读</el-button>
                <el-button type="danger" @click="handleDel(scope.$index, scope.row)">删除</el-button>
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
              :total="form.readedCnt"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
          />
					<div class="handle-row">
						<el-button type="danger" @click="handleAllDel()">删除全部</el-button>
					</div>
				</template>
			</el-tab-pane>
			<el-tab-pane :label="`回收站(${form.recycleCnt})`" name="RECYCLE">
				<template v-if="message === 'RECYCLE'">
					<el-table :data="RECYCLE" :show-header="false" style="width: 100%">
            <el-table-column min-width="10%">
              <template #default="scope">
                <span class="message-title">{{ scope.row.title }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" min-width="20%"></el-table-column>
            <el-table-column prop="content" min-width="60%"></el-table-column>
						<el-table-column min-width="10%">
							<template #default="scope">
								<el-button @click="handleRead(scope.$index, scope.row)">还原</el-button>
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
              :total="form.recycleCnt"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
          />
					<div class="handle-row">
						<el-button type="danger" @click="form.centerDialogVisible = true">清空回收站</el-button>
            <el-dialog v-model="form.centerDialogVisible"  width="30%">
              <span>确认清空回收站的所有消息吗？</span>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="form.centerDialogVisible = false">取消</el-button>
                  <el-button type="danger" @click="form.centerDialogVisible = false;clearRecycle()">
                    确认清空
                  </el-button>
                </span>
              </template>
            </el-dialog>
					</div>
				</template>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script setup lang="ts" name="tabs">
import {ref, reactive, watch} from 'vue';
import router from "../router";
import axios from "axios";
import {ElMessage} from "element-plus";
import initTextHooks from "wangeditor/dist/text/event-hooks";
import {unReadCntStore} from "../store/unreadCnt";

interface Notify{
  title:string
  content:string
  createTime:''
  status:string
}

const form = reactive({
  unreadedCnt : 0,
  readedCnt :0,
  recycleCnt:0,
  centerDialogVisible:false,
  currentPage:1,
  pageSize:5,
})
const message = ref('UNREADED');
let UNREADED = ref<Notify>()
let READED =  ref<Notify>()
let RECYCLE =  ref<Notify>()
const handleChangeTabs = () =>{
  form.currentPage = 1
  getNotifyList()
}
const handleRead = (index: number, row: Notify) => {
  const data = {
    stuId : localStorage.getItem('stuId'),
    role: localStorage.getItem('role'),
    title: row.title,
    content: row.content,
    createTime: row.createTime,
    readAll : false,
    status : 'READED'
  }
  axios.post('/notifyAnnounce/changeStatus', data).then(re => {
    if (re.data.code == 200){
      getNotifyList()
    }
  })
};
const handleUnRead = (index: number, row: Notify) => {
  const data = {
    stuId : localStorage.getItem('stuId'),
    role: localStorage.getItem('role'),
    title: row.title,
    content: row.content,
    createTime: row.createTime,
    readAll : false,
    status : 'UNREADED'
  }
  axios.post('/notifyAnnounce/changeStatus', data).then(re => {
    if (re.data.code == 200){
      getNotifyList()
    }
  })
};
const handleAllRead = () => {
  const data = {
    stuId : localStorage.getItem('stuId'),
    role: localStorage.getItem('role'),
    readAll : true,
    status : 'READED'
  }
  axios.post('/notifyAnnounce/changeStatus', data).then(re => {
    if (re.data.code == 200){
      getNotifyList()
    }
  })
};
const handleDel = (index: number, row : Notify) => {
  const data = {
    stuId : localStorage.getItem('stuId'),
    role: localStorage.getItem('role'),
    title: row.title,
    content: row.content,
    createTime: row.createTime,
    readAll : false,
    status : 'RECYCLE'
  }
  axios.post('/notifyAnnounce/changeStatus', data).then(re => {
    if (re.data.code == 200){
      getNotifyList()
    }
  })
};
const handleAllDel = () => {
  const data = {
    stuId : localStorage.getItem('stuId'),
    role: localStorage.getItem('role'),
    readAll : true,
    status : 'RECYCLE'
  }
  axios.post('/notifyAnnounce/changeStatus', data).then(re => {
    if (re.data.code == 200){
      getNotifyList()
    }
  })
}
const clearRecycle = () => {
  const data = {
    stuId : localStorage.getItem('stuId'),
    role: localStorage.getItem('role'),
  }
  axios.post('/notifyAnnounce/clearRecycle', data).then(re => {
    if (re.data.code == 200){
      getNotifyList()
    }
  })
};
const handleSizeChange = (val: number) => {
  getNotifyList()
}
const handleCurrentChange = (val: number) => {
  getNotifyList()
}
const unReadCntChange = unReadCntStore()
const getNotifyList = () => {
  const data = {
    stuId : localStorage.getItem('stuId'),
    role: localStorage.getItem('role'),
    pageSize: form.pageSize,
    pageIndex: form.currentPage,
  }
  axios.get('/user/getNotifyList', {params:data}).then(re => {
    if (re.data.code == 200){
      UNREADED.value = (re.data.data["dataList"]["UNREADED"])
      READED.value = (re.data.data["dataList"]["READED"])
      RECYCLE.value = (re.data.data["dataList"]["RECYCLE"])
      form.unreadedCnt = re.data.data["UnreadTotalSize"]
      unReadCntChange.handleUnReadCnt(form.unreadedCnt)
      form.readedCnt = (re.data.data["readTotalSize"])
      form.recycleCnt = (re.data.data["recycleTotalSize"])
    }
  })
}

watch(

    () => router.currentRoute.value.path,

    (newValue, oldValue) => {
        getNotifyList()
    },

    { immediate: true }

);
</script>

<style>
.message-title {
	cursor: pointer;
}
.handle-row {
	margin-top: 30px;
}
</style>
