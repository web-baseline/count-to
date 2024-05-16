import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';
import { nextTick, reactive, ref, shallowRef } from 'vue';
import { useCountTo, defaultOptions } from '~/packages/index';
import { requestAnimationFrameMock, source } from './mock_requestAnimationFrame';
import { withComponent } from './test-utils';

const requestAnimationFrame = vi.fn(requestAnimationFrameMock.requestAnimationFrame.bind(requestAnimationFrameMock));
const cancelAnimationFrame = vi.fn(requestAnimationFrameMock.cancelAnimationFrame.bind(requestAnimationFrameMock));
const easingFn_ = defaultOptions.easingFn;
const easingFn = vi.fn(easingFn_);

beforeAll(() => {
  source.requestAnimationFrame.mockImplementation(requestAnimationFrame);
  source.cancelAnimationFrame.mockImplementation(cancelAnimationFrame);
  defaultOptions.easingFn = easingFn;
});

afterAll(() => {
  source.requestAnimationFrame.mockRestore();
  source.cancelAnimationFrame.mockRestore();
  defaultOptions.easingFn = easingFn_;
});

afterEach(() => {
  requestAnimationFrame.mockRestore();
  cancelAnimationFrame.mockRestore();
  easingFn.mockRestore();
});

test('useCountTo normal', async () => {
  const before = ref(0);
  const input = ref(1000);
  const { value: current } = withComponent(() => useCountTo(input));
  expect(current.value).toBe(0);
  await nextTick();
  expect(current.value).toBe(0);

  const testOnce = function (baseTime: number) {
    requestAnimationFrameMock.triggerNextAnimationFrame(baseTime);
    expect(easingFn).toHaveBeenCalledOnce();
    expect(easingFn).toBeCalledWith(0, before.value, input.value, defaultOptions.duration);

    for (const t of [100, 200, 500, 1000, 2000]) {
      easingFn.mockClear();
      requestAnimationFrameMock.triggerNextAnimationFrame(baseTime + t);
      expect(easingFn).toHaveBeenCalledOnce();
      expect(easingFn).toBeCalledWith(t, before.value, input.value, defaultOptions.duration);
      expect(current.value).toBe(easingFn_(t, before.value, input.value, defaultOptions.duration));
    }

    easingFn.mockClear();
    requestAnimationFrameMock.triggerNextAnimationFrame(baseTime + 2999);
    expect(easingFn).toHaveBeenCalledOnce();
    expect(easingFn).toBeCalledWith(2999, before.value, input.value, defaultOptions.duration);
    expect(current.value).toBe(easingFn_(2999, before.value, input.value, defaultOptions.duration));

    const lastHandle = requestAnimationFrame.mock.results[requestAnimationFrame.mock.results.length - 1].value;

    easingFn.mockClear();
    cancelAnimationFrame.mockClear();
    requestAnimationFrameMock.triggerNextAnimationFrame(baseTime + 3000);
    expect(easingFn).not.toHaveBeenCalled();
    expect(cancelAnimationFrame).toHaveBeenCalledOnce();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(lastHandle);
    expect(current.value).toBe(input.value);
  };

  testOnce(1000);
  before.value = current.value;
  input.value = 3000;
  await nextTick();
  testOnce(11000);
});

test('useCountTo set options', async () => {
  const before = ref(0);
  const input = ref(1000);
  const duration = ref(2000);
  const __easingFn = vi.fn(easingFn_);
  const _easingFn = shallowRef(__easingFn);
  const { value: current } = withComponent(() => useCountTo(input, reactive({ duration, easingFn: _easingFn })));
  const baseTime = 1000;

  requestAnimationFrameMock.triggerNextAnimationFrame(baseTime);
  expect(__easingFn).toHaveBeenCalledOnce();
  expect(__easingFn).toBeCalledWith(0, before.value, input.value, 2000);

  __easingFn.mockClear();
  requestAnimationFrameMock.triggerNextAnimationFrame(baseTime + 100);
  expect(__easingFn).toHaveBeenCalledOnce();
  expect(__easingFn).toBeCalledWith(100, before.value, input.value, 2000);
  expect(current.value).toBe(easingFn_(100, before.value, input.value, 2000));

  duration.value = 1000;

  __easingFn.mockClear();
  requestAnimationFrameMock.triggerNextAnimationFrame(baseTime + 1100);
  expect(__easingFn).toHaveBeenCalledOnce();
  expect(__easingFn).toBeCalledWith(1100, before.value, input.value, 2000);
  expect(current.value).toBe(easingFn_(1100, before.value, input.value, 2000));

  const __anotherEasingFn = vi.fn(easingFn_);
  _easingFn.value = __anotherEasingFn;
  __easingFn.mockClear();
  requestAnimationFrameMock.triggerNextAnimationFrame(baseTime + 1100);
  expect(__easingFn).not.toHaveBeenCalled();
  expect(__anotherEasingFn).toHaveBeenCalledOnce();
  expect(__anotherEasingFn).toBeCalledWith(1100, before.value, input.value, 2000);
  expect(current.value).toBe(easingFn_(1100, before.value, input.value, 2000));

  const lastHandle = requestAnimationFrame.mock.results[requestAnimationFrame.mock.results.length - 1].value;

  _easingFn.value.mockClear();
  cancelAnimationFrame.mockClear();
  requestAnimationFrameMock.triggerNextAnimationFrame(baseTime + 2000);
  expect(_easingFn.value).not.toHaveBeenCalled();
  expect(cancelAnimationFrame).toHaveBeenCalledOnce();
  expect(cancelAnimationFrame).toHaveBeenCalledWith(lastHandle);
  expect(current.value).toBe(input.value);
});

