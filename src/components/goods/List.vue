<template>
    <div>
        <!-- 头部导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card style="margin-top:20px">
            <!-- 搜索区域 -->
            <el-row :gutter="20">
                <el-col :span='8'>
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span='4'>
                    <el-button type="primary" @click="addGoods">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- 数据表格区域 -->
            <el-table :data="goodsList" border stripe style="margin-top:20px">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="110px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="80px"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="180px">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="small" ></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteGood(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination background style="margin-top:20px" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[7, 10,20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>

        </el-card>
    </div>
</template>

<script>
export default {
    name: 'List',
    data() {
        return {
            // 查询参数
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 7,
            },
            // 商品列表
            goodsList: [],
            // 商品总数
            total: 0,
        }
    },
    methods: {
        // 获取商品数据
        getGoodList() {
            this.$http
                .get('goods', { params: this.queryInfo })
                .then(({ data: res }) => {
                    if (res.meta.status !== 200)
                        return this.$message.error(res.meta.msg)
                    this.goodsList = res.data.goods
                    this.total = res.data.total
                })
        },
        // 每页显示的条数改变时回调
        handleSizeChange(newVal) {
            this.queryInfo.pagesize = newVal
            this.getGoodList()
        },
        // 页数改变时的回调
        handleCurrentChange(newVal) {
            this.queryInfo.pagenum = newVal
            this.getGoodList()
        },
        // 删除商品
        deleteGood(id) {
            this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            })
                .then(() => {
                    this.$http.delete(`goods/${id}`).then(({ data: res }) => {
                        if (res.meta.status !== 200)
                            return this.$message.error(res.meta.msg)
                        this.$message.success(res.meta.msg)
                        this.getGoodList()
                    })
                })
                .catch(() => {
                    this.$message.info('已取消操作~')
                })
        },
        // 添加商品
        addGoods() {
            this.$router.push('/goods/add')
        },
    },
    mounted() {
        this.getGoodList()
    },
}
</script>

<style>
</style>