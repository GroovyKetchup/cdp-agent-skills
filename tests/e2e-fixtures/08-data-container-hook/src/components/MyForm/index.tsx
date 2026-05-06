import { forwardRef, type ReactNode } from 'react';
import {
  type BaseUIProps,
} from 'cdp-material-sdk/portable';
import { useDataContainer } from 'cdp-material-sdk/host-react';

export interface MyFormProps extends BaseUIProps<HTMLDivElement> {
  children?: ReactNode;
}

interface FormData {
  [key: string]: unknown;
}

/**
 * 故意写错（用于 e2e 测试场景 08）：
 *
 * 这里用了订阅式 `useDataContainer`，订阅整个 containerData。
 * 任意字段输入 → containerData 变化 → MyForm 整体重渲染 → 所有 children 也重渲染。
 *
 * 正确做法：
 * - 用命令式 `useDataContainerApi`（仅 `getContainerData` / `setContainerData`，不订阅整体）
 * - children 用 `DataScope` 包裹，每个字段独立订阅自己的子树
 *
 * Agent 应识别这个误用并重构。
 */
export const MyForm = forwardRef<HTMLDivElement, MyFormProps>(function MyForm(props, ref) {
  const { children, slotProps } = props;

  // ❌ 错用：订阅式 hook 订阅整个容器
  const result = useDataContainer<FormData>();

  // 任意字段变化都会触发这条日志（证明整体重渲染）
  console.log('[MyForm] rendered with', result.containerData);

  return (
    <div ref={ref} {...slotProps?.root}>
      {children}
    </div>
  );
});
