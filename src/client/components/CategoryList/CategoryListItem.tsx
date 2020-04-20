import React, { useState } from 'react';
import Category from '../../../types/Category';
import './CategoryListItem.scss';

interface Props {
  category: Category;
  node?: number;
  isParentOpen?: boolean;
}

const CategoryListItem: React.FC<Props> = ({
  isParentOpen = true,
  category,
  node = 0
}) => {
  const [isOpen, setOpen] = useState(false);
  const hasChildren = !!category.children.length;
  const onClick = (e) => {
    e.stopPropagation();
    setOpen(!isOpen);
  };
  const onLabelPress = (e) => {
    if (e.key === 'Enter') setOpen(!isOpen);
  };
  return (
    <div className="category-list-item">
      <div
        className="label"
        onClick={onClick}
        role="button"
        tabIndex={0}
        style={{ backgroundColor: `rgba(100, 100, 100, ${0 + node / 10})` }}
        onKeyDown={onLabelPress}
      >
        {category.name}
        {hasChildren && (
          <ion-icon name={`chevron-${isOpen ? 'up' : 'down'}-outline`} />
        )}
      </div>
      <div className={`children${isOpen && isParentOpen ? ' open' : ''}`}>
        {category.children &&
          category.children.map((c) => (
            <CategoryListItem
              key={c.categoryId}
              category={c}
              node={node + 1}
              isParentOpen={isOpen}
            />
          ))}
      </div>
    </div>
  );
};

export default CategoryListItem;
