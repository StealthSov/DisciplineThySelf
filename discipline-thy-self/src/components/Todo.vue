<script setup>
import {reactive} from 'vue';
    let workoutData = reactive({
        pushups: 15,
        situps: 0,
        squats: 0,
        miles: 0
    })
</script>

<template>
    <div>
        <ul>
            <li>
                <label :for="pushups">Pushups: {{ workoutData.pushups }}</label>
                <input :id="pushups" type="range" min="0" max="100" v-model="workoutData.pushups">
            </li>
        </ul>
    </div>
</template>

<style scoped>
    ul {
        list-style-type: none;
    }
</style>