import type { Tag } from '../../types'

interface Props {
  tags: Tag[]
  selected: string
  onSelect: (tag: string) => void
}

export default function TagFilter({ tags, selected, onSelect }: Props) {
  if (tags.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onSelect('')}
        className={`px-3 py-1 text-xs rounded-full transition-colors ${
          !selected ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onSelect(selected === tag.name ? '' : tag.name)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            selected === tag.name ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          {tag.name}
        </button>
      ))}
    </div>
  )
}
