<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="#">{{$t('app-name')}}</b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown
            :text="$i18n.locales.find(i => i.code === this.$i18n.locale).name"
            right
          >
            <b-dropdown-item
              :to="switchLocalePath(locale.code)"
              v-for="(locale, index) in availableLocales"
              :key="index"
            >{{ locale.name }}</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item>
            <b-button
              size="sm"
              variant="info"
              class="mb-2"
              @click="$bvModal.show('add-trial-modal')"
            >
              <b-icon icon="plus-circle" aria-label="Help"></b-icon>
            </b-button>
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <b-modal id="add-trial-modal" hide-footer>
      <template v-slot:modal-title>Add trial</template>
      <b-form @submit="onSubmit">
        <b-form-group id="firstName-group" label="Name" label-for="firstName">
          <b-form-input
            id="firstName"
            v-model="form.firstName"
            type="text"
            required
            placeholder="Enter your name"
          ></b-form-input>
        </b-form-group>

        <b-form-group id="form-group" label="Form" label-for="form">
          <b-form-select v-model="form.selectedFormIndex" required>
            <option value="null">Select a form</option>
            <option v-for="(form, index) in forms" :key="index" :value="index">{{ $t(form.name)}}</option>
          </b-form-select>
        </b-form-group>

        <b-button type="submit" variant="info">Add</b-button>
      </b-form>
    </b-modal>

    <div v-if="!answering">
      <b-card no-body header="Trials">
        <b-list-group flush>
          <b-list-group-item
            variant="info"
            v-for="(trial, index) in trials"
            :key="index"
            :value="index"
            :class="{'active': index === activeTrialIndex}"
            v-on:click="onListClick(index)"
          >{{trial.name + " - " + $t(trial.form.name) + " - " + trial.date.toISOString().split('T')[0]}}</b-list-group-item>
        </b-list-group>

        <b-card-body></b-card-body>

        <b-button :class="{'disabled': !(trials.length > 0) }" variant="info" @click="onStart">Start</b-button>
      </b-card>
    </div>
    <div v-else>
      <client-only>
        <swiper ref="mySwiper" :options="swiperOption" :class="$style.swiper">
          <swiper-slide
            v-for="(statement, indexStatement) in trials[activeTrialIndex].form.statements"
            :key="indexStatement"
          >
            <b-form-group :label="(indexStatement + 1) + '. ' + $t(statement)">
              <b-form-radio
                v-for="(choice, indexChoice) in trials[activeTrialIndex].form.choices"
                :key="indexChoice"
                v-on:change="onSelectionChange(indexStatement, choice.value)"
                :name="'choice-' + indexStatement"
                :value="choice.value"
              >{{$t(choice.title)}}</b-form-radio>
            </b-form-group>
          </swiper-slide>
          <div class="swiper-pagination" :class="$style['swiper-pagination']" slot="pagination"></div>
        </swiper>
      </client-only>

      <horizontal-bar-chart
        ref="myChart"
        :chartData.sync="chart.data"
        :chartOptions="chart.options"
        :height="200"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import HorizontalBarChart from "~/components/HorizontalBarChart";

const chartColors = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)",
};

export default {
  components: {
    HorizontalBarChart,
  },
  data: function () {
    return {
      form: {
        firstName: "",
        selectedFormIndex: null,
      },
      answering: false,
      activeSlideIndex: 0,
      swiperOption: {
        /*slidesPerView: 1,
        watchOverflow: false,*/
        initialSlide: this.activeSlideIndex,
        pagination: true,
        animating: true,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        pagination: {
          el: ".swiper-pagination",
        },
      },
      chart: {
        data: {
          labels: [],
          datasets: [
            {
              label: "Score",
              backgroundColor: "#f87979",
              data: [],
            },
          ],
        },
        options: {
          animation: {
            duration: 0, // general animation time
          },
          hover: {
            animationDuration: 0, // duration of animations when hovering an item
          },
          responsiveAnimationDuration: 0, // animation duration after a resize
          responsive: true,
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Spiritual Gifts",
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        },
      },
    };
  },
  computed: {
    ...mapState({
      forms: (state) => state.forms,
      trials: (state) => state.trials,
      trial: (state) => state.trial,
      activeTrialIndex: (state) => state.activeTrialIndex,
    }),
    availableLocales: function () {
      return this.$i18n.locales.filter((i) => i.code !== this.$i18n.locale);
    },
  },
  methods: {
    ...mapMutations({
      AddTrial: "ADD_TRIAL",
      UpdateScore: "UPDATE_SCORE",
      SetActiveTrial: "SET_ACTIVE_TRIAL",
    }),
    onLangSelection: function (code) {
      this.switchLocalePath(code);
      //console.log("Clicked:", code);
    },
    onSubmit: function (e) {
      e.preventDefault();

      // console.log("Form:", this.forms);
      this.AddTrial({
        name: this.form.firstName,
        form: this.forms[this.form.selectedFormIndex],
      });
      // this.answering = true;
      this.onReset();
      this.$bvModal.hide("add-trial-modal");
    },
    onReset: function () {
      this.form.firstName = "";
      this.form.selectedFormIndex = null;
    },
    onSelectionChange(indexStatement, choiceValue) {
      this.UpdateScore({
        indexStatement: indexStatement,
        choiceValue: choiceValue,
      });

      //this.recreateChartData();
      //console.log("DataX : ", this.chart.data.datasets.data);
    },
    onListClick(index) {
      this.SetActiveTrial(index);
    },
    onStart() {
      this.answering = true;
      this.recreateChartData();
    },
    recreateChartData: async function () {
      this.chart.data = {
        labels: this.trial.form.gifts.map((x) => this.$t(x.gift)),
        datasets: [
          {
            label: "Score",
            backgroundColor: "#f87979",
            data: this.trial.scores,
          },
        ],
      };
    },
  },
  mounted: function () {

  } 
};
</script>

<style module>
.swiper {
  margin: 10px;
}
.swiper-pagination {
  position: relative;
}
</style>
