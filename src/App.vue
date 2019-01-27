<template>
  <div id="app">
    <div class="container">

      <div class="header clearfix">
        <h1 class="text-muted">Radi.Cards Onboarder
          <b-badge class="float-right">
            <current-network></current-network>
          </b-badge>
        </h1>
        <notifications group="alerts" />
      </div>

      <router-view></router-view>

      <div class="footer"></div>

    </div>

  </div>
</template>

<script>
  /* global web3:true */

  import Web3 from 'web3'
  import {mapGetters, mapState} from 'vuex'
  import * as actions from './store/actions'
  import * as mutations from './store/mutation-types'
  import CurrentNetwork from './components/CurrentNetwork'

  export default {
    name: 'app',
    components: {CurrentNetwork},
    computed: {
      ...mapGetters([]),
    },
    mounted() {

      let bootStrappedWeb3;

      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      if (typeof web3 !== 'undefined') {
        bootStrappedWeb3 = new Web3(web3.currentProvider);
      } else {
        console.log('No web3! You should consider trying MetaMask or an Ethereum browser');
        console.log('Falling back to using HTTP Provider');

        bootStrappedWeb3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/4ed01157025d44b0b0ad5932e1d877ea'));
      }

      window.web3 = bootStrappedWeb3;

      // Bootstrap the full app
      this.$store.dispatch(actions.INIT_APP, bootStrappedWeb3);
    },
  }
</script>

<style lang="scss">

  #app {

  }

  .header {
    margin: 20px;
  }
</style>
