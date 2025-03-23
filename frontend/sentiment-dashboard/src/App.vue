<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';
import SentimentChart from './components/SentimentChart.vue';
import type { SentimentData } from './types/sentiment';

const state = reactive<{ sentimentData: SentimentData[] }>({ sentimentData: [] });
const keyword = ref<string>('crypto');
const apiUrl = import.meta.env.VITE_SENTIMENT_API;

const fetchSentimentData = async () => {
  try {
    const response = await axios.get<SentimentData[]>(
      `${apiUrl}/sentiment/${keyword.value}`
    );
    state.sentimentData = [...response.data.slice(0, 15)];
  } catch (error) {
    console.error('Error fetching sentiment data:', error);
  }
};

onMounted(async () => {
  await fetchSentimentData();
});
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">Sentiment Analysis Dashboard</h1>

    <div class="">
      <sentiment-chart :sentimentData="state.sentimentData" :key="state.sentimentData.length" />
    </div>

  </div>
</template>
