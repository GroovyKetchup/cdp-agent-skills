/**
 * 第三方 Button（stub）— 模拟 arco/antd 风格的按钮。
 *
 * 关键设计（用于检验 Agent 是否正确做 native loading + 事件 propName 适配）：
 * - 事件是 `onPress: () => void`（不是 `onClick`）
 * - 内置 `loading: boolean` —— loading 时自显示 spinner 且阻断点击
 * - 内置 `disabled: boolean`
 * - **明确解构** props，剩余属性丢弃 —— 不接受 `slotProps`、`ref`、`className` 等
 *
 * Agent 不应修改本文件。
 */

import type { ReactNode } from 'react';

export interface VendorButtonProps {
  children?: ReactNode;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function VendorButton(props: VendorButtonProps) {
  // 注意：明确解构 4 个 prop，**不接收** ...rest，
  // 任何额外属性（slotProps / ref / className / onClick）都会被丢弃。
  const { children, onPress, loading, disabled } = props;

  const blocked = loading || disabled;

  return (
    <button
      type="button"
      disabled={blocked}
      onClick={() => {
        if (!blocked) {
          onPress?.();
        }
      }}
    >
      {loading ? <span aria-label="loading">⏳</span> : null}
      {children}
    </button>
  );
}
