<template>
  <g :transform="transform">
    <circle cx="5" cy="5" r="3" style="fill: #fa58f4" />
  </g>
</template>

<script>
import { IconMixin } from './icon'
export default {
  mixins: [IconMixin]
}
</script>
