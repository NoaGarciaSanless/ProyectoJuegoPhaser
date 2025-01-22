<script setup lang="ts">
    import Phaser from 'phaser';
    import { ref, toRaw } from 'vue';


    import PhaserGame from './game/PhaserGame.vue';


    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = ref();
    const spritePosition = ref({ x: 0, y: 0 });


</script>

<template>
    <PhaserGame ref="phaserRef" />
</template>
