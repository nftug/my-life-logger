import {
  cancelActiveActivity,
  deleteCompletedActivity,
  getActivityState,
  saveActiveActivity,
  saveCompletedActivity,
  startActivity,
  stopActivity,
} from '@/generated/commands'
import { onActivityStateEvent } from '@/generated/events'

export const activityApi = {
  getState: getActivityState,
  start: startActivity,
  stop: stopActivity,
  cancel: cancelActiveActivity,
  saveActive: saveActiveActivity,
  saveCompleted: saveCompletedActivity,
  deleteCompleted: deleteCompletedActivity,
  onStateEvent: onActivityStateEvent,
}
