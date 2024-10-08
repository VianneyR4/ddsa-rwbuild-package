<template>
  <g :transform="transform">
    <circle cx="5" cy="5" r="4" style="stroke: #fa58f4; stroke-width: 2; fill: none" />
  </g>
</template>

<script>
import { IconMixin } from './icon'
export default {
  mixins: [IconMixin]
}
</script>
