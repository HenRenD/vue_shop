<template>
    <div>
        <!-- 头部导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加角色部分 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>

            <!-- 角色列表区域 -->
            <el-table :data="rolesList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand" class="show">
                    <template slot-scope="scope">
                        <el-row :class="['center','border_bottom','margin_left',index_1 === 0 ? 'border_top':'']" v-for="(item_1,index_1) in scope.row.children" :key="item_1.id">
                            <!-- 一级权限 -->
                            <el-col :span="5">
                                <el-tag @close="removeRightById(scope.row,item_1.id)" closable>{{item_1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 二级和三级权限 -->
                            <el-col :span="19">
                                <el-row :class="[index_2 === 0 ? '':'border_top','center']" v-for="(item_2,index_2) in item_1.children" :key="item_2.id">
                                    <!-- 二级 -->
                                    <el-col :span="6">
                                        <el-tag @close="removeRightById(scope.row,item_2.id)" closable type="success">{{item_2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <!-- 三级 -->
                                    <el-col :span="18">
                                        <el-tag @close="removeRightById(scope.row,item_3.id)" closable type="warning" v-for="(item_3) in item_2.children" :key="item_3.id">{{item_3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button size="small" type="primary" icon="el-icon-edit" @click="editRoleDialogShow(scope.row)">编辑</el-button>
                        <el-button size="small" type="danger" icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
                        <el-button size="small" type="warning" icon="el-icon-s-tools" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 分配权限对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="whenDialogClosed">
            <!-- 树形控件 -->
            <el-tree ref="treeRef" :data="rightsList" :props="treeProps" show-checkbox node-key='id' default-expand-all :default-checked-keys='defaultRights'></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRights">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 添加角色对话框 -->
        <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" @close="addRoleDialogclosed">
            <!-- 表单区域 -->
            <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleRef" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRoles">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改角色对话框 -->
        <el-dialog title="修改角色" :visible.sync="editRoleDialogVisible" width="50%">
            <!-- 表单区域 -->
            <el-form :model="editRoleForm" :rules="addRoleFormRules" ref="editRoleRef" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRoles">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'Roles',
    data() {
        return {
            // 角色列表数据
            rolesList: [],
            // 分配权限对话框开关
            setRightDialogVisible: false,
            // 权限列表
            rightsList: [],
            // 树形控件配置
            treeProps: {
                label: 'authName',
                children: 'children',
            },
            // 将默认的三级权限加入到该数组中，会自动选中
            defaultRights: [],
            // 当前待分配权限角色id
            roleId: '',
            // 控制添加角色对话框的显示与隐藏
            addRoleDialogVisible: false,
            // 添加新角色的表单验证规则
            addRoleFormRules: {
                roleName: [
                    {
                        required: true,
                        message: '请输入角色名称',
                        trigger: 'blur',
                    },
                    {
                        min: 5,
                        max: 10,
                        message: '长度在 5 到 10 个字符',
                        trigger: 'blur',
                    },
                ],
                roleDesc: [
                    {
                        required: true,
                        message: '请输入角色描述',
                        trigger: 'blur',
                    },
                    {
                        min: 10,
                        max: 20,
                        message: '长度在 10 到 20 个字符',
                        trigger: 'blur',
                    },
                ],
            },
            // 添加新用户的信息对象
            addRoleForm: {
                roleName: '',
                roleDesc: '',
            },
            // 控制修改用户对话空的显示与隐藏
            editRoleDialogVisible: false,
            // 修改用户的信息对象
            editRoleForm: {
                id: '',
                roleName: '',
                roleDesc: '',
            },
            // 待删除用户的id
            deleteRoleId: '',
        }
    },
    methods: {
        // 定义获取数据方法
        getRolesList() {
            this.$http
                .get('roles')
                .then(({ data: res }) => {
                    this.rolesList = res.data
                })
                .catch((err) => {
                    return err
                })
        },
        // 删除权限
        removeRightById(role, rightId) {
            this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            })
                .then(() => {
                    this.$http
                        .delete(`roles/${role.id}/rights/${rightId}`)
                        .then(({ data: res }) => {
                            if (res.meta.status !== 200) {
                                return this.$message.error(res.meta.msg)
                            }
                            this.$message.success(res.meta.msg)
                            role.children = res.data
                        })
                })
                .catch(() => {
                    this.$message.info('已取消操作~')
                })
        },
        // 分配权限对话框
        showSetRightDialog(role) {
            // 获取所有权限的数据
            this.$http
                .get('rights/tree')
                .then(({ data: res }) => {
                    if (res.meta.status !== 200) {
                        return this.$message.error(res.meta.msg)
                    }
                    this.$message.success(res.meta.msg)
                    this.rightsList = res.data
                })
                .catch((err) => {
                    return err
                })
            this.getDefaultRights(role, this.defaultRights)
            this.setRightDialogVisible = true
            this.roleId = role.id
        },
        // 使用递归加载所有的三级权限
        getDefaultRights(node, arr) {
            // 如果node没有children，则是三级权限
            if (!node.children) {
                return arr.push(node.id)
            }
            // 如果node有children，则使用递归
            node.children.forEach((item) => {
                this.getDefaultRights(item, arr)
            })
        },
        // 当分配权限对话框关闭后
        whenDialogClosed() {
            this.defaultRights = []
        },
        // 添加权限
        addRights() {
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys(),
            ]
            this.$http
                .post(`roles/${this.roleId}/rights`, { rids: keys.join(',') })
                .then(({ data: res }) => {
                    console.log(this)
                    if (res.meta.status !== 200) {
                        return this.$message.error(res.meta.msg)
                    }
                    this.$message.success(res.meta.msg)
                    this.getRolesList()
                    this.setRightDialogVisible = false
                })
                .catch((err) => err)
        },
        // 当添加角色的对话框关闭的时候，重置表单
        addRoleDialogclosed() {
            this.$refs.addRoleRef.resetFields()
        },
        // 添加角色
        addRoles() {
            this.$refs.addRoleRef.validate((valid) => {
                if (!valid) return
                this.$http
                    .post('roles', this.addRoleForm)
                    .then(({ data: res }) => {
                        if (res.meta.status !== 201) {
                            return this.$message.error(res.meta.msg)
                        }
                        this.$message.success(res.meta.msg)
                        this.addRoleDialogVisible = false
                        this.getRolesList()
                    })
                    .catch((err) => err)
            })
        },
        // 修改角色对话框，点击显示
        editRoleDialogShow(roleInfo) {
            // 将当前角色信息填充
            this.editRoleForm.roleName = roleInfo.roleName
            this.editRoleForm.roleDesc = roleInfo.roleDesc
            this.editRoleForm.id = roleInfo.id
            // 显示对话框
            this.editRoleDialogVisible = true
        },
        // 修改角色，发送数据
        editRoles() {
            this.$refs.editRoleRef.validate((valid) => {
                if (!valid) return
                this.$http
                    .put(`roles/${this.editRoleForm.id}`, {
                        roleName: this.editRoleForm.roleName,
                        roleDesc: this.editRoleForm.roleDesc,
                    })
                    .then(({ data: res }) => {
                        if (res.meta.status !== 200) {
                            return this.$message.error(res.meta.msg)
                        }
                        this.$message.success('编辑成功')
                        this.editRoleDialogVisible = false
                        this.getRolesList()
                    })
            })
        },
        // 删除角色
        deleteRole(id) {
            this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                this.$http.delete(`roles/${id}`).then(({data:res}) => {
                    if (res.meta.status !== 200){
                        return thie.$message.error(res.meta.msg)
                    }
                    this.$message.success(res.meta.msg)
                    this.getRolesList()
                }).catch(err => err)
            }).catch(() => {
                this.$message.info("已取消操作~")
            })
        },
    },
    created() {
        // 组件创建完毕调用数据获取方法
        this.getRolesList()
    },
}
</script>

<style lang="less" scoped>
.el-card {
    margin-top: 20px;
}
.el-table {
    margin-top: 20px;
}
.el-tag {
    margin: 7px;
}
.border_top {
    border-top: 1px solid #eee;
}
.border_bottom {
    border-bottom: 1px solid #eee;
}
.margin_left {
    margin-left: 50px;
}
.center {
    display: flex;
    align-items: center;
}
</style>