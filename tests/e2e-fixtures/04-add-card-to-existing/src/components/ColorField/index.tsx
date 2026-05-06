import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  COMPONENT_STATE_KEY,
  type BaseUIProps,
} from 'cdp-material-sdk/portable';

export interface ColorFieldProps extends BaseUIProps<HTMLDivElement> {
  value?: string;
  readOnly?: boolean;
  placeholder?: string;
  onChange?: (nextValue: string) => void;
}

export const ColorField = forwardRef<unknown, ColorFieldProps>(function ColorField(props, ref) {
  const { value = '#000000', readOnly, placeholder, onChange, slotProps } = props;
  const [internal, setInternal] = useState(value);

  useImperativeHandle(ref, () => ({
    getValue: () => internal,
    setValue: (next: string) => {
      setInternal(next);
      onChange?.(next);
    },
    [COMPONENT_STATE_KEY]: {
      currentColor: internal,
    },
  }), [internal, onChange]);

  return (
    <div {...slotProps?.root}>
      <input
        type="color"
        value={internal}
        disabled={readOnly}
        title={placeholder}
        onChange={(event) => {
          const next = event.target.value;
          setInternal(next);
          onChange?.(next);
        }}
      />
    </div>
  );
});
