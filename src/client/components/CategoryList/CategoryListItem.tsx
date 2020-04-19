import React, { useState } from 'react';
import Category from '../../../types/Category';
import './CategoryListItem.scss';

interface Props {
  category: Category;
  node?: number;
}

const CategoryListItem: React.FC<Props> = ({ category, node = 0 }) => {
  const [isOpen, setOpen] = useState(false);
  const onClick = (e) => {
    e.stopPropagation();
    setOpen(!isOpen);
  };
  return (
    <div className="category-list-item" onClick={onClick}>
      <div
        className="label"
        style={{ backgroundColor: `rgba(100, 100, 100, ${0 + node / 10})` }}
      >
        {category.name}
      </div>
      <div className={`children${isOpen ? ' open' : ''}`}>
        {category.children &&
          category.children.map((c) => (
            <CategoryListItem key={c.categoryId} category={c} node={node + 1} />
          ))}
      </div>
    </div>
  );
};

export default CategoryListItem;
