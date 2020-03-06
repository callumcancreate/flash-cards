import React from "react";
import Category from "../../../types/Category";
import CategoryListItem from "./CategoryListItem";

interface Props {
  categories: Category[];
}

const List: React.FC<Props> = ({ categories }) => {
  return (
    <div>
      {categories.map(category => (
        <CategoryListItem key={category.categoryId} category={category} />
      ))}
    </div>
  );
};
export default List;
