export default `
WITH parents AS (
  SELECT
    c.category_id,
    p.parent_id
  FROM
    categories c
  LEFT JOIN categories p ON c.parent_id = p.category_id
),
update_categories AS (
  UPDATE
    categories
  SET
    parent_id = p.parent_id
  FROM
    parents p
  WHERE
    categories.category_id = p.category_id
    AND categories.parent_id = $1)
DELETE FROM categories
WHERE category_id = $1
`;
