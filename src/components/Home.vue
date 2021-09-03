<template>
    <el-container class="home-container">
        <!-- 头部 -->
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="logo">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="loginOut">退出</el-button>
        </el-header>
        <!-- 主体部分 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside v-bind:width="isCollapse ? '64px' : '200px'">
                <!-- 侧边栏折叠功能 -->
                <div class=" toggle-button" @click="toggleCollapse">|||</div>
                <!-- 侧边栏菜单 -->
                <el-menu v-bind:default-active="isActived" v-bind:router="true" v-bind:collapse-transition="false" v-bind:collapse="isCollapse" text-color="#fff" active-text-color="#409eff" background-color="#333744" v-bind:unique-opened="true">
                    <!-- 一级菜单 -->
                    <el-submenu v-bind:index="String(item.id)" v-for="item in menuList" v-bind:key="item.id">
                        <!-- 一级菜单模板 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i v-bind:class="icons[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{item.authName}}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item @click="saveNavState('/'+subItem.path)" v-bind:index="'/'+subItem.path" v-for="subItem in item.children" v-bind:key="subItem.id">
                            <!-- 二级菜单模板 -->
                            <template slot="title">
                                <!-- 图标 -->
                                <i class="el-icon-menu"></i>
                                <!-- 模板 -->
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- main内容区 -->
            <el-main>
                <!-- 路由站位符 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    name: 'Home',
    data() {
        return {
            // 左侧菜单数据
            menuList: [],
            // 字体图标数据
            icons: {
                125: 'iconfont icon-users',
                103: 'iconfont icon-tijikongjian',
                101: 'iconfont icon-shangpin',
                102: 'iconfont icon-danju',
                145: 'iconfont icon-baobiao',
            },
            // 折叠开关
            isCollapse: false,
            // 二级标题高亮
            isActived:""
        }
    },
    methods: {
        // 退出功能
        loginOut() {
            sessionStorage.clear()
            this.$router.push('/login')
        },
        // 获取菜单信息
        async getMenuList() {
            const { data: response } = await this.$http.get('menus')
            if (response.meta.status !== 200)
                return this.$message.error(response.meta.msg)
            this.menuList = response.data
        },
        // 折叠开关
        toggleCollapse() {
            this.isCollapse = !this.isCollapse
        },
        // 处理二级标题高亮
        saveNavState(value){
            sessionStorage.setItem("active",value);
            this.isActived = value;
        }
    },
    created() {
        this.getMenuList()
        this.isActived = sessionStorage.getItem("active")
    },
}
</script>

<style lang="less" scoped>
.home-container {
    height: 100%;
}
.el-header {
    background-color: #373d3f;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0;
    font-size: 20px;
    font-weight: 700;
    div {
        display: flex;
        align-items: center;
        span {
            margin-left: 10px;
            color: white;
        }
    }
}
.el-aside {
    background-color: #333744;
    .el-menu {
        border-right: none;
    }
}
.el-main {
    background-color: #eaedf1;
}
.iconfont {
    margin-right: 10px;
}
.toggle-button {
    background-color: #4a5064;
    line-height: 25px;
    text-align: center;
    font-size: 10px;
    color: white;
    letter-spacing: 0.3em;
    cursor: pointer;
    user-select: none;
}
</style>