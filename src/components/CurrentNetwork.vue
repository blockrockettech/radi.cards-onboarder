<template>
  <div class="current-network">
    {{ currentNetwork }}
  </div>
</template>

<script>
  /* global web3:true */

  import {mapState} from 'vuex'

  export default {
    name: 'currentNetwork',
    computed: {
      ...mapState(['currentNetwork']),
    },
  }
</script>

<style lang="scss" scoped>
  .current-network {
    font-size: 12px;
  }

</style>
