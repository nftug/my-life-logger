interface TabOption<T extends string> {
  label: string
  value: T
}

interface SegmentedTabsProps<T extends string> {
  ariaLabel: string
  tabs: TabOption<T>[]
  value: T
  onChange: (value: T) => void
}

const SegmentedTabs = <T extends string>({
  ariaLabel,
  tabs,
  value,
  onChange,
}: SegmentedTabsProps<T>) => (
  <div className="tabs tabs-boxed w-fit bg-base-200/70 p-1" role="tablist" aria-label={ariaLabel}>
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        role="tab"
        aria-selected={value === tab.value}
        className={`tab h-9 ${value === tab.value ? 'tab-active font-medium' : ''}`}
        onClick={() => onChange(tab.value)}
      >
        {tab.label}
      </button>
    ))}
  </div>
)

export default SegmentedTabs
