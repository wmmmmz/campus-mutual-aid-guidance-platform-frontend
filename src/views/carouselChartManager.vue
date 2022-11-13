<template>
  <el-col :span="30">
    <el-card shadow="hover">
      <template #header>
        <div class="clearfix">
          <h2>首页轮播图管理</h2>
        </div>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column label="主题" prop="theme" min-width="20%"/>
        <el-table-column label="轮播图" min-width="40%">
          <template #default="scope">
          <el-image
              style="width: 100px; height: 100px"
              :src="scope.row.imgUrl"
              :preview-src-list="scope.row.imgUrlList"
              preview-teleported="true"
              >
          </el-image>
          </template>
        </el-table-column>
        <el-table-column align="right" min-width="65%">
          <template #header>
            <el-button @click="form.dialogVisible = true;">新增轮播图</el-button>
            <el-dialog v-model="form.dialogVisible" title="新增轮播图" width="33%" append-to-body = "true">
              <el-form label-width="90px">
                <el-form-item label="主题：">
                  <el-tree-select v-model="form.theme" style="width:205px" :data="themeData" :render-after-expand="false"/>
                </el-form-item>
                <el-form-item label="轮播图">
                  <input class="crop-input" type="file" name="image" accept="image/*" @change="setImage" />
                  <img v-if="form.ImageUrl" :src="form.ImageUrl" class="avatar" />
                </el-form-item>
              </el-form>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="form.dialogVisible = false">取消</el-button>
                  <el-button type="primary" @click="saveCarousel()">确认</el-button>
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
                title="确定删除此轮播图吗"
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
import {ElMessage, UploadFile, UploadFiles, UploadRawFile} from "element-plus";
import { InfoFilled } from '@element-plus/icons-vue'
import {onBeforeRouteUpdate, useRoute} from "vue-router";
import router from "../router";

// const router = useRoute();

interface Carousel {
  theme:string
  imgUrl:string
  imgUrlList:[]
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
  theme:'',
  carouselDialogVisible:false,
  ImageUrl:'' ,
})
const themeData = [
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
  },{
    //to all
    value: '其他',
    label: '其他'
  }
]

const setImage = (e: any) => {
  const file = e.target.files[0];
  if (!file.type.includes('image/')) {
    return;
  }
  const reader = new FileReader();
  reader.onload = (event: any) => {
    form.ImageUrl = event.target.result;
  };
  reader.readAsDataURL(file);
}
const saveCarousel = (index: number, row: Carousel) =>{
  const data = {
    imgUrl: form.ImageUrl,
    theme : form.theme
  };
  axios.post('/carousel/saveCarousel', data).then(re => {
    if(re.data.code == 200){
      ElMessage.success("新增成功")
      form.dialogVisible = false
      getCarouselList()
    }
  })
}
const handleDelete = (index: number, row: Carousel) => {
  const data = {
    theme: row.theme,
    imgBase64 : row.imgUrl
  };
  axios.post('/carousel/deleteCarousel', data).then(re => {
    if (re.data.code == 200){
      ElMessage.success('删除成功')
      getCarouselList()
    }else {
      ElMessage.error(re.data.message)
    }
  })
}
let termData = ref<termNameList>()

let tableData = ref<Carousel>()

const getCarouselList = () => {
  axios.get('/carousel/getAllCarousel').then(re => {
    tableData.value = re.data.data
  })
}
watch(

    () => router.currentRoute.value.path,

    (newValue, oldValue) => {
      getCarouselList()
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
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
