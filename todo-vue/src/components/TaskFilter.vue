<!--
  TASK FILTER COMPONENT: Reusable filter buttons (All / Active / Completed)

  This component demonstrates:
  - PROPS: Data flowing DOWN from parent (currentFilter)
  - EMITS: Events flowing UP to parent (filter-change)
  - v-for with arrays of objects
-->

<template>
  <div class="filter-section">
    <!--
      v-for loops through the filters array
      :class uses object syntax - 'active' class only applied when condition is true
    -->
    <button
      v-for="filter in filters"
      :key="filter.value"
      :class="['filter-btn', { active: currentFilter === filter.value }]"
      @click="$emit('filter-change', filter.value)"
    >
      {{ filter.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'TaskFilter',

  // PROPS: Data passed IN from parent
  // Parent uses :current-filter="..." to pass the value
  props: {
    currentFilter: {
      type: String,
      required: true,
      // validator runs at dev time - catches bugs early
      validator: (value) => ['all', 'active', 'completed'].includes(value)
    }
  },

  // Explicitly declare what events this component emits
  emits: ['filter-change'],

  data() {
    return {
      // Define filters as data instead of hardcoding - easier to add/remove later
      filters: [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' }
      ]
    }
  }
}
</script>

<style scoped>
.filter-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.filter-btn:hover {
  background: #f0f0f0;
}

.filter-btn.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}
</style>
