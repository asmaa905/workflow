<template>
    <div class="mt-0 main-layout">
        <sidebar-comp />
        <div class="p-4 sm:ml-64">
          <slot />
        </div>
      </div>
    </template>
    <script>
      import SidebarComp from './Sidebar.vue';
      export default {
        name:"main-layout",
        data() {
          return{}
        },
        props: [],
        methods: { },
        components: { SidebarComp },
      }
    </script>
