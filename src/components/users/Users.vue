<template>
    <div>
        <!-- 头部导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card class="box-card">
            <!-- 头部 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="2">
                    <el-button type="primary" @click="dialogShow=true">添加用户</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表区 -->
            <el-table v-bind:data="userList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态" prop="mg_state">
                    <template slot-scope="scopeData">
                        <el-switch v-model="scopeData.row.mg_state" @change="userStateChange(scopeData.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scopeData">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editUserDialogShow(scopeData.row)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scopeData.row.id)"></el-button>
                        <el-tooltip effect="dark" content="分配角色" placement="top" v-bind:enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRolesShow(scopeData.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加用户对话框 -->
        <el-dialog title="添加用户" :visible.sync="dialogShow" width="50%" @closed="addDialogClosed">
            <!-- 表单区域 -->
            <el-form :model="addUserForm" :rules="addUserFormRules" ref="addUserFormRef" label-width="80px">
                <el-form-item label="用户名称" prop="username">
                    <el-input v-model="addUserForm.username"></el-input>
                </el-form-item>
                <el-form-item label="用户密码" prop="password">
                    <el-input v-model="addUserForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addUserForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="addUserForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogShow = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改用户对话框 -->
        <el-dialog title="修改用户" :visible.sync="editUserDialog" width="50%" @closed="editDialogClosed">
            <!-- 表单区域 -->
            <el-form :model="editUserForm" :rules="addUserFormRules" ref="editUserFormRef" label-width="70px">
                <el-form-item label="用户名称">
                    <el-input v-model="editUserForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editUserForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editUserForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editUserDialog = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配角色对话框 -->
        <el-dialog title="分配角色" :visible.sync="setRolesDialogVisible" width="50%" @close="setRolesDialogClosed">
            <div>
                <p>当前用户：{{rolesInfo.username}}</p>
                <p>当前角色：{{rolesInfo.role_name}}</p>
                <p>
                    分配新角色：
                    <el-select v-model="selectRole" placeholder="请选择">
                        <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
                    </el-select>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRolesDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="setRoles">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'Users',
    data() {
        // 验证邮箱规则
        const checkEmail = (rule, value, callback) => {
            const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
            if (regEmail.test(value)) {
                return callback()
            }
            return callback(new Error('请输入合法的邮箱！'))
        }
        // 验证手机号规则
        const checkMobile = (rule, value, callback) => {
            const regMobile =
                /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
            if (regMobile.test(value)) {
                return callback()
            }
            return callback(new Error('请输入合法的手机号！'))
        }
        return {
            // 获取用户列表的参数
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 5,
            },
            // 保存获取回来的用户数据
            userList: [],
            total: 0,
            // 控制添加用户对话空的显示和隐藏
            dialogShow: false,
            // 添加新用户的信息对象
            addUserForm: {
                username: '',
                password: '',
                email: '',
                mobile: '',
            },
            // 控制修改用户对话框的显示和隐藏
            editUserDialog: false,
            // 修改用户的信息对象
            editUserForm: {},
            // 添加新用户的表单验证规则
            addUserFormRules: {
                username: [
                    {
                        required: true,
                        message: '请输入登录名称',
                        trigger: 'blur',
                    },
                    {
                        min: 3,
                        max: 10,
                        message: '长度在 3 到 10 个字符',
                        trigger: 'blur',
                    },
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    {
                        min: 6,
                        max: 16,
                        message: '长度在 6 到 16 个字符',
                        trigger: 'blur',
                    },
                ],
                email: [
                    {
                        required: true,
                        message: '请输入邮箱',
                        trigger: 'blur',
                    },
                    {
                        validator: checkEmail,
                        trigger: 'blur',
                    },
                ],
                mobile: [
                    {
                        required: true,
                        message: '请输入手机号',
                        trigger: 'blur',
                    },
                    {
                        validator: checkMobile,
                        trigger: 'blur',
                    },
                ],
            },
            // 控制分配角色对话框的显示和隐藏
            setRolesDialogVisible: false,
            // 当前角色信息
            rolesInfo: {},
            // 获取的所有的角色信息
            rolesList: [],
            // 选中的角色
            selectRole:''
        }
    },
    methods: {
        // 获取用户列表
        async getUserList() {
            const { data: response } = await this.$http.get('users', {
                params: this.queryInfo,
            })
            if (response.meta.status !== 200)
                return this.$message.error(redponse.meta.msg)
            this.userList = response.data.users
            this.total = response.data.total
        },
        // 监听pagesize改变的事件，就是每一页显示多少条数据
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getUserList()
        },
        // 监听pagenum改变的事件，一共几页显示
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        // 处理用户状态更新
        async userStateChange(userInfo) {
            const { data: response } = await this.$http.put(
                `users/${userInfo.id}/state/${userInfo.mg_state}`
            )
            if (response.meta.status !== 200) {
                userInfo.mg_state = !userInfo.mg_state
                return this.$message.error('出错了~~~')
            }
            this.$message.success(response.meta.msg)
        },
        //添加用户的对话框关闭时，重置表单
        addDialogClosed() {
            this.$refs.addUserFormRef.resetFields()
        },
        // 添加新用户
        addUser() {
            this.$refs.addUserFormRef.validate(async (valid) => {
                if (!valid) return
                // 发起网络请求
                const { data: response } = await this.$http.post(
                    'users',
                    this.addUserForm
                )
                console.log(response)
                if (response.meta.status !== 201) {
                    return this.$message.error(response.meta.msg)
                }
                this.$message.success(response.meta.msg)
                this.dialogShow = false
                this.getUserList()
            })
        },
        // 修改用户对话框的显示，与用户数据的填充
        editUserDialogShow(value) {
            this.editUserDialog = true
            this.editUserForm = value
        },
        // 修改用户对话框关闭时，重置表单
        editDialogClosed() {
            this.$refs.editUserFormRef.resetFields()
        },
        // 修改用户
        editUser() {
            this.$refs.editUserFormRef.validate(async (valid) => {
                if (!valid) return
                const { data: response } = await this.$http.put(
                    'users/' + this.editUserForm.id,
                    {
                        email: this.editUserForm.email,
                        mobile: this.editUserForm.mobile,
                    }
                )
                if (response.meta.status !== 200) {
                    return this.$message.error(response.meta.msg)
                }
                this.editUserDialog = false
                this.$message.success(response.meta.msg)
                this.getUserList()
            })
        },
        // 删除用户
        deleteUser(value) {
            this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            })
                .then(async () => {
                    const { data: res } = await this.$http.delete(
                        'users/' + value
                    )
                    if (res.meta.status !== 200) {
                        return this.$message.error(res.meta.msg)
                    }
                    this.$message.success('删除成功~')
                    this.getUserList()
                })
                .catch(() => {
                    this.$message.info('已取消~')
                })
        },
        // 分配角色显示对话框
        setRolesShow(roles) {
            this.rolesInfo = roles
            // 获取角色列表
            this.$http
                .get('roles')
                .then(({ data: res }) => {
                    if (res.meta.status !== 200) {
                        return this.$message.error(res.meta.msg)
                    }
                    this.rolesList = res.data
                })
                .catch((err) => err)
            this.setRolesDialogVisible = true
        },
        // 分配角色 发起请求
        setRoles(){
            if (!this.selectRole){
                return this.$message.info("请选择要分配的角色！")
            }
            this.$http.put(`users/${this.rolesInfo.id}/role`,{rid:this.selectRole}).then(({data:res}) => {
                if(res.meta.status !== 200){
                    return this.$message.error(res.meta.msg)
                }
                this.$message.success(res.meta.msg)
                this.setRolesDialogVisible = false
                this.getUserList()
            }).catch(err => err)
        },
        // 分配角色对话框关闭时调用的函数
        setRolesDialogClosed(){
            this.selectRole = ""
            this.rolesInfo = {}
        }

    },
    // 生命周期钩子，创建之后
    created() {
        this.getUserList()
    },
}
</script>

<style lang="less" scoped>
.el-breadcrumb {
    margin-bottom: 20px;
}
.el-card {
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
}
.el-table {
    margin-top: 20px;
    font-size: 14px;
}
.el-pagination {
    margin-top: 20px;
}
</style>