<template>
    <ion-modal
      :is-open="isOpen"
      @ionModalDidDismiss="closeModal"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Message</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="modal-content">
          <p>{{ message }}</p>
        </div>
      </ion-content>
    </ion-modal>
  </template>
  
  <script>
  import { defineComponent, ref } from 'vue';
  import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent } from '@ionic/vue';
  
  export default defineComponent({
    name: 'PopupModal',
    components: {
      IonModal,
      IonHeader,
      IonToolbar,
      IonTitle,
      IonButtons,
      IonButton,
      IonContent,
    },
    props: {
      message: {
        type: String,
        required: true,
      },
    },
    setup() {
      const isOpen = ref(false);
  
      const openModal = () => {
        isOpen.value = true;
      };
  
      const closeModal = () => {
        isOpen.value = false;
      };
  
      return {
        isOpen,
        openModal,
        closeModal,
      };
    },
  });
  </script>
  
  <style scoped>
  .modal-content {
    padding: 16px;
    text-align: center;
  }
  </style>