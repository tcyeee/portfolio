import { useEffect, useState } from 'react';

interface TagFilterProps {
  tags: string[];
  onFilterChange?: (selectedTags: string[]) => void;
}

export default function TagFilter({ tags, onFilterChange }: TagFilterProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    // 调用筛选函数
    const filterFn = (window as any).filterArticles;
    if (filterFn && typeof filterFn === 'function') {
      filterFn(selectedTags);
    }
    
    // 如果有回调函数，也调用它
    if (onFilterChange) {
      onFilterChange(selectedTags);
    }
  }, [selectedTags, onFilterChange]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const clearFilter = () => {
    setSelectedTags([]);
  };

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-3 justify-center">
        {tags.map((tag) => {
          const isActive = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-lg transition-colors border ${
                isActive
                  ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
      {selectedTags.length > 0 && (
        <div className="text-center mt-4">
          <button
            onClick={clearFilter}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
          >
            清除筛选
          </button>
        </div>
      )}
    </div>
  );
}

