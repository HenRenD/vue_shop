<template>
    <div>
        <!-- 头部导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <el-table :data="rightsList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="权限名称" prop="authName"></el-table-column>
                <el-table-column label="路径" prop="path"></el-table-column>
                <el-table-column label="权限等级" prop="level">
                    <template slot-scope="scope">
                        <el-tag v-if='scope.row.level === "0"'>一级</el-tag>
                        <el-tag v-else-if="scope.row.level === '1'" type="success">二级</el-tag>
                        <el-tag v-else type="warning">三级</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
    name:"Rights",
    data(){
        return {
            // 权限列表数据
            rightsList:[]
        }
    },
    methods:{
        // 获取数据方法
        getRightsList(){
            this.$http.get("rights/list").then(({data:res}) => {
                if (res.meta.status !== 200){
                    return this.$message.error(res.meat.msg)
                }else{
                    this.rightsList = res.data
                }
            }).catch((err) => {
                return err
            })
        }
    },
    created(){
        // 创建完毕直接获取数据
        this.getRightsList()
    }
}
</script>

<style lang="less" scoped>
.el-card {
    margin-top: 20px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
}
</style>