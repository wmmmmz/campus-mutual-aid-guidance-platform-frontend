<template>
  <div>
    <el-carousel v-if="imgData" :interval="3000"  type="card" height="28vw">
      <el-carousel-item  v-for="item in imgData" :key="item">
        <img ref="image" style="width:100%; height: auto" :src="item.imgUrl" @click="routerChoose(item.theme)"/>
      </el-carousel-item>
    </el-carousel>
    <el-row :gutter="10" >
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
              <h3>明星导生</h3>
          </template>
          <div>
            <schart class="v-chart" canvasId="canvas" :options="form.options" align="center"/>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import {reactive, ref, watch} from 'vue'
import axios from "axios";
import router from "../router";
import Schart from 'vue-schart';
import Charts from "./charts.vue";

interface Img{
  theme:string
  imgUrl:string
  imgUrlList:[]
}
const imgData = ref<Img>()
const routerChoose = (theme : string) => {
  if (theme === '招募导生' && (localStorage.getItem('role') === 'student' || localStorage.getItem('role') === 'teacher'))
    router.push('/enrollTeach')
  else if(theme === '报名上课' && localStorage.getItem('role') === 'student'){
    router.push('/enrollClass')
  }
}

const form = reactive({
  options : {
    type: "bar",
    // title: {
    //   text: "明星导生"
    // },
    bgColor: "#ffffff",
    labels: [],
    rightPadding:10,
    datasets: [
      {
        label: '导生授课数',
        fillColor: "rgba(9,99,182,0.5)",
        data: []
      }
    ]}
})
const getStarTeacher = () => {
  axios.get('/class/getStarTeacher').then(re => {
    if (re.data.code == 200){
      form.options.labels = re.data.data['teacherName']
      form.options.datasets[0].data = re.data.data['teachCnt']
    }
  })

}
watch(

    () => router.currentRoute.value.path,

    (newValue, oldValue) => {
      axios.get('/carousel/getAllCarousel').then(re => {
        imgData.value = re.data.data
      })
      getStarTeacher()
    },

    { immediate: true }

);


</script>
<style scoped>

.v-chart {
  width: auto;
  height: 400px;
}

</style>
