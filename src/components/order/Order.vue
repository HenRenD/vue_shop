<template>
    <div>
        <!-- 头部导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card style='margin-top:20px'>
            <!-- 搜索区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="clearChange">
                        <el-button slot="append" icon="el-icon-search" @click="searchOrders"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!-- 表格渲染区域 -->
            <el-table :data="orderDataList" border stripe style="margin-top:20px">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price" width="150px"></el-table-column>
                <el-table-column label="是否支付" width="150px">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.order_pay === 1" type="success">已付款</el-tag>
                        <el-tag v-else type="danger">未付款</el-tag>
                    </template>m
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send" width="150px"></el-table-column>
                <el-table-column label="下单时间" width="220px">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="100px">
                    <template>
                        <el-button size="small" type="primary" icon="el-icon-edit" circle @click="editAddressDialogShow"></el-button>
                        <el-button size="small" type="success" icon="el-icon-location" circle @click="showOrderStatus"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination style="margin-top:20px" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[7, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

        <!-- 修改地址对话框 -->
        <el-dialog title="修改地址" :visible.sync="addressDialogVisible" width="50%" @close="addressDialogClosed">
            <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader style="width:100%" v-model="formData.address1" :options="cityData" :props="cascaderProps" @change="handleChange"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="formData.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editAddress">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 订单详情对话框 -->
        <el-dialog title="物流信息" :visible.sync="orderInfoDialogVisiable" width="50%">
           暂无物流信息
        </el-dialog>
    </div>
</template>

<script>
import cityData from './citydata.js'
export default {
    name: 'Order',
    data() {
        return {
            // 查询参数
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 7,
            },
            // 订单数据信息
            orderDataList: [],
            // 订单总数
            total: 0,
            // 控制修改地址对话框显示
            addressDialogVisible: false,
            // 城市信息
            cityData: cityData,
            // 表单信息
            formData: {
                address1: [],
                address2: '',
            },
            // 表单验证规则
            formRules: {
                address1: [
                    {
                        required: 'true',
                        message: '请选择地址！',
                        trigger: 'blur',
                    },
                ],
                address2: [
                    {
                        required: 'true',
                        message: '请输入详细地址！',
                        trigger: 'blur',
                    },
                ],
            },
            // 级联选择器的配置对象
            cascaderProps: {
                expandTrigger: 'hover',
            },
            // 控制订单详情对话框显示
            orderInfoDialogVisiable:false
        }
    },
    methods: {
        // 获取订单数据
        getOrderDataList() {
            this.$http
                .get('orders', { params: this.queryInfo })
                .then(({ data: res }) => {
                    if (res.meta.status !== 200)
                        return this.$message.error(res.meta.msg)
                    this.orderDataList = res.data.goods
                    this.total = res.data.total
                })
        },
        // 处理分页size改变回调
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getOrderDataList()
        },
        // 处理分页num改变回调
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getOrderDataList()
        },
        // 搜索订单
        searchOrders() {
            this.getOrderDataList()
        },
        // 清空input
        clearChange() {
            this.getOrderDataList()
        },
        // 修改地址按钮的点击事件
        editAddressDialogShow() {
            this.addressDialogVisible = true
        },
        // 处理级联选择change事件
        handleChange() {},
        // 对话框关闭时 重置表单
        addressDialogClosed() {
            this.$refs.formRef.resetFields()
        },
        // 修改地址
        editAddress() {
            this.$refs.formRef.validate((valid) => {
                if (!valid) return
                this.$message.success('修改成功!')
                this.addressDialogVisible = false
            })
        },
        // 查看物流
        showOrderStatus() {
            this.orderInfoDialogVisiable = true
            // 发送请求获取物流详情
            
        },
    },
    created() {
        this.getOrderDataList()
    },
}
</script>

<style>
</style>