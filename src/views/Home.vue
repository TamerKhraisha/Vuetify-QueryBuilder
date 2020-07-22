<template>
  <div class="home">
    <QueryBuilder />
  </div>
</template>

<script>
// @ is an alias to /src
import QueryBuilder from "@/components/QueryBuilder.vue";

export default {
  name: "Home",
  components: {
    QueryBuilder
  }
};
</script>
