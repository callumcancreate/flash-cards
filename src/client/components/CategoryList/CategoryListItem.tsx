import React, { useState } from "react";
import Category from "../../../types/Category";
import "./CategoryListItem.scss";

interface Props {
  category: Category;
}

const CategoryListItem: React.FC<Props> = ({ category }) => {
  const [isOpen, setOpen] = useState(true);
  return (
    <div className="category-list-item">
      <div className="label">{category.name}</div>
      <div className={`children`}>
        {category.children &&
          category.children.map(c => (
            <CategoryListItem key={c.categoryId} category={c} />
          ))}
      </div>
    </div>
  );
};

export default CategoryListItem;
