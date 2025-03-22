<script lang="ts" setup>
  import type { SentimentData } from '../types/sentiment';
  import moment from 'moment';
  import { defineProps, computed } from 'vue';

  const props = defineProps({
    sentimentData: {
      type: Array<SentimentData>,
      required: true
    }
  })

  const sentimentData = computed(() => {
    return props.sentimentData
  })

  console.log(sentimentData, '🙂')

  const chartData = computed(() => {
    const sentiments: {
      [key: string]: {
        type: string,
        name: string,
        showInLegend: boolean,
        color: string,
        dataPoints: {
          label: string,
          y: number
        }[]
      }
    } = {
      Neutral: {
        type: "line",
        name: "Neutral",
        showInLegend: true,
        color: "#A0A0A0",
        dataPoints: []
      },
      Positive: {
        type: "line",
        name: "Positive",
        showInLegend: true,
        color: "#00FF00",
        dataPoints: []
      },
      Negative: {
        type: "line",
        name: "Negative",
        showInLegend: true,
        color: "#FF0000",
        dataPoints: []
      },
      Mixed: {
        type: "line",
        name: "Mixed",
        showInLegend: true,
        color: "#012066",
        dataPoints: []
      }
    }

    sentimentData.value.forEach((data: SentimentData) => {
      const { SentimentScore, CreatedAt } = data
      const { Neutral, Positive, Negative, Mixed, } = SentimentScore.M
      
      sentiments.Neutral.dataPoints.push({ label: moment(CreatedAt?.S ?? Date.now()).format('L'), y: Number(Neutral.N) })
      sentiments.Positive.dataPoints.push({ label: moment(CreatedAt?.S ?? Date.now()).format('L'), y: Number(Positive.N) })
      sentiments.Negative.dataPoints.push({ label: moment(CreatedAt?.S ?? Date.now()).format('L'), y: Number(Negative.N) })
      sentiments.Mixed.dataPoints.push({ label: moment(CreatedAt?.S ?? Date.now()).format('L'), y: Number(Mixed.N) })
    })

    // sort datapoints by label
    Object.values(sentiments).forEach((sentiment) => {
      sentiment.dataPoints.sort((a, b) => {
        return moment(a.label).isBefore(moment(b.label)) ? -1 : 1
      })
    })

    return Object.values(sentiments)
  })

  const options = {
    theme: "light2",
    exportEnabled: true,
    title: {
      text: "Crypto Sentiment Analysis"
    },
    axisY: {
      title: "Sentiment Score"
    },
    toolTip: {
      shared: true
    },
    legend: {
      cursor: "pointer",
      itemclick: function (e: any) {
          if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
              e.dataSeries.visible = false;
          } else {
              e.dataSeries.visible = true;
          }
          e.chart.render();
      }
    },
    data: chartData
  }

  const styleOptions ={
    width: "100%",
    height: "360px"
  }
</script>

<template>
    <div id="chart">
      <CanvasJSChart :options="options" :styles="styleOptions" />
    </div>
</template>
