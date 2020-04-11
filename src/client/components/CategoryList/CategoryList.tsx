import React from 'react';
import Category from '../../../types/Category';
import CategoryListItem from './CategoryListItem';
import './CategoryList.scss';
interface Props {
  categories: Category[];
}

const List: React.FC<Props> = ({ categories }) => {
  return (
    <div className="category-list">
      {categories.map((category) => (
        <CategoryListItem key={category.categoryId} category={category} />
      ))}
    </div>
  );
};
export default List;
