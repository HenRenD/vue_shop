<template>
    <div>
        <!-- 头部导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 头部添加分类区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addClassifyDialogShow">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- 表格展示区 -->
            <tree-table :show-row-hover="false" class="tree-table" :data="CateList" :columns="columns" :selection-type="false" :expand-type="false" show-index border>
                <!-- 是否有效模板 -->
                <template slot="isOk" slot-scope="scope">
                    <i v-show="!scope.row.cat_deleted" class="el-icon-success" style="color:lightgreen"></i>
                    <i v-show="scope.row.cat_deleted" class="el-icon-error" style="color:red"></i>
                </template>
                <!-- 排序模板 -->
                <template slot="sort" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
                    <el-tag v-else type="warning">三级</el-tag>
                </template>
                <!-- 操作区模板 -->
                <template slot="handle" slot-scope="scope">
                    <el-button size="small" type="primary" icon="el-icon-edit" @click="editClassifyDialogShow(scope.row)">编辑</el-button>
                    <el-button size="small" type="danger" icon="el-icon-delete" @click="deleteClassify(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>

            <!-- 底部分页区 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

        <!--添加分类对话框  -->
        <el-dialog title="添加分类" :visible.sync="addClassifyDialogVisible" width="50%" @close="addClassifyDialogClosed">
            <!-- 表单区域 -->
            <el-form :model="addClassifForm" :rules="FormRules" ref="classifyRef" label-width="80px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addClassifForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <el-cascader clearable class="cascader" v-model="selectedKeys" :options="addClassifCateList" :props="cascaderProps" @change="handleChange"></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addClassifyDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addClassify">确 定</el-button>
            </span>
        </el-dialog>

        <!--编辑分类对话框  -->
        <el-dialog title="编辑分类" :visible.sync="editClassifyDialogVisible" width="50%">
            <!-- 表单区域 -->
            <el-form :model="editClassifForm" :rules="FormRules" ref="classifyRef" label-width="80px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="editClassifForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editClassifyDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editClassify">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'Cate',
    data() {
        return {
            // 所有的商品分类信息
            CateList: [],
            // 查询参数
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5,
            },
            // 分类总计
            total: 0,
            // 表格每一列的数据配置
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name',
                },
                {
                    label: '是否有效',
                    // 当前列为模板
                    type: 'template',
                    // 要使用的模板名称
                    template: 'isOk',
                },
                {
                    label: '排序',
                    type: 'template',
                    template: 'sort',
                },
                {
                    label: '操作',
                    type: 'template',
                    template: 'handle',
                },
            ],
            // 控制添加分类对话框的显示与隐藏
            addClassifyDialogVisible: false,
            // 表单验证规则
            FormRules: {
                cat_name: [
                    {
                        required: true,
                        message: '请输入角色名称',
                        trigger: 'blur',
                    },
                    {
                        min: 1,
                        max: 10,
                        message: '长度在 1 到 10 个字符',
                        trigger: 'blur',
                    },
                ],
            },
            // 添加分类的表单信息
            addClassifForm: {
                cat_name: '',
                cat_pid: 0,
                cat_level: 0,
            },
            // 添加分类是获取的分类信息
            addClassifCateList: [],
            // 级联选择器配置对象
            cascaderProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                expandTrigger: 'hover',
                checkStrictly: true,
            },
            // 选中的分类id数组
            selectedKeys: [],
            // 控制编辑分类对话框显示与隐藏
            editClassifyDialogVisible: false,
            // 编辑分类表单信息
            editClassifForm: {},
        }
    },
    methods: {
        // 获取商品分类信息
        getCateList() {
            this.$http
                .get('categories', { params: this.queryInfo })
                .then(({ data: res }) => {
                    if (res.meta.status !== 200)
                        return this.$message.error(res.meta.msg)
                    this.CateList = res.data.result
                    this.total = res.data.total
                })
        },
        // 监听页面数据展示条数发生改变事件
        handleSizeChange(newVal) {
            this.queryInfo.pagesize = newVal
            this.getCateList()
        },
        // 监听页数改变
        handleCurrentChange(newVal) {
            this.queryInfo.pagenum = newVal
            this.getCateList()
        },
        // 添加分类对话框显示
        addClassifyDialogShow() {
            this.$http
                .get('categories', { params: { type: 2 } })
                .then(({ data: res }) => {
                    if (res.meta.status !== 200)
                        return this.$message.error(res.meta.msg)
                    this.addClassifCateList = res.data
                    console.log(res)
                })
            this.addClassifyDialogVisible = true
        },
        // 选择项发生改变时的回调函数
        handleChange() {
            if (this.selectedKeys.length > 0) {
                this.addClassifForm.cat_pid =
                    this.selectedKeys[this.selectedKeys.length - 1]
                this.addClassifForm.cat_level = this.selectedKeys.length
            } else {
                this.addClassifForm.cat_pid = 0
                this.addClassifForm.cat_level = 0
            }
        },
        // 添加分类
        addClassify() {
            this.$refs.classifyRef.validate((valid) => {
                if (!valid) return
                this.$http
                    .post('categories', this.addClassifForm)
                    .then(({ data: res }) => {
                        if (res.meta.status !== 201)
                            return this.$message.error(res.meta.msg)
                        this.$message.success(res.meta.msg)
                        this.getCateList()
                        this.addClassifyDialogVisible = false
                    })
            })
        },
        // 对话框关闭时，重置表单
        addClassifyDialogClosed() {
            this.$refs.classifyRef.resetFields()
            this.selectedKeys = []
            this.addClassifForm.cat_pid = 0
            this.addClassifForm.cat_level = 0
        },
        // 编辑分类对话框显示
        editClassifyDialogShow(info) {
            this.editClassifyDialogVisible = true
            this.editClassifForm = info
        },
        // 编辑分类
        editClassify() {
            this.$refs.classifyRef.validate((valid) => {
                if (!valid) return
                this.$http
                    .put(`categories/${this.editClassifForm.cat_id}`, {
                        cat_name: this.editClassifForm.cat_name,
                    })
                    .then(({ data: res }) => {
                        if (res.meta.status !== 200)
                            return this.$message.error(res.meta.msg)
                        this.$message.success(res.meta.msg)
                        this.getCateList()
                        this.editClassifyDialogVisible = false
                    })
            })
        },
        // 删除分类
        deleteClassify(id) {
            this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
              this.$http.delete(`categories/${id}`).then(({data:res}) => {
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
                this.getCateList()
                this.$message.success(res.meta.msg)
              })
            }).catch(() => {
              this.$message.info("已取消操作~")
            })
        },
    },
    created() {
        // 组件创建完成就开始获取数据
        this.getCateList()
    },
}
</script>

<style lang="less" scoped>
.el-card {
    margin-top: 20px;
}
.tree-table {
    margin-top: 20px;
}
.cascader {
    width: 100%;
}
.el-pagination {
    margin-top: 20px;
}
</style>