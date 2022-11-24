<template>

  <el-col :span="30">
    <el-card shadow="hover">
      <template #header>
        <div class="clearfix">
          <h2>我的报名授课进度</h2>
        </div>
      </template>
    <el-collapse v-model="activeNames" @change="handleChange">
      <div v-for="(data, key) in mockData">
      <el-collapse-item :name="key">
        <template #title>
            <p class="collapse-title">{{data.title}}</p>
        </template>
        <div style="float: right;text-align: right;width:100%;">
          <el-link @click="interviewLink(data.interviewLink)" type="primary" v-if="data.active == 2">面试链接</el-link>
          <br v-if="data.active != 2">
        </div>
        <div>
          <el-descriptions>
            <el-descriptions-item label="班级名">{{data.className}}</el-descriptions-item>
            <el-descriptions-item label="课程名">{{data.courseName}}</el-descriptions-item>
            <el-descriptions-item label="每周">{{data.day}}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{data.startTime}}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{data.endTime}}</el-descriptions-item>
            <el-descriptions-item label="上课地点">{{data.classroom}}</el-descriptions-item>
          </el-descriptions>
        </div>
        <br>
        <div>
          <el-steps :active="data.active" finish-status="success">
            <el-step title="报名成功" :description="data.enrollDate" :icon="Document" />
            <el-step title="面试中" :description="data.interviewDate" :icon="User" />
            <el-step title="成为导生" :description="data.successDate" :icon="Check" />
          </el-steps>
        </div>
      </el-collapse-item>
      </div>
    </el-collapse>
    </el-card>
  </el-col>
</template>


<script lang="ts" setup>
import {computed, createApp, onMounted, reactive, ref, watch} from 'vue'
import axios from "axios";
import {ElMessage} from "element-plus";
import { Document, User, Check } from '@element-plus/icons-vue'
import {onBeforeRouteUpdate} from "vue-router";
import router from "../router";

const mockData = [
    {
      title:"JAVA1",
      className:"JAVA1",
      courseName:"JAVA",
      day:"一",
      startTime:"20:00:00",
      endTime:"21:00:00",
      classroom:"观雪楼",
      active:1,
      enrollDate:"2022.10.11",
      interviewDate:"2022.11.1",
      successDate:"2022.12.1",
      interviewLink:"http://www.baidu.com"
  },{
    title:"JAVA2",
    className:"JAVA2",
    courseName:"JAVA",
    day:"二",
    startTime:"20:00:00",
    endTime:"21:00:00",
    classroom:"腾讯会议",
    active:2,
    enrollDate:"2022.10.10",
    interviewDate:"2022.11.1",
    successDate:"2022.12.1",
    interviewLink:"https://meeting.tencent.com/user-center/joining?meeting_code=679224987"
  }
]

const activeNames = ref([])
const handleChange = (val: string[]) => {
  console.log(val)
}
const interviewLink = (link : string) => {
  window.open(link);
}
watch(

    () => router.currentRoute.value.path,

    (newValue, oldValue) => {

    },

    { immediate: true }

);

</script>
<style scoped lang="scss">
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


 .collapse-title {
  flex: 1 0 90%;
  order: 1;

}
</style>
<style scoped>
/deep/ .el-collapse-item__header{
  font-size: 22px;
}
</style>