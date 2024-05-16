import { afterEach, expect, test } from 'vitest';
import { nextTick, ref } from 'vue';
import { useCountTo } from '~/packages/index';
import { source } from './mock_requestAnimationFrame';
import { withComponent } from './test-utils';

afterEach(() => {
  window.requestAnimationFrame = source.requestAnimationFrame;
  window.cancelAnimationFrame = source.cancelAnimationFrame;
});

test('useCountTo without requestAnimationFrame', async () => {
  window.requestAnimationFrame = undefined as any;
  const input = ref(1000);
  const { value: current } = withComponent(() => useCountTo(input));
  expect(current.value).toBe(input.value);
  await nextTick();
  expect(current.value).toBe(input.value);
  input.value = 2000;
  await nextTick();
  expect(current.value).toBe(input.value);
});

test('useCountTo without cancelAnimationFrame', async () => {
  window.cancelAnimationFrame = undefined as any;
  const input = ref(1000);
  const { value: current } = withComponent(() => useCountTo(input));
  expect(current.value).toBe(input.value);
  await nextTick();
  expect(current.value).toBe(input.value);
  input.value = 2000;
  await nextTick();
  expect(current.value).toBe(input.value);
});
