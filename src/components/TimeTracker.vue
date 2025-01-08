<template>
    <div class="loading-bar-container">
        <div 
            class="loading-bar" 
            :style="{ width: progress + '%' }">
        </div>
    </div>
  </template>
  <script>
  export default {
    data() {
      return {
        progress: 0, // Progress percentage
        interval: null, // Interval timer
      };
    },
    props: {
      duration: {
        type: Number,
        required: true, // Duration in seconds
      },
    },
    methods: {
      startLoading() {
        const step = 100 / (this.duration * 10); // Increment every 100ms
        this.interval = setInterval(() => {
          if (this.progress >= 100) {
            clearInterval(this.interval);
          } else {
            this.progress += step;
          }
        }, 100);
      },
    },
    mounted() {
      this.startLoading();
    },
    beforeDestroy() {
      if (this.interval) clearInterval(this.interval);
    },
  };
  </script>
  
  <style scoped>
  .loading-bar-container {
    width: 100%;
    height: 4px;
    background-color: #f0f0f0;
    overflow: hidden;
    position: relative;
    margin-top: 0px;
    bottom: 0; /* Float the loading bar to the bottom */
  }
  
  .loading-bar {
    height: 100%;
    background-color: red;
    transition: width 0.1s linear;
  }
  </style>