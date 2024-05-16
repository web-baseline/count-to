import { computed, onBeforeUnmount, onMounted, reactive, readonly, ref, toValue, watch, type MaybeRefOrGetter, type DeepReadonly, type Ref } from 'vue';

export interface Options {
  duration: number;
  easingFn: (t: number, from: number, to: number, duration: number) => number;
}

export type Returns = DeepReadonly<Ref<number>>;

export const defaultOptions: Options = reactive({
  duration: 3000,
  easingFn: (t, b, e, d) => ((e - b) * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b),
});

export function useCountTo (value: MaybeRefOrGetter<number>, options?: Partial<Options>): Returns {
  const current = ref(toValue(value));
  const options_ = computed(() => Object.assign({}, defaultOptions, options ?? {}));
  const runtime = {
    startTime: null as number | null,
    startValue: 0,
    duration: options_.value.duration,
    handle: 0 as ReturnType<AnimationFrameProvider['requestAnimationFrame']>,
  };

  const stop = function () {
    globalThis.cancelAnimationFrame?.(runtime.handle);
    current.value = toValue(value);
  };

  const count: FrameRequestCallback = function (timestamp) {
    runtime.startTime ??= timestamp;
    const t = timestamp - runtime.startTime;
    if (t < runtime.duration) {
      current.value = options_.value.easingFn(t, runtime.startValue, toValue(value), runtime.duration);
      runtime.handle = globalThis.requestAnimationFrame?.(count);
    } else {
      stop();
    }
  };
  const start = function () {
    globalThis.cancelAnimationFrame?.(runtime.handle);
    if (typeof globalThis.requestAnimationFrame === 'function' && typeof globalThis.cancelAnimationFrame === 'function') {
      runtime.startValue = current.value;
      runtime.startTime = null;
      runtime.duration = options_.value.duration;
      runtime.handle = globalThis.requestAnimationFrame?.(count);
    } else {
      current.value = toValue(value);
    }
  };
  onMounted(() => {
    if (typeof globalThis.requestAnimationFrame === 'function' && typeof globalThis.cancelAnimationFrame === 'function') {
      current.value = 0;
      start();
    }
  });
  onBeforeUnmount(() => stop());
  watch(() => toValue(value), () => start());

  return readonly(current);
}
