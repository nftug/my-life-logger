import {
  createCategory,
  deleteCategory,
  getAllCategories,
  renameCategory,
} from '@/generated/commands'

export const categoryApi = {
  getAll: getAllCategories,
  create: createCategory,
  rename: renameCategory,
  delete: deleteCategory,
}
