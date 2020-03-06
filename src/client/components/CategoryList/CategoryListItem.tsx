import React from "react";
import Category from "../../../types/Category";
import "./CategoryListItem.scss";

interface Props {
  category: Category;
}

const CategoryListItem: React.FC<Props> = ({ category }) => {
  return <div className="category-list-item">{category.name}</div>;
};

export default CategoryListItem;