test('useCountTo when update input', async () => {
  const before = ref(0);
  const input = ref(1000);
  const { value: current } = withComponent(() => useCountTo(input));
  await nextTick();
  let baseTime = 1000;

  requestAnimationFrameMock.triggerNextAnimationFrame(baseTime);
  expect(easingFn).toHaveBeenCalledOnce();
  expect(easingFn).toBeCalledWith(0, before.value, input.value, defaultOptions.duration);

  cancelAnimationFrame.mockClear();
  easingFn.mockClear();
  requestAnimationFrameMock.triggerNextAnimationFrame(baseTime + 2000);
  expect(easingFn).toHaveBeenCalledOnce();
  expect(easingFn).toBeCalledWith(2000, before.value, input.value, defaultOptions.duration);
  expect(current.value).toBe(easingFn_(2000, before.value, input.value, defaultOptions.duration));
  expect(cancelAnimationFrame).not.toHaveBeenCalled();

  let lastHandle = requestAnimationFrame.mock.results[requestAnimationFrame.mock.results.length - 1].value;
  before.value = current.value;
  input.value += 1000;
  await nextTick();
  expect(cancelAnimationFrame).toHaveBeenCalledOnce();
  expect(cancelAnimationFrame).toHaveBeenCalledWith(lastHandle);
  baseTime += 2000;

  cancelAnimationFrame.mockClear();
  easingFn.mockClear();
  requestAnimationFrameMock.triggerNextAnimationFrame(baseTime + 1000);
  expect(easingFn).toHaveBeenCalledOnce();
  expect(easingFn).toBeCalledWith(0, before.value, input.value, defaultOptions.duration);
  expect(current.value).toBe(easingFn_(0, before.value, input.value, defaultOptions.duration));

  easingFn.mockClear();
  requestAnimationFrameMock.triggerNextAnimationFrame(baseTime + 1500);
  expect(easingFn).toHaveBeenCalledOnce();
  expect(easingFn).toBeCalledWith(1500 - 1000, before.value, input.value, defaultOptions.duration);
  expect(current.value).toBe(easingFn_(1500 - 1000, before.value, input.value, defaultOptions.duration));
  expect(cancelAnimationFrame).not.toHaveBeenCalled();

  lastHandle = requestAnimationFrame.mock.results[requestAnimationFrame.mock.results.length - 1].value;
  before.value = current.value;
  input.value += 1000;
  await nextTick();
  expect(cancelAnimationFrame).toHaveBeenCalledOnce();
  expect(cancelAnimationFrame).toHaveBeenCalledWith(lastHandle);
  baseTime += 2000;

  cancelAnimationFrame.mockClear();
  easingFn.mockClear();
  requestAnimationFrameMock.triggerNextAnimationFrame(baseTime + 1000);
  expect(easingFn).toHaveBeenCalledOnce();
  expect(easingFn).toBeCalledWith(0, before.value, input.value, defaultOptions.duration);
  expect(current.value).toBe(easingFn_(0, before.value, input.value, defaultOptions.duration));

  easingFn.mockClear();
  requestAnimationFrameMock.triggerNextAnimationFrame(baseTime + 2500);
  expect(easingFn).toHaveBeenCalledOnce();
  expect(easingFn).toBeCalledWith(2500 - 1000, before.value, input.value, defaultOptions.duration);
  expect(current.value).toBe(easingFn_(2500 - 1000, before.value, input.value, defaultOptions.duration));
  expect(cancelAnimationFrame).not.toHaveBeenCalled();

  easingFn.mockClear();
  requestAnimationFrameMock.triggerNextAnimationFrame(baseTime + 3999);
  expect(easingFn).toHaveBeenCalledOnce();
  expect(easingFn).toBeCalledWith(3999 - 1000, before.value, input.value, defaultOptions.duration);
  expect(current.value).toBe(easingFn_(3999 - 1000, before.value, input.value, defaultOptions.duration));
  expect(cancelAnimationFrame).not.toHaveBeenCalled();

  lastHandle = requestAnimationFrame.mock.results[requestAnimationFrame.mock.results.length - 1].value;
  easingFn.mockClear();
  requestAnimationFrameMock.triggerNextAnimationFrame(baseTime + 4500);
  expect(easingFn).not.toHaveBeenCalled();
  expect(cancelAnimationFrame).toHaveBeenCalledOnce();
  expect(cancelAnimationFrame).toHaveBeenCalledWith(lastHandle);
  expect(current.value).toBe(input.value);
});
