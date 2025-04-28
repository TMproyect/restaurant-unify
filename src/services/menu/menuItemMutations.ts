
// This file re-exports all menu item mutations from the modular files
// for backward compatibility
import { createMenuItem } from './mutations/createMenuItem';
import { updateMenuItem } from './mutations/updateMenuItem';
import { deleteMenuItem } from './mutations/deleteMenuItem';

export {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
