<template>
  <div>
    <el-carousel v-if="imgData" :interval="3000"  type="card" height="28vw">
      <el-carousel-item  v-for="item in imgData" :key="item">
        <!--        <h3 text="2xl" justify="center">{{ item }}</h3>-->
        <img ref="image" style="width:100%; height: auto" :src="item.imgUrl" @click="routerChoose()"/>
      </el-carousel-item>
    </el-carousel>
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
interface Img{
  theme:string
  imgUrl:string
  imgUrlList:[]
}
// let imgData = [
//   {src : localStorage.getItem('img')},
//   {src : localStorage.getItem('img')},
//   {src : localStorage.getItem('img')},
// ]
const imgData = ref<Img>()
const routerChoose = () => {
  router.push('/user')
}


onMounted(() => {
  // 首次加载时,初始化高度
  // form.screenWidth = window.innerHeight
  // console.log(form.screenWidth)
  // form.bannerHeight = 700 / 1000 * form.screenWidth - 50
  // console.log(form.bannerHeight)
  // 窗口大小发生改变


})
const form = reactive({
  bannerHeight:700,
  screenWidth:1920
});
watch(

    () => router.currentRoute.value.path,

    (newValue, oldValue) => {
      axios.get('/carousel/getAllCarousel').then(re => {
        imgData.value = re.data.data
      })
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
