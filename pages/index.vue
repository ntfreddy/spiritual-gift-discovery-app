<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-nav class="mr-auto">        
        <b-navbar-brand href="#">{{ $t("app-name") }}</b-navbar-brand>
      </b-navbar-nav>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown
            :text="$i18n.locales.find((i) => i.code === this.$i18n.locale).name"
            right
          >
            <b-dropdown-item
              :to="switchLocalePath(locale.code)"
              v-for="(locale, index) in availableLocales"
              :key="index"
              >{{ locale.name }}</b-dropdown-item
            >
          </b-nav-item-dropdown>
          <b-nav-item>
            <b-button
              size="sm"
              variant="info"
              class="mb-2"
              @click="$bvModal.show('load-trial-modal')"
            >
              <b-icon icon="cloud-upload" aria-label="Help"></b-icon> {{$t('load')}}
            </b-button>
          </b-nav-item>
          <b-nav-item>
            <b-button
              size="sm"
              variant="info"
              class="mb-2"
              @click="$bvModal.show('save-trial-modal')"
            >
              <b-icon icon="cloud-download" aria-label="Help"></b-icon> {{$t('save')}}
            </b-button>
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <b-modal id="save-trial-modal" hide-footer>
      <template v-slot:modal-title>{{$t('save')}}</template>
      <b-form @submit="onSaveTrial">
        <b-form-group id="firstName-group" :label="$t('form-firstName-name')" label-for="firstName">
          <b-form-input
            id="firstName"
            v-model="form.firstName"
            type="text"
            required
            :placeholder="$t('form-firstName-placeholder')"
          ></b-form-input>
        </b-form-group>

        <b-form-group id="form-group" :label="$t('form-select-form')" label-for="form">
          <b-form-select v-model="form.selectedFormIndex" required disabled>
            <option value="null">{{$t('form-select')}}</option>
            <option v-for="(form, index) in forms" :key="index" :value="index">
              {{ $t(form.name) }}
            </option>
          </b-form-select>
        </b-form-group>

        <b-button type="submit" variant="info">{{$t('save')}}</b-button>
      </b-form>
    </b-modal>

    <b-modal id="load-trial-modal" hide-footer>
      <template v-slot:modal-title>{{$t('load')}}</template>
      <b-card no-body header="">
        <b-list-group flush>
          <b-list-group-item
            variant="info"
            v-for="(trial, index) in trials"
            :key="index"
            :value="index"
            :class="{
              [$style['list-group-item']]: true,
              active: index === activeTrialIndex,
            }"
            v-on:click="onListClick(index)"
            >{{
              trial.name +
              " - " +
              $t(trial.form.name) +
              " - " +
              trial.date.toISOString().split("T")[0]
            }}</b-list-group-item
          >
        </b-list-group>

        <b-card-body></b-card-body>

        <b-button
          :class="{ disabled: !(trials.length > 0) }"
          variant="info"
          @click="onLoadTrial"
          >{{$t('load')}}</b-button
        >
      </b-card>
    </b-modal>

    <client-only>
      <swiper ref="mySwiper" :options="swiperOption" :class="$style.swiper">
        <swiper-slide
          v-for="(statement, indexStatement) in trial.form.statements"
          :key="indexStatement"
        >
          <b-form-group
            :class="$style.statement"
            :label="indexStatement + 1 + '. ' + $t(statement)"
          >
            <b-form-radio
              v-for="(choice, indexChoice) in trial.form
                .choices"
              :key="indexChoice"
              v-on:change="onSelectionChange(indexStatement, choice.value)"
              :name="'choice-' + indexStatement"
              :value="choice.value"
              >{{ $t(choice.title) }}</b-form-radio
            >
          </b-form-group>
        </swiper-slide>
        <div
          class="swiper-pagination"
          :class="$style['swiper-pagination']"
          slot="pagination"
        ></div>

        <div
          class="swiper-button-prev"
          :class="$style['swiper-button-prev']"
          slot="button-prev"
        ></div>
        <div
          class="swiper-button-next"
          :class="$style['swiper-button-next']"
          slot="button-next"
        ></div>
      </swiper>
    </client-only>

    <div ref="myChart" :class="$style.am4charts" />
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
        firstName: "",
        selectedFormIndex: 0,
      },
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
      chart: null,
      values: [],
      categories: [],
      series: null,
      valueAxis: null,
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
      InitTrial: "INIT_TRIAL",
      LoadTrial: "LOAD_TRIAL",
      SaveTrial: "SAVE_TRIAL",
      SetActiveTrialIndex: "SET_ACTIVE_TRIAL_INDEX",
      UpdateTrialScore: "UPDATE_TRIAL_SCORE",
    }),
    onLangSelection: function (code) {
      this.switchLocalePath(code);
    },
    onListClick: function(index) {
      this.SetActiveTrialIndex(index);
    },
    onLoadTrial: function() {
      this.LoadTrial();
      this.onDrawGraphics();      
      this.$bvModal.hide("load-trial-modal");
    },
    onSaveTrial: function (e) {
      e.preventDefault();

      this.SaveTrial();
      this.onReset();
      this.$bvModal.hide("save-trial-modal");
    },
    onReset: function () {
      this.form.firstName = "";
      this.form.selectedFormIndex = null;
    },
    onSelectionChange: function(indexStatement, choiceValue) {
      this.UpdateTrialScore({
        indexStatement: indexStatement,
        choiceValue: choiceValue,
      });
      this.values = this.trial.scores;

      let data = [];
      for (let i = 0; i < this.values.length; i++) {
        data.push({ category: this.categories[i], value: this.values[i] });
      }

      this.chart.data = data;

      this.chart.invalidateRawData();
    },
    onDrawGraphics: function(){
      this.values = this.trial.scores;
      this.categories = this.trial.form.gifts.map((x) => this.$t(x.gift));

      let data = [];
      for (let i = 0; i < this.values.length; i++) {
        data.push({ category: this.categories[i], value: this.values[i] });
      }

      this.chart.data = data;

      var max = this.trial.maxScore;

      this.valueAxis.max = max;
      var red = this.$am4charts.am4core.color("red");
      var green = this.$am4charts.am4core.color("green");

      let that = this;
      this.series.columns.template.adapter.add("fill", function (fill, column) {
        var columnGradient = new that.$am4charts.am4core.LinearGradient();
        columnGradient.rotation = 180;

        columnGradient.addColor(
          that.$am4charts.am4core.color(
            that.$am4charts.am4core.colors.interpolate(
              red.rgb,
              green.rgb,
              column.dataItem.dataContext.value / max
            )
          ),
          1,
          0
        );
        columnGradient.addColor(red, 1, 1);
        return columnGradient;
      });

      this.chart.invalidateRawData();
    },
  },
  created: function (){
    this.InitTrial({
      name: this.form.firstName,
      form: this.forms[this.form.selectedFormIndex],
    });

  },
  mounted: function () {
    let chart = this.$am4charts.am4core.create(
      this.$refs.myChart,
      this.$am4charts.am4charts.XYChart
    );

    let data = [];
    for (let i = 0; i < this.values.length; i++) {
      data.push({ category: this.categories[i], value: this.values[i] });
    }

    chart.data = data;

    var categoryAxis = chart.yAxes.push(
      new this.$am4charts.am4charts.CategoryAxis()
    );
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;

    this.valueAxis = chart.xAxes.push(
      new this.$am4charts.am4charts.ValueAxis()
    );
    this.valueAxis.min = 0;
    this.valueAxis.max = 0;

    this.series = chart.series.push(
      new this.$am4charts.am4charts.ColumnSeries()
    );
    this.series.dataFields.valueX = "value";
    this.series.dataFields.categoryY = "category";

    chart.exporting.menu = new this.$am4charts.am4core.ExportMenu();
    chart.exporting.menu.items = [
      {
        label: "...",
        menu: [{ type: "png", label: "Image" }],
      },
    ];

    this.chart = chart;
    this.chart.logo.disabled = true;

    this.onDrawGraphics();
  },
  beforeDestroy: function () {
    if (this.chart) {
      this.chart.dispose();
    }
  },
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

.am4charts {
  width: 100%;
  height: 600px;
}
</style>
