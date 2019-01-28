<template>
  <div id="dashboard">

    <h1> {{ finalIpfsUpload.ipfsHash }}</h1>
    <div class="row">
      <div class="col-6">
        <form>

          <div class="form-group row">
            <label for="artworkName"
                   class="col-sm-2 col-form-label">
              Name
            </label>
            <div class="col-sm-10">
              <input type="text"
                     class="form-control"
                     id="artworkName"
                     v-model="ipfsData.artworkName"/>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-sm-2">
              <label for="editionDescription">Description</label>
            </div>
            <div class="col-sm-10">
             <textarea class="form-control" id="editionDescription" rows="3"
                       v-model="ipfsData.description"></textarea>
            </div>
          </div>

          <div class="form-group row">
            <label for="artistManual"
                   class="col-sm-2 col-form-label">
              Artist
            </label>
            <div class="col-sm-10">
              <input type="text"
                     class="form-control"
                     id="artistManual"
                     v-model="ipfsData.artistManual"/>
            </div>
          </div>

          <div class="form-group row">
            <div class="col-sm-2">
              <label for="maxQnty">Max Quantity</label>
            </div>
            <div class="col-sm-10">
              <input type="number"
                     class="form-control"
                     id="maxQnty"
                     v-model="ipfsData.maxQnty"/>
            </div>
          </div>

          <hr/>

          <div class="form-group row">
            <div class="col-sm-2">Image</div>
            <div class="col-sm-10">
              <div class="input-group mb-3">
                <div class="custom-file">
                  <input type="file"
                         class="custom-file-input"
                         id="lowResImage"
                         @change="captureFile"
                         :disabled="isImgSaving"
                         accept="image/*">
                  <label class="custom-file-label" for="lowResImage">Choose token metadata image...</label>
                </div>
              </div>

              <p v-if="isImgInitial">
                Uploading file...
              </p>
              <p v-if="isImgSaving">
                Saving to IPFS...
              </p>
              <div v-if="isImgSuccess" class="row">
                <div class="col">
                  Successfully saved to IPFS
                  <br/>
                  <a target="_blank"
                     :href="'https://ipfs.infura.io/ipfs/' + imageUpload.ipfsHash">{{imageUpload.ipfsHash}}</a>
                </div>
                <div class="col">
                  <img :src="'https://ipfs.infura.io/ipfs/' + imageUpload.ipfsHash"
                       class="img-thumbnail" style="max-height: 100px"/>
                </div>
              </div>
              <p v-if="isImgFailed">
                Failed: {{ imageUpload.uploadError }}
              </p>

            </div>

          </div>

          <hr/>

          <div class="form-group row">
            <div class="col-sm-2">
              <label for="externalUri">External URI</label>
            </div>
            <div class="col-sm-10">
              <input type="text" class="form-control" id="externalUri"
                     v-model="ipfsData.external_uri"/>
            </div>
          </div>

        </form>

        <form>
          <div class="form-group row">
            <div class="col-sm-2">
              <label for="minPrice">Min Price</label>
            </div>
            <div class="col-sm-10">

              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text">WEI</span>
                </div>

                <input type="number" class="form-control" id="minPrice"
                       v-model="cardDesign.minPrice"/>

                <div class="input-group-append">
                  <span class="input-group-text">$</span>
                  <span class="input-group-text">{{usdPrice()}}</span>
                </div>
              </div>
              <div>
                <span>{{ cardDesign.minPrice | toEth}} ETH</span>
                <span class="float-right">USD @ {{currentUsdPrice}} p/eth</span>
              </div>
            </div>
          </div>
        </form>

      </div>
      <div class="col-6">
        <div>
          <h5>IPFS</h5>
          <pre class="border">{{tokenMetadata()}}</pre>

          <input type="button"
                 class="btn btn-primary"
                 v-on:click="uploadMetaData"
                 :disabled="!allDataCaptured"
                 value="Upload Metadata"
          />

          <p>
            Token URI IPFS hash: <a target="_blank" :href="'https://ipfs.infura.io/ipfs/' + finalIpfsUpload.ipfsHash">{{finalIpfsUpload.ipfsHash}}</a>
          </p>

          <p v-if="isIpfsSaving">
            Saving to IPFS...
          </p>
          <p v-if="isIpfsSuccess">
            Successfully saved to IPFS - hash = [{{finalIpfsUpload.ipfsHash}}]
          </p>
          <p v-if="isIpfsFailed">
            Failed: {{ imageUpload.uploadError }}
          </p>

          <hr/>

          <h5>Card Design</h5>
          <pre class="border">{{fullEditionData()}}</pre>

          <strong>TODO - once the contracts are on mainnet allow creation via metamask</strong>

        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import * as _ from 'lodash';
  import IPFS from 'ipfs-api';
  import Web3 from 'web3';
  import Vue from 'vue';

  const ipfs = IPFS('ipfs.infura.io', '5001', {protocol: 'https'});

  const STATUS_INITIAL = 0;
  const STATUS_SAVING = 1;
  const STATUS_SUCCESS = 2;
  const STATUS_FAILED = 3;

  export default {
    name: 'dashboard',
    components: {},
    data() {
      return {
        finalIpfsUpload: {
          ipfsHash: null,
          uploadError: null,
          currentStatus: null,
        },
        imageUpload: {
          ipfsHash: null,
          uploadError: null,
          currentStatus: null,
        },
        ipfsData: {
          artistManual: '',
          artworkName: '',
          description: '',
          external_uri: 'https://radi.cards',
        },
        cardDesign: {
          cardIndex: 0,
          minPrice: 0,
          maxQnty: 1,
        }
      };
    },
    computed: {
      ...mapState([
        'currentUsdPrice',
        'highestEditionDetails'
      ]),
      isImgInitial() {
        return this.imageUpload.currentStatus === STATUS_INITIAL;
      },
      isImgSaving() {
        return this.imageUpload.currentStatus === STATUS_SAVING;
      },
      isImgSuccess() {
        return this.imageUpload.currentStatus === STATUS_SUCCESS;
      },
      isImgFailed() {
        return this.imageUpload.currentStatus === STATUS_FAILED;
      },
      isIpfsSaving() {
        return this.finalIpfsUpload.currentStatus === STATUS_SAVING;
      },
      isIpfsSuccess() {
        return this.finalIpfsUpload.currentStatus === STATUS_SUCCESS;
      },
      isIpfsFailed() {
        return this.finalIpfsUpload.currentStatus === STATUS_FAILED;
      },
    },
    methods: {
      usdPrice() {
        if (this.currentUsdPrice && this.cardDesign.minPrice) {
          let priceInEther = Web3.utils.fromWei(this.cardDesign.minPrice, 'ether').valueOf();
          let value = this.currentUsdPrice * priceInEther;
          return value.toFixed(4);
        }
        return 0;
      },
      captureFile(event) {
        event.stopPropagation();
        event.preventDefault();
        this.imageUpload.currentStatus = STATUS_INITIAL;
        const file = event.target.files[0];
        let reader = new FileReader();
        reader.onloadend = () => this.saveFileToIpfs(reader);
        reader.readAsArrayBuffer(file);
      },
      saveFileToIpfs(reader) {
        this.imageUpload.currentStatus = STATUS_SAVING;
        const buffer = Buffer.from(reader.result);
        ipfs.add(buffer)
          .then(function (response) {
            console.log(response);
            Vue.notify({group: 'alerts', type: 'info', title: `Saved to IPFS - now pinning...`});

            return ipfs.pin.add(response[0].hash)
              .then((pinningResult) => {
                console.log(pinningResult);
                Vue.notify({group: 'alerts', type: 'success', title: `Saved to IPFS - [${response[0].hash}]`});
                this.imageUpload.ipfsHash = response[0].hash;
                this.imageUpload.currentStatus = STATUS_SUCCESS;
              });

          }.bind(this))
          .catch(function (error) {
            this.imageUpload.currentStatus = STATUS_FAILED;
            this.imageUpload.uploadError = error;
          }.bind(this));
      },
      tokenMetadata: function () {
        return {
          name: this.ipfsData.artworkName,
          description: this.ipfsData.description,
          image: `https://ipfs.infura.io/ipfs/${this.imageUpload.ipfsHash}`,
          attributes: {
            artist: this.ipfsData.artistManual,
          },
          external_uri: this.ipfsData.external_uri,
        };
      },
      uploadMetaData: function (event) {
        event.stopPropagation();
        event.preventDefault();

        let buffer = Buffer.from(JSON.stringify(this.tokenMetadata()));

        ipfs.add(buffer)
          .then(function (response) {
            console.log(response);
            Vue.notify({group: 'alerts', type: 'info', title: `Saved to IPFS - now pinning...`});
            return ipfs.pin.add(response[0].hash)
              .then((pinningResult) => {
                console.log(pinningResult);
                Vue.notify({group: 'alerts', type: 'success', title: `Saved to IPFS - [${response[0].hash}]`});
                this.finalIpfsUpload.ipfsHash = response[0].hash;
              });
          }.bind(this))
          .catch(function (error) {
            console.log(error);
          });
      },
      allDataCaptured: function () {
        if (_.size(this.ipfsData.artistManual) <= 0) {
          return false;
        }
        if (_.size(this.ipfsData.artworkName) <= 0) {
          return false;
        }
        if (_.size(this.ipfsData.description) <= 0) {
          return false;
        }
        if (_.size(this.ipfsData.external_uri) <= 0) {
          return false;
        }
        return true;
      },

      fullEditionData() {
        return {
          ...this.cardDesign,
          tokenURI: this.finalIpfsUpload.ipfsHash
        };
      },
    },
  };
</script>

<style lang="scss" scoped>

</style>
