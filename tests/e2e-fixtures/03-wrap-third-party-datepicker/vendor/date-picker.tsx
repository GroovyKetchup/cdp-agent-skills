/**
 * 第三方 DatePicker（stub）— 模拟 antd-style 日期选择器。
 *
 * 关键设计（用于检验 Agent 是否正确加 wrapper）：
 * - 值 prop 是 `selectedDate: Date | null`（不是 `value`）
 * - 变化事件是 `onDateChange(date: Date | null)`（不是 `onChange`）
 * - **明确解构** props，剩余属性**丢弃** —— 不接受 `slotProps`、`ref` 等未知 DOM 属性
 *   - 这意味着 Agent 必须外层包 wrapper DOM 才能承接 `slotProps.root`
 *
 * Agent 不应修改本文件。
 */

import { useState, useRef, useEffect } from 'react';

export interface ThirdPartyDatePickerProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  dateFormat?: string;
}

export function ThirdPartyDatePicker(props: ThirdPartyDatePickerProps) {
  // 注意：明确解构 5 个 prop，**不接收** ...rest，
  // 任何额外属性（如 slotProps、ref、className）都会被丢弃。
  const { selectedDate, onDateChange, placeholder, disabled, dateFormat = 'yyyy-MM-dd' } = props;

  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && selectedDate) {
      inputRef.current.value = formatDate(selectedDate, dateFormat);
    }
  }, [selectedDate, dateFormat]);

  return (
    <input
      ref={inputRef}
      type="text"
      readOnly
      placeholder={placeholder}
      disabled={disabled}
      onClick={() => !disabled && setIsOpen(!isOpen)}
      onChange={(event) => {
        const text = event.target.value;
        const parsed = parseDate(text);
        onDateChange(parsed);
      }}
    />
  );
}

function formatDate(date: Date, format: string): string {
  const y = date.getFullYear().toString().padStart(4, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return format.replace('yyyy', y).replace('MM', m).replace('dd', d);
}

function parseDate(text: string): Date | null {
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}
