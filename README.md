# Count to (@web-baseline/count-to)

_✨ 组合式函数：指定的持续时间内计数到目标数字 ✨_

[![License](https://img.shields.io/github/license/web-baseline/count-to)](https://github.com/web-baseline/count-to/blob/main/LICENSE)
[![Typescript](https://img.shields.io/npm/types/@web-baseline/count-to)](https://www.typescriptlang.org/)
[![NPM Download](https://img.shields.io/npm/dw/@web-baseline/count-to)](https://www.npmjs.com/package/@web-baseline/count-to)
[![GitHub star](https://img.shields.io/github/stars/web-baseline/count-to?style=social)](https://github.com/web-baseline/count-to)

无依赖的 Vue 组合式函数，可自定义缓动函数，监听输入值的变化自动进行计数动画，支持 SSR。
借鉴自 [vue-countTo](https://github.com/PanJiaChen/vue-countTo)。

## 如何使用

### 安装

```shell
npm install @web-baseline/count-to
```

### 使用例

```vue
<template>
  <span>￥ {{ formatted }} (CNY)</span>
</template>

<script lang="ts" setup>
import { useCountTo } from '@web-baseline/count-to';

const value = ref(1234);
const current = useCountTo(value, { duration: 1000 });
const formatted = computed(() => current.toLocaleString(undefined, { maximumFractionDigits: 0 }));
</script>
```

### Parameters

| Parameter | Property | Description                               | Type                                                                | Default |
| --------- | -------- | ----------------------------------------- | ------------------------------------------------------------------- | ------- |
| value     | --       | 输入值                                    | `MaybeRefOrGetter<number>`                                          | --      |
| options   | duration | 持续时间                                  | `number`                                                            | 3000    |
| options   | easingFn | 缓动函数（第三个参数与 vue-countTo 不同） | `(t: number, from: number, to: number, duration: number) => number` | ...     |

### Parameters

| Property | Description                                     | Type                  |
| -------- | ----------------------------------------------- | --------------------- |
| --       | 当前显示的值（在组件 mounted 之前与输入值相同） | `ReadonlyRef<number>` |
