<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Realtime Chess</ion-title>
        <div slot="start">
          <strong>Team {{ teamColor }}</strong>
        </div>
        <div slot="end">
          <strong>{{ queueStatus }}</strong>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Blank</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <chess-board class="chess-board" @queueStatus="queueStatusHandler" @teamColor="teamColorHandler"/>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
// @ts-ignore
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
// @ts-ignore
import ChessBoard from '@/components/ChessBoard.vue';

export default {
  components: {
    ChessBoard
  },
  data() {
    return {
      queueStatus: 'Waiting for server to connect...',
      teamColor: ''
    }
  },
  methods: {
    queueStatusHandler(status: any) {
      this.queueStatus = status;
    },
    teamColorHandler(color: any) {
      this.teamColor = color;
    }
  }
}

</script>

<style scoped>
#container {
  text-align: center;
  
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  
  color: #8c8c8c;
  
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
