<template>
  <v-app>
    <transition name="fadeonly" mode="out-in">
      <router-view></router-view>
    </transition>
  </v-app>
</template>

<script>
export default {
  name: "App"
};
</script>
