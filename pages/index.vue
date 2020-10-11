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
              @click="$bvModal.show('reset-trial-modal')"
            >
              <b-icon icon="arrow-clockwise" aria-label="Help"></b-icon>
              {{ $t("reset") }}
            </b-button>
          </b-nav-item>
          <b-nav-item v-if="false" >
            <b-button
              size="sm"
              variant="info"
              class="mb-2"
              @click="$bvModal.show('load-trial-modal')"
            >
              <b-icon icon="cloud-upload" aria-label="Help"></b-icon>
              {{ $t("load") }}
            </b-button>
          </b-nav-item>
          <b-nav-item v-if="false" >
            <b-button
              size="sm"
              variant="info"
              class="mb-2"
              @click="$bvModal.show('save-trial-modal')"
            >
              <b-icon icon="archive" aria-label="Help"></b-icon>
              {{ $t("save") }}
            </b-button>
          </b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <b-modal id="reset-trial-modal" hide-footer>
      <template v-slot:modal-title>{{ $t("reset") }}</template>
      <b-form @submit="onResetTrial">
        <div class="d-block text-center">
          {{ $t("reset-warning") }}
        </div>
        <b-button type="submit" variant="info">{{
          $t("reset-continue")
        }}</b-button>
      </b-form>
    </b-modal>
    <b-modal id="save-trial-modal" hide-footer>
      <template v-slot:modal-title>{{ $t("save") }}</template>
      <b-form @submit="onSaveTrial">
        <b-form-group
          id="firstName-group"
          :label="$t('form-firstName-name')"
          label-for="firstName"
        >
          <b-form-input
            id="firstName"
            v-model="form.firstName"
            type="text"
            required
            :placeholder="$t('form-firstName-placeholder')"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          id="form-group"
          :label="$t('form-select-form')"
          label-for="form"
        >
          <b-form-select v-model="form.selectedFormIndex" required disabled>
            <option value="null">{{ $t("form-select") }}</option>
            <option
              v-for="(myForm, index) in forms"
              :key="index"
              :value="index"
            >
              {{ $t(myForm.name) }}
            </option>
          </b-form-select>
        </b-form-group>

        <b-button type="submit" variant="info">{{ $t("save") }}</b-button>
      </b-form>
    </b-modal>

    <b-modal id="load-trial-modal" hide-footer>
      <template v-slot:modal-title>{{ $t("load") }}</template>
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
          >{{ $t("load") }}</b-button
        >
      </b-card>
    </b-modal>

    <swiper ref="slider" :options="swiperOption" :class="$style.swiper">
      <swiper-slide
        v-for="(statement, indexStatement) in trial.form.statements"
        :key="indexStatement"
      >
        <b-form-group
          :class="$style.statement"
          :label="indexStatement + 1 + '. ' + $t(statement)"
        >
          <BoxesRadio
            :class="$style.selection"
            v-for="(choice, indexChoice) in trial.form.choices"
            :key="indexChoice"
            :boxIndex="indexStatement"
            :boxName="'choice-' + indexStatement"
            :boxValue="choice.value"
            :boxResult="trial.results[indexStatement]"
            v-on:on-selection-change="onSelectionChange($event)"
            >{{ $t(choice.title) }}</BoxesRadio
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

    <div ref="myChart" :class="$style.am4charts" />
  </div>
</template>


<style module>
.swiper {
  margin: 10px;
}
.swiper-pagination {
  position: relative;
}

.swiper-button-prev:after,
.swiper-button-next:after {
  color: #17a2b8;
}

.statement {
  margin-left: auto;
  margin-right: auto;
}

