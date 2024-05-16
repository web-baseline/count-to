import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

export function withComponent<T extends () => any> (factory: T) {
  const Component = defineComponent(() => {
    result.value = factory();
    return () => {};
  });
  const result = {
    value: null as ReturnType<T>,
    Component,
    instance: null as unknown as ReturnType<typeof mount<typeof Component>>,
  };
  result.instance = mount(Component);
  return result;
}
