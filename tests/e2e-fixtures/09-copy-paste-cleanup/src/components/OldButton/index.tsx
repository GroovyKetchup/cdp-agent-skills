import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  COMPONENT_STATE_KEY,
  type BaseUIProps,
} from 'cdp-material-sdk/portable';

export interface OldButtonProps extends BaseUIProps<HTMLDivElement> {
  label?: string;
  placeholder?: string;
  variant?: 'default' | 'primary' | 'danger';
  readOnly?: boolean;          // DATA_FIELD 自动注入 → adapter 映射为 vendor 的 disabled
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const OldButton = forwardRef<unknown, OldButtonProps>(function OldButton(props, ref) {
  const { label, placeholder, variant = 'default', readOnly, onClick, onFocus, onBlur, slotProps } = props;
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    click: () => {
      if (!readOnly && !loading) {
        onClick?.();
      }
    },
    setLoading: (params: { loading: boolean }) => {
      setLoading(params.loading);
    },
    getLoading: () => loading,
    [COMPONENT_STATE_KEY]: {
      loading,
    },
  }), [readOnly, loading, onClick]);

  return (
    <div {...slotProps?.root}>
      <button
        type="button"
        title={placeholder}
        disabled={readOnly || loading}
        data-variant={variant}
        onClick={() => {
          if (!readOnly && !loading) {
            onClick?.();
          }
        }}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {loading ? <span aria-label="loading">⏳</span> : null}
        {label}
      </button>
    </div>
  );
});
