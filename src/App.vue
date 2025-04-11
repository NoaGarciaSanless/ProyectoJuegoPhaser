<script setup lang="ts">
import Phaser from 'phaser';
import { ref, toRaw } from 'vue';


import PhaserGame from './game/PhaserGame.vue';


//  References to the PhaserGame component (game and scene are exposed)
const phaserRef = ref();


</script>

<template>
    <PhaserGame ref="phaserRef" />

</template>

<style scoped>

</style>