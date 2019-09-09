import { Label } from 'elements';
import React from 'react';
import { toast as toastify } from 'react-toastify';

let toastId = ''

export const toast = (
  msg,
  variants = {
    variant: 'default',
    position: "TOP_RIGHT",
  }
) => {
  if (toastify.isActive(toastId))
    return;

  if (variants.variant === 'default') {
    toastId = toastify(<Label >{msg}</Label>);
  } else {
    toastId = toastify[variants.variant](<Label>{msg}</Label>);
  }
}
