<template>
  <div class="echarts-box">
    <el-select v-model="this.value"  @change="getClassStatistic" style="width: 200px" placeholder="所有学期">
      <el-option
          v-for="item in termData"
          :key="item.value"
          :label="item.label"
          :value="item.value">
      </el-option>
    </el-select>
    <div id="myClassEcharts" style=" height: 468px;" align="center"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import {onMounted, onUnmounted} from "vue";
import axios from "axios";
import router from "../router";
import {PieTermStore} from "../store/PieTerm";

export default {
  name: "classStatisticEcharts",
  data() {
    return{
      value : '',
      termData : [],
    }
  },
  methods:{
    getAllTerm(){
      axios.get('/term/getAllTerm').then(re => {
        this.termData = re.data.data
        this.termData.push({value:'所有学期', label:'所有学期'})
      })
    },
    getClassStatistic() {
  const data = {
    termName : this.value
  }
  console.log(this.value)
  axios.get('/class/getClassStatistic', {params:data}).then(re => {
    if (re.data.code == 200){
      let echart = echarts;
      let chart = echart.init(document.getElementById("myClassEcharts"));

      // 把配置和数据放这里
      chart.setOption({
        tooltip: {
          trigger: 'item'
        },
        legend: {
          top: '5%',
          left: 'center'
        },
        series: [
          {
            name: '开班数',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '40',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: re.data.data
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
  },
  mounted() {
    this.getAllTerm()
    this.getClassStatistic()
  },
  setup() {
    /// 声明定义一下echart
    let echart = echarts;


    function getClassStatistic() {
      const data = {
        // termName : this.value
      }
      // console.log(this.value)
      axios.get('/class/getClassStatistic', {params:data}).then(re => {
        if (re.data.code == 200){
          let echart = echarts;
          let chart = echart.init(document.getElementById("myClassEcharts"));

          // 把配置和数据放这里
          chart.setOption({
            tooltip: {
              trigger: 'item'
            },
            legend: {
              top: '5%',
              left: 'center'
            },
            series: [
              {
                name: '开班数',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 10,
                  borderColor: '#fff',
                  borderWidth: 2
                },
                label: {
                  show: false,
                  position: 'center'
                },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: '40',
                    fontWeight: 'bold'
                  }
                },
                labelLine: {
                  show: false
                },
                data: re.data.data
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

    onMounted(() => {

      getClassStatistic()

    });

    onUnmounted(() => {
      echart.dispose;
    });
  },
};
const pieTermStore = PieTermStore()

</script>

<style scoped>

</style>