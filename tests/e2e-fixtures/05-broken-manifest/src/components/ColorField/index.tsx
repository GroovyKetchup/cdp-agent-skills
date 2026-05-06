import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  type BaseUIProps,
} from 'cdp-material-sdk/portable';

export interface ColorFieldProps extends BaseUIProps<HTMLDivElement> {
  value?: string;
  readOnly?: boolean;
  placeholder?: string;
  onChange?: (nextValue: string) => void;
}

/**
 * 故意写错（用于 e2e 测试场景 05）：
 *
 * - ref method 叫 `resetValue`，但 manifest action key 是 `reset` → diagnoseMissingActionImpls 会报
 * - state `selectedColor` 直接挂 ref 顶层，没放在 [COMPONENT_STATE_KEY] 下 → diagnoseMissingStateKeys 会报
 * - useImperativeHandle 依赖数组缺 selectedColor → stale closure（外部读到旧值）
 *
 * 这是一份"接到 CDP 后行为不对"的代码，编译能过但 reset action 不响应、设计器读不到 state。
 */
export const ColorField = forwardRef<unknown, ColorFieldProps>(function ColorField(props, ref) {
  const { value = '#000000', readOnly, placeholder, onChange, slotProps } = props;
  const [selectedColor, setSelectedColor] = useState(value);

  useImperativeHandle(ref, () => ({
    getValue: () => selectedColor,
    setValue: (next: string) => {
      setSelectedColor(next);
      onChange?.(next);
    },
    // ❌ 故意错 1：方法名 `resetValue`，但 manifest action key 是 `reset`
    resetValue: () => {
      setSelectedColor('#000000');
      onChange?.('#000000');
    },
    // ❌ 故意错 2：state 直接挂 ref 顶层，没放进 [COMPONENT_STATE_KEY] 下
    selectedColor,
  // ❌ 故意错 3：依赖数组缺 selectedColor，导致 ref 持有 stale closure
  }), [onChange]);

  return (
    <div {...slotProps?.root}>
      <input
        type="color"
        value={selectedColor}
        disabled={readOnly}
        title={placeholder}
        onChange={(event) => {
          const next = event.target.value;
          setSelectedColor(next);
          onChange?.(next);
        }}
      />
    </div>
  );
});
