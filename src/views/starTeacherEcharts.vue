<template>
  <div class="echarts-box">
    <div id="myEcharts" style=" height: 500px;" align="center"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import {onMounted, onUnmounted} from "vue";
import axios from "axios";
import router from "../router";

export default {
  name: "starTeacherEcharts",
  setup() {
    /// 声明定义一下echart
    let echart = echarts;

    onMounted(() => {
      getStarTeacher()
    });

    onUnmounted(() => {
      echart.dispose;
    });

  }
};

const getStarTeacher = () => {
  axios.get('/class/getStarTeacher').then(re => {
    if (re.data.code == 200){
      let echart = echarts;
      let chart = echart.init(document.getElementById("myEcharts"));

      // 把配置和数据放这里
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          top: '0%',
          left: 'center'
        },
        xAxis: {
          type: 'category',
          data: re.data.data['teacherName'],
          nameTextStyle: {
            padding: [0, 0, 0, -10]     // 四个数字分别为上右下左与原位置距离
          },
          "axisLabel":{
            interval: 0
          }
        },
        yAxis: {
          type: 'value',

        },
        series: [
          {
            data: re.data.data['teachCnt'],
            type: 'bar',
            name: '导生授课数量'
          }
        ]
      });
      window.onresize = function() {
        //自适应大小
        chart.resize();
      };
    }
    })
  }

</script>

<style scoped>

</style>