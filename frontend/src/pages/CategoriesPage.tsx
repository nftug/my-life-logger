import { useCategoriesState } from '@/lib/ui/categories/hooks/useCategoriesState'
import { For, Show } from 'solid-js'

const CategoriesPage = () => {
  const model = useCategoriesState()

  return (
    <div class="page-content">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-2xl font-semibold">Categories</h1>
        <div class="badge badge-outline">{model.state.categoryCount()} categories</div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title text-lg">カテゴリを追加</h2>
          <form class="flex flex-wrap items-end gap-2" onSubmit={(event) => void model.actions.create(event)}>
            <label class="form-control flex-1">
              <div class="label">
                <span class="label-text">カテゴリ名</span>
              </div>
              <input
                type="text"
                class="input input-bordered w-full"
                value={model.state.newCategoryName()}
                onInput={(event) => model.actions.setNewCategoryName(event.currentTarget.value)}
                placeholder="例: 開発 / 勉強 / 休憩"
                maxlength={100}
              />
            </label>
            <button type="submit" class="btn btn-primary" disabled={model.state.pendingAction() !== null}>
              追加
            </button>
          </form>
        </div>
      </div>

      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <h2 class="card-title text-lg">カテゴリ一覧</h2>
            <button
              type="button"
              class="btn btn-sm"
              onClick={() => void model.actions.refresh()}
              disabled={model.state.pendingAction() !== null}
            >
              再読み込み
            </button>
          </div>

          <Show
            when={(model.state.categories()?.length ?? 0) > 0}
            fallback={
              <div class="rounded-box border border-dashed border-base-300 p-6 text-center">
                カテゴリはまだありません。
              </div>
            }
          >
            <div class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th class="w-2/5">名前</th>
                    <th>状態</th>
                    <th class="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={model.state.categories() ?? []}>
                    {(category) => (
                      <tr>
                        <td>
                          <Show
                            when={model.state.editingId() === category.id}
                            fallback={<span class="font-medium">{category.name}</span>}
                          >
                            <input
                              type="text"
                              class="input input-bordered input-sm w-full"
                              value={model.state.renameDraft()}
                              onInput={(event) => model.actions.setRenameDraft(event.currentTarget.value)}
                              maxlength={100}
                            />
                          </Show>
                        </td>
                        <td>
                          <Show
                            when={model.state.editingId() === category.id}
                            fallback={<span class="badge badge-outline">saved</span>}
                          >
                            <span class="badge badge-info badge-outline">editing</span>
                          </Show>
                        </td>
                        <td>
                          <div class="flex justify-end gap-2">
                            <Show
                              when={model.state.editingId() === category.id}
                              fallback={
                                <button
                                  type="button"
                                  class="btn btn-xs"
                                  onClick={() => model.actions.startRename(category.id, category.name)}
                                  disabled={model.state.pendingAction() !== null}
                                >
                                  リネーム
                                </button>
                              }
                            >
                              <button
                                type="button"
                                class="btn btn-xs btn-primary"
                                onClick={() => void model.actions.rename(category.id)}
                                disabled={model.state.pendingAction() !== null}
                              >
                                保存
                              </button>
                              <button
                                type="button"
                                class="btn btn-xs"
                                onClick={model.actions.cancelRename}
                                disabled={model.state.pendingAction() !== null}
                              >
                                キャンセル
                              </button>
                            </Show>
                            <button
                              type="button"
                              class="btn btn-error btn-xs btn-outline"
                              onClick={() => void model.actions.remove(category)}
                              disabled={model.state.pendingAction() !== null}
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}

export default CategoriesPage
