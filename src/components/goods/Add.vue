<template>
    <div>
        <!-- 头部导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品添加</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card style="margin-top:20px">
            <!-- 提示区域 -->
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
            </el-alert>

            <!-- 步骤条 -->
            <el-steps style="margin:20px 0" :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!-- 将form表单包裹在外侧 -->
            <el-form :model="addGoodsForm" :rules="addGoodsFormRules" ref="addGoodsFormRef" label-width="100px" label-position="top">
                <!-- tab栏区域 -->
                <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeLeaveTag" @tab-click="tabClicked">
                    <!-- 基本信息tag -->
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addGoodsForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addGoodsForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addGoodsForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addGoodsForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader style="width:300px" clearable v-model="addGoodsForm.goods_cat" :options="cateList" :props="cascaderProps" @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>

                    <!-- 商品参数 -->
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox style="margin:0 5px 0 0" border :label="value" v-for="(value,index) in item.attr_vals" :key="index"></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <!-- 商品属性tag -->
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="(item) in onlyTableData" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>

                    <!-- 商品图片tag -->
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload :file-list='fileList' :on-success="handleSuccess" :headers="headersObj" :action="uploadUrl" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture">
                            <el-button style='margin:20px 0 0 20px' size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>

                    <!-- 商品内容tag -->
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
                        <el-button style='margin-top:20px' type="primary" @click="addGoods">添加商品</el-button>
                    </el-tab-pane>
                    <!-- <el-tab-pane label="完成"></el-tab-pane> -->
                </el-tabs>
            </el-form>
        </el-card>

        <!-- 图片预览对话框 -->
        <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%" @close="previewDialogClosed">
            <img style="width:100%" :src="previewPath">
        </el-dialog>
    </div>
</template>

<script>
import _ from "lodash"
export default {
    name: 'Add',
    data() {
        return {
            // 激活哪一个步骤
            activeIndex: '0',
            // 添加商品的表单数据对象
            addGoodsForm: {
                goods_name: '',
                goods_price: '',
                goods_weight: '',
                goods_number: '',
                goods_cat: [],
                pics: [],
                goods_introduce:'',
                attrs:[]
            },
            // 商品分类数据
            cateList: [],
            // 级联选择器配置对象
            cascaderProps: {
                label: 'cat_name',
                value: 'cat_id',
                children: 'children',
                expandTrigger: 'hover',
            },
            // 动态参数列表
            manyTableData: [],
            // 静态参数列表
            onlyTableData: [],
            // 表单验证规则
            addGoodsFormRules: {
                goods_name: [
                    {
                        required: true,
                        message: '请输入商品名称',
                        trigger: 'blur',
                    },
                ],
                goods_price: [
                    {
                        required: true,
                        message: '请输入商品价格',
                        trigger: 'blur',
                    },
                ],
                goods_weight: [
                    {
                        required: true,
                        message: '请输入商品重量',
                        trigger: 'blur',
                    },
                ],
                goods_number: [
                    {
                        required: true,
                        message: '请输入商品数量',
                        trigger: 'blur',
                    },
                ],
                goods_cat: [
                    {
                        required: true,
                        message: '请选择商品分类',
                        trigger: 'change',
                    },
                ],
            },
            // 上传图片路径
            uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
            // 上传图片的请求头对象
            headersObj: {
                Authorization: sessionStorage.getItem('token'),
            },
            // 图片预览时的图片路径
            previewPath: '',
            // 控制对话框显示
            previewDialogVisible:false,
            fileList:[]
        }
    },
    // watch: {
    //     manyTableData() {
    //         this.getManyTableData()
    //     },
    // },
    methods: {
        // 获取商品分类数据
        getCateList() {
            this.$http
                .get('categories')
                .then(({ data: res }) => {
                    if (res.meta.status !== 200)
                        return this.$message.error(res.meta.msg)
                    this.cateList = res.data
                })
                .catch((arr) => err)
        },
        // 级联选择器发生改变时的回调
        handleChange() {},
        // 切换tag的条件
        beforeLeaveTag(activeName, oldActiveName) {
            let leave = true
            if (oldActiveName === '0') {
                this.$refs.addGoodsFormRef.validate((valid) => {
                    if (!valid) {
                        this.$message.error('请完善信息！')
                        leave = false
                    }
                })
            }
            return leave
        },
        // 获取动态参数
        getManyTableData() {
            this.$http
                .get(
                    `categories/${this.addGoodsForm.goods_cat[2]}/attributes`,
                    { params: { sel: 'many' } }
                )
                .then(({ data: res }) => {
                    if (res.meta.status !== 200)
                        return this.$message.error(res.meta.msg)
                    res.data.forEach((item) => {
                        item.attr_vals =
                            item.attr_vals.length === 0
                                ? []
                                : item.attr_vals.split(' ')
                    })
                    this.manyTableData = res.data
                })
        },
        // 获取静态s属性
        getOnlyTableData() {
            this.$http
                .get(
                    `categories/${this.addGoodsForm.goods_cat[2]}/attributes`,
                    { params: { sel: 'only' } }
                )
                .then(({ data: res }) => {
                    if (res.meta.status !== 200)
                        return this.$message.error(res.meta.msg)
                    this.onlyTableData = res.data
                })
        },
        // 点击tag事件
        tabClicked() {
            if (this.activeIndex === '1') {
                this.getManyTableData()
            }
            if (this.activeIndex === '2') {
                this.getOnlyTableData()
            }
        },
        // 上传图片预览函数
        handlePreview(file) {
            this.previewPath = file.response.data.url
            this.previewDialogVisible = true
        },
        // 移除上传的图片回调函数
        handleRemove(file) {
            const path = file.response.data.tmp_path
            const index = this.addGoodsForm.pics.findIndex((x) => {
                x.pic === path
            })
            this.addGoodsForm.pics.splice(index, 1)
        },
        // 图片上传成功的回调
        handleSuccess(response) {
            const obj = {
                pic: response.data.tmp_path,
            }
            this.addGoodsForm.pics.push(obj)
        },
        // 对话框关闭时的回调
        previewDialogClosed(){
            this.previewDialogVisible = false
            this.previewPath = ""
        },
        //添加商品
        addGoods(){
            this.$refs.addGoodsFormRef.validate((valid) => {
                if (!valid) return this.$message.error("请完善必填项！")
                const formInfo = _.cloneDeep(this.addGoodsForm)
                formInfo.goods_cat = formInfo.goods_cat.join(",")

                // 处理动态参数
                this.manyTableData.forEach((item) => {
                    this.addGoodsForm.attrs.push({attr_id:item.attr_id,attr_value:item.attr_vals.join(" ")})
                })
                // 处理静态属性
                this.onlyTableData.forEach((item) => {
                    this.addGoodsForm.attrs.push({attr_id:item.attr_id,attr_value:item.attr_vals})
                })
                formInfo.attrs = this.addGoodsForm.attrs
                console.log(formInfo)

                // 发起请求，添加商品
                this.$http.post('goods',formInfo).then(({data:res}) => {
                    if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
                    this.$message.success(res.meta.msg)
                    this.$router.push('/goods')
                })
            })
        }
    },
    created() {
        this.getCateList()
    },
}
</script>

<style>
</style>