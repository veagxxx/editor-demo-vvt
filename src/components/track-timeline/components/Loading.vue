<template>
  <div class="loading">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
  </div>
</template>

<style lang="scss"scoped>
  .loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(75, 85, 99, 0.5);
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .loading span {
    display: inline-block;
    width: 8px;
    height: 100%;
    border-radius: 4px;
    opacity: 0.7;
    animation: load 1s ease infinite;
    -webkit-animation: load 1s ease infinite;
  }
  @keyframes load {
    0%, 100% {
      height: 12px;
      background: #FEF3C7;
    }
    50% {
      height: 30px;
      margin: -15px 0;
      background: #FCD34D;
    }
    100% {
      height: 16px;
      background: #F59E0B;
    }
  }
  .loading span:nth-child(2) {
    animation-delay: 0.2s;
    -webkit-animation-delay: 0.2s;
  }
  .loading span:nth-child(3) {
    animation-delay: 0.4s;
    -webkit-animation-delay: 0.4s;
  }
  .loading span:nth-child(4) {
    animation-delay: 0.6s;
    -webkit-animation-delay: 0.6s;
  }
  .loading span:nth-child(5) {
    animation-delay: 0.8s;
    -webkit-animation-delay: 0.8s;
  }
</style>