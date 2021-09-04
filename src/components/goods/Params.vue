<template>
    <div>
        <!-- 头部导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 警告内容区域 -->
            <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false" show-icon></el-alert>

            <!-- 选择分类区域 -->
            <el-row style="margin-top:20px">
                <el-col>
                    <span class="title-message">选择商品分类:</span>
                    <!-- 级联选择框-->
                    <el-cascader clearable style="margin-left:25px;width:300px" v-model="selectedCarId" :options="cateList" :props="cascaderProps" @change="handleChange"></el-cascader>
                </el-col>
            </el-row>

            <!-- tab页签区域 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="small" :disabled="isButtonDisabled" @click="addParamsDialogVisiable = true">添加参数</el-button>
                    <!-- 渲染动态参数 -->
                    <el-table :data="manyTableData" border stripe style="margin-top:20px">
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag @close="handleClose(scope.row,index)" closable :style="index === 0 ? 'margin-left:50px' : 'margin-left:20px'" v-for="(value,index) in scope.row.attr_vals" :key="index">{{value}}</el-tag>
                                <el-input style="width:150px;margin-left:20px" class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button style="margin-left:20px" v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引行 -->
                        <el-table-column type="index" label="#"></el-table-column>
                        <!-- 数据 -->
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <!-- 操作 -->
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="small" @click="editParamsDialogShow(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="small" :disabled="isButtonDisabled" @click="addParamsDialogVisiable = true">添加属性</el-button>
                    <!-- 渲染静态参数 -->
                    <el-table :data="onlyTableData" border stripe style="margin-top:20px">
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag :style="index === 0 ? 'margin-left:50px' : 'margin-left:20px'" closable v-for="(value,index) in scope.row.attr_vals" :key="index" @close="handleClose(scope.row,index)">{{value}}</el-tag>
                                <el-input style="width:150px;margin-left:20px" class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button style="margin-left:20px" v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引行 -->
                        <el-table-column type="index" label="#"></el-table-column>
                        <!-- 数据 -->
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <!-- 操作 -->
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="small" @click="editParamsDialogShow(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加参数对话框 -->
        <el-dialog :title="'添加' + titleText" :visible.sync="addParamsDialogVisiable" width="50%" @close="addParamsDialogClosed">
            <!-- 表单区域 -->
            <el-form :model="addParamsForm" :rules="ParamsFormRules" ref="addParamsFormRef" label-width="80px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addParamsForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addParamsDialogVisiable = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改参数对话框 -->
        <el-dialog :title="'修改' + titleText" :visible.sync="editParamsDialogVisiable" width="50%" @close="editParamsDialogClosed">
            <!-- 表单区域 -->
            <el-form :model="editParamsForm" :rules="ParamsFormRules" ref="editParamsFormRef" label-width="80px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editParamsForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editParamsDialogVisiable = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'Params',
    data() {
        return {
            // 所有的商品分类
            cateList: [],
            // 级联选择器配置项
            cascaderProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                expandTrigger: 'hover',
                // checkStrictly: true,
            },
            // 级联选择框选中的id数组
            selectedCarId: [],
            // 页签选择
            activeName: 'many',
            // 保存动态参数
            manyTableData: [],
            // 保存静态属性
            onlyTableData: [],
            // 控制添加参数对话框的显示与隐藏
            addParamsDialogVisiable: false,
            // 控制编辑参数对话框的显示与隐藏
            editParamsDialogVisiable: false,
            // 添加-表单数据信息
            addParamsForm: {
                attr_name: '',
            },
            // 编辑-表单
            editParamsForm: {
                arrt_name: '',
            },
            // 表单验证规则
            ParamsFormRules: {
                attr_name: [
                    {
                        required: true,
                        message: '请输入角色名称',
                        trigger: 'blur',
                    },
                ],
            },
        }
    },
    computed: {
        // 设置按钮是否禁用的条件
        isButtonDisabled() {
            if (this.selectedCarId.length === 0) return true
            return false
        },
        // 根据不同的tab选择对话框的标题
        titleText() {
            if (this.activeName === 'many') return '动态参数'
            return '静态属性'
        },
    },
    methods: {
        // 获取所有的商品分类
        getCateList() {
            this.$http
                .get('categories')
                .then(({ data: res }) => {
                    if (res.meta.status !== 200)
                        return this.$message.error(res.meta.msg)
                    this.cateList = res.data
                })
                .catch((err) => err)
        },
        // 发送请求获取数据
        getParamsData() {
            if (this.selectedCarId.length !== 3) {
                this.selectedCarId = 0
                this.manyTableData = []
                this.onlyTableData = []
                return
            }
            this.$http
                .get(`categories/${this.selectedCarId[2]}/attributes`, {
                    params: { sel: this.activeName },
                })
                .then(({ data: res }) => {
                    if (res.meta.status !== 200)
                        return this.$message.error(res.meta.msg)
                    res.data.forEach((item) => {
                        item.inputVisible = false
                        item.inputValue = ''
                        item.attr_vals = item.attr_vals
                            ? item.attr_vals.split(' ')
                            : []
                    })
                    if (this.activeName === 'many') {
                        this.manyTableData = res.data
                    } else {
                        this.onlyTableData = res.data
                    }
                })
        },
        // 级联选择器发生变化时 的回调函数
        handleChange() {
            this.getParamsData()
        },
        // 页签被点击时的回调
        handleTabClick() {
            this.getParamsData()
        },
        // 当添加参数的对话框关闭时的回调
        addParamsDialogClosed() {
            this.$refs.addParamsFormRef.resetFields()
        },
        // 添加参数
        addParams() {
            this.$refs.addParamsFormRef.validate((valid) => {
                if (!valid) return
                this.$http
                    .post(`categories/${this.selectedCarId[2]}/attributes`, {
                        attr_name: this.addParamsForm.attr_name,
                        attr_sel: this.activeName,
                    })
                    .then(({ data: res }) => {
                        if (res.meta.status !== 201)
                            return this.$message.error(res.meta.msg)
                        this.$message.success(res.meta.msg)
                        this.addParamsDialogVisiable = false
                        this.getParamsData()
                    })
                    .catch((err) => err)
            })
        },
        // 当编辑参数的对话框关闭时的回调
        editParamsDialogClosed() {
            this.$refs.editParamsFormRef.resetFields()
        },
        // 编辑参数
        editParams() {
            this.$refs.editParamsFormRef.validate((valid) => {
                if (!valid) return
                this.$http
                    .put(
                        `categories/${this.selectedCarId[2]}/attributes/${this.editParamsForm.attr_id}`,
                        {
                            attr_name: this.editParamsForm.attr_name,
                            attr_sel: this.activeName,
                        }
                    )
                    .then(({ data: res }) => {
                        if (res.meta.status !== 200)
                            return this.$message.error(res.meta.msg)
                        this.$message.success(res.meta.msg)
                        this.editParamsDialogVisiable = false
                        this.getParamsData()
                    })
            })
        },
        // 点击修改参数时的点击事件
        editParamsDialogShow(id) {
            this.$http
                .get(`categories/${this.selectedCarId[2]}/attributes/${id}`, {
                    params: { attr_sel: this.activeName },
                })
                .then(({ data: res }) => {
                    if (res.meta.status !== 200)
                        return this.$message.error(res.meta.msg)
                    this.editParamsForm = res.data
                })
                .catch((err) => err)
            this.editParamsDialogVisiable = true
        },
        // 删除参数
        deleteParams(id) {
            this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            })
                .then(() => {
                    this.$http
                        .delete(
                            `categories/${this.selectedCarId[2]}/attributes/${id}`
                        )
                        .then(({ data: res }) => {
                            if (res.meta.status !== 200)
                                return this.$message.error(res.meta.msg)
                            this.$message.success(res.meta.msg)
                            this.getParamsData()
                        })
                })
                .catch(() => {
                    this.$message.info('已取消操作~')
                })
        },
        // 添加或者修改tag时调用
        setAttrVals(info) {
            this.$http
                .put(
                    `categories/${this.selectedCarId[2]}/attributes/${info.attr_id}`,
                    {
                        attr_name: info.attr_name,
                        attr_sel: this.activeName,
                        attr_vals: info.attr_vals.join(' '),
                    }
                )
                .then(({ data: res }) => {
                    if (res.meta.status !== 200)
                        return this.$message.error(res.meta.msg)
                    this.$message.success(res.meta.msg)
                })
                .catch((arr) => err)
        },
        // input失去焦点或者按下enter都触发
        handleInputConfirm(info) {
            // input框的值为空时的操作
            if (info.inputValue.trim().length === 0) {
                info.inputVisible = false
                info.inputValue = ''
                return
            }
            // input框的值不为空
            info.attr_vals.push(info.inputValue.trim())
            info.inputValue = ''
            info.inputVisible = false
            this.setAttrVals(info)
        },
        // 点击tag触发
        showInput(info) {
            info.inputVisible = true
            this.$nextTick((_) => {
                this.$refs.saveTagInput.$refs.input.focus()
            })
        },
        // tag点击删除事件
        handleClose(row, index) {
            row.attr_vals.splice(index, 1)
            this.setAttrVals(row)
        },
    },
    created() {
        this.getCateList()
    },
}
</script>

<style lang="less" scoped>
.el-card {
    margin-top: 20px;
}
.title-message {
    font-size: 16px;
    color: #333744;
}
</style>