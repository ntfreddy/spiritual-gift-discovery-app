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
            :class="{[$style['list-group-item']] : true, 'active': index === activeTrialIndex}"
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
            <b-form-group
              :class="$style.statement"
              :label="(indexStatement + 1) + '. ' + $t(statement)"
            >
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

          <div class="swiper-button-prev" :class="$style['swiper-button-prev']" slot="button-prev"></div>
          <div class="swiper-button-next" :class="$style['swiper-button-next']" slot="button-next"></div>
        </swiper>
      </client-only>

      <div :class="$style['chart-wrapper']">
        <!--v-chart ref="myChart" :class="$style.echarts"  manual-update autoresize/-->
        <apexchart
          width="550"
          type="bar"
          :class="$style.echarts"
          :options="chartOptions"
          :series="series"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";

import { Swiper, SwiperSlide } from "vue-awesome-swiper";
import "swiper/css/swiper.css";

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  data: function () {
    return {
      form: {
        firstName: "Frédéric",
        selectedFormIndex: 0,
      },
      answering: false,
      activeSlideIndex: 0,
      swiperOption: {
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        pagination: {
          el: ".swiper-pagination",
          type: "fraction",
        },
      },
      series: [
        {
          data: [],
        },
      ],
      chartOptions: {
        chart: {
          type: "bar",
          height: 550,
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: [
          ],
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

      this.series = [
        {
          data: this.trial.scores,
        },
      ];
    },
    onListClick(index) {
      this.SetActiveTrial(index);
    },
    onStart() {
      this.answering = true;

      this.series = [
        {
          data: this.trial.scores,
        },
      ];

      this.chartOptions = {
        chart: {
          type: "bar",
          height: 550,
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: this.trial.form.gifts.map((x) => this.$t(x.gift)),
        },
      };
    },
  },
  mounted: function () {},
};
</script>

<style module>
.swiper {
  margin: 10px;
}
.swiper-pagination {
  position: relative;
}

.chart-wrapper {
  width: 100%;
  height: 400px;
}

.echarts {
  width: 100%;
  height: 100%;
}

.swiper-button-prev:after,
.swiper-button-next:after {
  color: #17a2b8;
}

.statement {
  margin-left: 50px;
  margin-right: 50px;
}

.list-group-item.active {
  background-color: #17a2b8 !important;
  border-color: #17a2b8 !important;
}
</style>
