import Vue from "vue";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

export default (context, inject) => {

    let data = {
        am4core,
        am4charts,
        am4themes_animated,
        //  am4themes_dark
    };

    inject('am4charts', data);

    // For Nuxt <= 2.12, also add 👇
    context.$am4charts = data;
}