.selection {
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

<script>
import { mapState } from "vuex";

import { Swiper, SwiperSlide } from "vue-awesome-swiper";
import "swiper/css/swiper.css";
import BoxesRadio from "../components/BoxesRadio";

export default {
  components: {
    Swiper,
    SwiperSlide,
    BoxesRadio,
  },
  data: function () {
    return {
      form: {
        firstName: "",
        selectedFormIndex: 0,
      },
      swiperOption: {
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        pagination: {
          el: ".swiper-pagination",
          type: "fraction",
        },
        on: {
          slideChange: this.onSliderChange,
        },
        initialSlide: 0,
      },
      chart: {
        graphic: null,
        values: [],
        categories: [],
        series: null,
        valueAxis: null,
      },
      trial: null,
      trials: [],
      activeTrialIndex: 0,
      slider: null,
    };
  },
  created: function () {
    this.onInitTrial();
  },
  beforeMount: function () {
    var trialStr = this.$ls.get("trial", JSON.stringify(this.trial));
    this.trial = JSON.parse(trialStr);

    var trialsStr = this.$ls.get("trials", JSON.stringify([]));
    this.trials = JSON.parse(trialsStr);
  },
  mounted: function () {
    this.slider = this.$refs.slider.$el.swiper;

    this.slider.slideTo(this.trial.currentStatementIndex);

    let chart = this.$am4charts.am4core.create(
      this.$refs.myChart,
      this.$am4charts.am4charts.XYChart
    );

    let data = [];
    for (let i = 0; i < this.chart.values.length; i++) {
      data.push({
        category: this.chart.categories[i],
        value: this.chart.values[i],
      });
    }

    chart.data = data;

    var categoryAxis = chart.yAxes.push(
      new this.$am4charts.am4charts.CategoryAxis()
    );
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;

    this.chart.valueAxis = chart.xAxes.push(
      new this.$am4charts.am4charts.ValueAxis()
    );
    this.chart.valueAxis.min = 0;
    this.chart.valueAxis.max = 0;

    this.chart.series = chart.series.push(
      new this.$am4charts.am4charts.ColumnSeries()
    );
    this.chart.series.dataFields.valueX = "value";
    this.chart.series.dataFields.categoryY = "category";

    chart.exporting.menu = new this.$am4charts.am4core.ExportMenu();
    chart.exporting.menu.items = [
      {
        label: "...",
        menu: [{ type: "png", label: this.$t("save-image") }],
      },
    ];

    this.chart.graphic = chart;
    this.chart.graphic.logo.disabled = true;

    this.onDrawGraphics();
  },
  beforeDestroy: function () {
    if (this.chart.graphic) {
      this.chart.graphic.dispose();
    }
  },
  computed: {
    ...mapState({
      forms: (state) => state.forms,
    }),
    availableLocales: function () {
      return this.$i18n.locales.filter((i) => i.code !== this.$i18n.locale);
    },
  },
  methods: {
    updateTrialScore: function (indexStatement, choiceValue) {
      this.trial.results[indexStatement] = choiceValue;
      for (var i = 0; i < this.trial.form.gifts.length; i++) {
        var x = 0;
        for (
          var j = 0;
          j < this.trial.form.gifts[i].relatedQuestions.length;
          j++
        ) {
          var index = this.trial.form.gifts[i].relatedQuestions[j];
          x += this.trial.results[index];
        }
        this.trial.scores[i] = x;
      }
    },
    onLangSelection: function (code) {
      this.switchLocalePath(code);
    },
    onListClick: function (index) {
      this.activeTrialIndex = index;
      this.$ls.set("activeTrialIndex", index);
    },
    onLoadTrial: function () {
      var trialsStr = this.$ls.get("trials", JSON.stringify([]));
      this.trials = JSON.parse(trialsStr);

      if (this.trials.length > 0) {
        this.activeTrialIndex = this.$ls.get("activeTrialIndex", 0);
        this.trial = this.trials[this.activeTrialIndex];
        this.$ls.set("trial", JSON.stringify(this.trial));
        this.onDrawGraphics();
      }

      this.$bvModal.hide("load-trial-modal");
    },
    onSaveTrial: function () {
      this.trial.name = this.form.firstName;
      this.trials.push(this.trial);
      this.$ls.set("trials", JSON.stringify(this.trials));
      this.$bvModal.hide("save-trial-modal");
    },
    onInitTrial: function () {
      var myName = this.form.firstName;
      var myForm = this.forms[this.form.selectedFormIndex];
      this.trial = {
        name: myName,
        form: myForm,
        date: new Date(),
        results: Array(myForm.statements.length).fill(0),
        scores: Array(myForm.gifts.length).fill(0),
        maxScore:
          myForm.choices[myForm.choices.length - 1].value *
          myForm.gifts[0].relatedQuestions.length,
        currentStatementIndex: 0,
      };
    },
    onResetTrial: function () {
      this.onInitTrial();
      this.$ls.set("trial", JSON.stringify(this.trial));
      this.$bvModal.hide("reset-trial-modal");
    },
    onSelectionChange: function (obj) {
      this.updateTrialScore(obj.index, obj.value);
      this.$ls.set("trial", JSON.stringify(this.trial));

      this.chart.values = this.trial.scores;

      let data = [];
      for (let i = 0; i < this.chart.values.length; i++) {
        data.push({
          category: this.chart.categories[i],
          value: this.chart.values[i],
        });
      }

      this.chart.graphic.data = data;

      this.chart.graphic.invalidateRawData();
    },
    onDrawGraphics: function () {
      this.chart.values = this.trial.scores;
      this.chart.categories = this.trial.form.gifts.map((x) => this.$t(x.gift));

      let data = [];
      for (let i = 0; i < this.chart.values.length; i++) {
        data.push({
          category: this.chart.categories[i],
          value: this.chart.values[i],
        });
      }

      this.chart.graphic.data = data;

      var max = this.trial.maxScore;

      this.chart.valueAxis.max = max;
      var low = this.$am4charts.am4core.color("#000000");
      var high = this.$am4charts.am4core.color("#17a2b8");

      let that = this;
      this.chart.series.columns.template.adapter.add("fill", function (
        fill,
        column
      ) {
        var columnGradient = new that.$am4charts.am4core.LinearGradient();
        columnGradient.rotation = 180;

        columnGradient.addColor(
          that.$am4charts.am4core.color(
            that.$am4charts.am4core.colors.interpolate(
              low.rgb,
              high.rgb,
              column.dataItem.dataContext.value / max
            )
          ),
          1,
          0
        );
        columnGradient.addColor(low, 1, 1);
        return columnGradient;
      });

      this.chart.graphic.invalidateRawData();
    },
    onSliderChange: function () {
      this.trial.currentStatementIndex = this.slider.activeIndex;
      this.$ls.set("trial", JSON.stringify(this.trial));
    },
  },
};
</script>

