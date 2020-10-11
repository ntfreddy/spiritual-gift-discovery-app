<template>
  <b-form-radio
        v-on:change="onSelectionChange(boxIndex, boxValue)"
        :name="boxName"
        :value="boxValue"
        v-model="boxMutableResult"
        >
        <slot />
  </b-form-radio>
</template>

<script>
export default {
  props: ['boxIndex', 'boxName', 'boxValue', 'boxResult'],
  methods: {    
    onSelectionChange : function(index, value){
      this.$emit("on-selection-change", {index:index, value:value});
    }
  },
  data : function(){
    return {
      boxMutableResult: this.boxResult
    }
  },
  mounted: function(){
    //var a = 1;
  }

}
</script>

<style>

</style>