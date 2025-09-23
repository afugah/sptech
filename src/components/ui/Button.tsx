import classNames from 'classnames';
import React from 'react';
import Loader from './Loader';

enum ButtonTypeEnum {
  Outline = 'OUTLINE',
  Filled = 'FILLED',
}

enum ButtonColorEnum {
  Dark = 'DARK',
  Light = 'LIGHT',
}

enum ButtonSizeEnum {
  Small = 'SMALL',
  Medium = 'MEDIUM',
}

/* #region Styles */
const buttonVariants: Record<
  ButtonTypeEnum,
  Record<ButtonColorEnum, Record<'default' | 'hover' | 'active' | 'disabled', string>>
> = {
  [ButtonTypeEnum.Outline]: {
    [ButtonColorEnum.Dark]: {
      default: 'border-black bg-transparent text-black',
      hover: 'hover:bg-black hover:text-white',
      active: 'active:bg-gray-900 active:text-white',
      disabled: 'disabled:border-gray disabled:bg-transparent disabled:text-gray',
    },
    [ButtonColorEnum.Light]: {
      default: 'border-white bg-transparent text-white',
      hover: 'hover:bg-white hover:text-black',
      active: 'active:border-black active:bg-black active:text-white',
      disabled: 'disabled:border-gray disabled:bg-transparent disabled:text-gray',
    },
  },
  [ButtonTypeEnum.Filled]: {
    [ButtonColorEnum.Dark]: {
      default: 'border-gray-900 bg-gray-900 text-white',
      hover: 'hover:bg-black',
      active: 'active:bg-gray-700',
      disabled: 'disabled:border-gray disabled:bg-gray disabled:text-gray-200',
    },
    [ButtonColorEnum.Light]: {
      default: 'border-white bg-white text-black',
      hover: 'hover:border-black hover:bg-black hover:text-white',
      active: 'active:border-creme active:bg-creme active:text-black',
      disabled: 'disabled:border-gray disabled:bg-gray disabled:text-gray-200',
    },
  },
};
/* #endregion */

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: string | React.ReactNode;

  type?: 'button' | 'reset' | 'submit' | undefined;
  disabled?: boolean;
  loading?: boolean;
  buttonType?: ButtonTypeEnum;
  buttonColor?: ButtonColorEnum;
  buttonSize?: ButtonSizeEnum;

  className?: string;
  textClassName?: string;
}

interface IButtonComponent extends React.FC<IButtonProps> {
  Type: typeof ButtonTypeEnum;
  Color: typeof ButtonColorEnum;
  Size: typeof ButtonSizeEnum;
}

export const Button: IButtonComponent = (props) => {
  const {
    type = 'button',
    buttonType = ButtonTypeEnum.Outline,
    buttonColor = ButtonColorEnum.Dark,
    buttonSize = ButtonSizeEnum.Medium,
    children,
    disabled = false,
    loading = false,
    className,
    textClassName,
    ...restProps
  } = props;

  const styles = buttonVariants[buttonType][buttonColor];

  const isDisabled = disabled || loading;

  const buttonClassName = classNames(
    'box-border flex-shrink-0 relative border px-6 text-sm font-bold uppercase tracking-wide transition-colors duration-200 ease-in-out',
    {
      'py-1.5': buttonSize === ButtonSizeEnum.Small,
      'py-4': buttonSize === ButtonSizeEnum.Medium,
      [styles.default]: !isDisabled,
      [styles.hover]: !isDisabled,
      [styles.active]: !isDisabled,
      [styles.disabled]: isDisabled,
    },
    isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
    className,
  );

  return (
    <button type={type} className={buttonClassName} disabled={isDisabled} {...restProps}>
      {loading && (
        <Loader inverted={buttonColor === ButtonColorEnum.Light} className={'!inset-2 [&>div]:h-6 [&>div]:w-6'} />
      )}

      <span
        className={classNames(
          {
            invisible: loading,
          },
          textClassName,
        )}
      >
        {children}
      </span>
    </button>
  );
};

Button.Type = ButtonTypeEnum;
Button.Color = ButtonColorEnum;
Button.Size = ButtonSizeEnum;
