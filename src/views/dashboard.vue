<template>
  <div class="container">
    <el-carousel v-if="imgData" :interval="3000"  type="card" height="28vw">
      <el-carousel-item  v-for="item in imgData" :key="item">
        <img ref="image" style="width:100%; height: auto" :src="item.imgUrl" @click="routerChoose(item.theme)"/>
      </el-carousel-item>
    </el-carousel>
    <el-row :gutter="15" >
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
              <h3>明星导生</h3>
          </template>
          <div>
            <StarTeacherEcharts></StarTeacherEcharts>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <h3>开班统计</h3>
          </template>
          <div>
            <ClassStatisticEcharts></ClassStatisticEcharts>
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
import {PieTermStore} from "../store/PieTerm";
import StarTeacherEcharts from './starTeacherEcharts.vue'
import ClassStatisticEcharts from './classStatisticEcharts.vue'
interface Img{
  theme:string
  imgUrl:string
  imgUrlList:[]
}
const imgData = ref<Img>()
const pieTermStore = PieTermStore()
const handleChange = (termName : string) => {
  pieTermStore.handlePieTermChoose(termName)
}
const routerChoose = (theme : string) => {
  if (theme === '招募导生' && (localStorage.getItem('role') === 'student' || localStorage.getItem('role') === 'teacher'))
    router.push('/enrollTeach')
  else if(theme === '报名上课' && localStorage.getItem('role') === 'student'){
    router.push('/enrollClass')
  }
}
interface termNameList{
  value: string
  label: string
}
const form = reactive({
  value :''
})
let termData = ref<termNameList>()
watch(

    () => router.currentRoute.value.path,

    (newValue, oldValue) => {
      axios.get('/carousel/getAllCarousel').then(re => {
        imgData.value = re.data.data
      })
      axios.get('/term/getAllTerm').then(re => {
        termData.value = re.data.data
      })
    },

    { immediate: true }

);


</script>
<style scoped>
</style>
