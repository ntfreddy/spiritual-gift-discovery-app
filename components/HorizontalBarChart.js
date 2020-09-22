import { HorizontalBar, mixins } from 'vue-chartjs'

export default {
    extends: HorizontalBar,
    mixins: [mixins.reactiveProp],
    props: ['chartData', 'chartOptions'],
    mounted() {
        this.renderChart(this.chartData, this.chartOptions);
    },
    /*watch: {
        chartData() {
            console.log("CHANGE");
            this.$data._chart.update()
        }
    }*/
}