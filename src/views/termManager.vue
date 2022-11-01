<template>
  <el-col :span="30">
    <el-card shadow="hover">
      <template #header>
        <div class="clearfix">
          <h2>当前学期：2022年春季学期</h2>
        </div>
      </template>
      <el-table :data="filterTableData" style="width: 100%">
        <el-table-column label="学期名" prop="name" width="180"/>
        <el-table-column label="开始时间" width="180">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon><timer /></el-icon>
                <span style="margin-left: 10px">{{ scope.row.date }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" width="180">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon><timer /></el-icon>
              <span style="margin-left: 10px">{{ scope.row.date }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="开设课程数" prop="name" width="180"/>
        <el-table-column label="开设班级数" prop="name" width="100"/>
        <el-table-column align="right" width="360">
          <template #header>
            <el-input v-model="search" style="width:200px" placeholder="Type to search" />
            &nbsp;
            <el-button>新增学期</el-button>
          </template>
          <template #default="scope">
            <el-button @click="handleEdit(scope.$index, scope.row)">修改</el-button>
            <el-button
                type="danger"
                @click="handleDelete(scope.$index, scope.row)"
            >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </el-col>

</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import StartClass from "./startClass.vue";

interface User {
  date: string
  name: string
  address: string
}

const search = ref('')
const filterTableData = computed(() =>
    tableData.filter(
        (data) =>
            !search.value ||
            (data.name.toLowerCase().includes(search.value.toLowerCase()) || data.date.includes(search.value))
    )
)
const handleEdit = (index: number, row: User) => {
  console.log(index, row)
}
const handleDelete = (index: number, row: User) => {
  console.log(index, row)
}

const tableData: User[] = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'John',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Morgan',
    address: 'No. 189, Grove St, Los Angeles',
  },

]
</script>