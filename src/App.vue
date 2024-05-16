<template>
  <main class="container mx-auto p-4 font-mono">
    <h1 class="col-span-full text-4xl font-bold mb-2">
      Count to
    </h1>
    <hr class="col-span-full mb-8" />
    <section class="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-4 text-xl mb-2">
      <div class="col-span-full grid grid-cols-subgrid mb-2">
        <span class="md:text-right">Output raw:</span>
        <span>{{ output }}</span>
      </div>
      <div class="col-span-full grid grid-cols-subgrid mb-8">
        <span class="md:text-right">Output formatted:</span>
        <span>{{ output.toLocaleString(undefined, { maximumFractionDigits: 0 }) }}</span>
      </div>
      <label class="col-span-full grid grid-cols-subgrid mb-2 items-center">
        <span class="md:text-right">Duration:</span>
        <input v-model.number="duration" class="rounded px-4 pr-1 py-1 focus:outline-none bg-gray-100 w-full" type="number" />
      </label>
      <form class="col-span-full grid grid-cols-subgrid" @submit.prevent="onSubmit">
        <label class="col-span-full grid grid-cols-subgrid items-center mb-2">
          <span class="md:text-right">Value:</span>
          <input v-model.number="formInput" class="rounded px-4 pr-1 py-1 focus:outline-none bg-gray-100 w-full" type="number" />
        </label>
        <button class="md:hidden col-span-full text-center w-full text-white bg-blue-900 p-1 duration-300 rounded hover:bg-blue-700" type="submit">
          Set value
        </button>
      </form>
    </section>
    <hr class="col-span-full mb-2" />
    <section>
      <pre class="bg-gray-100 overflow-auto p-2 rounded"><code>{{ sourceCode }}</code></pre>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useCountTo } from '~/packages/index';

const formInput = ref(1000);
const duration = ref(3000);

const input = ref(formInput.value);
const output = useCountTo(input, reactive({ duration }));

function onSubmit () {
  input.value = formInput.value;
}

/* cSpell:disable */
const sourceCode = `\u003ctemplate>
  \u003cspan>{{ output.toLocaleString(undefined, { maximumFractionDigits: 0 }) }}\u003c/span>
\u003c/template>

\u003cscript setup>
const duration = ref(3000);
const input = ref(1000);
const output = useCountTo(input, reactive({ duration }));
\u003c/script>`;
/* cSpell:enable */
</script>
